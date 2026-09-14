import {beforeEach, describe, expect, it, vi} from "vitest";
import {NextRequest} from "next/server";
import {CrmApiError} from "@/lib/crm/errors";

const mocks = vi.hoisted(() => ({
    getContext: vi.fn(), from: vi.fn(), select: vi.fn(), eq: vi.fn(), order: vi.fn(), limit: vi.fn(),
    insert: vi.fn(), update: vi.fn(), delete: vi.fn(), single: vi.fn(), maybeSingle: vi.fn(),
}));
vi.mock("@/lib/crm/server-client", () => ({getCrmServiceClient: () => mocks}));
vi.mock("@/lib/crm/auth", async () => ({
    ...await vi.importActual<typeof import("@/lib/crm/auth")>("@/lib/crm/auth"),
    getCrmRequestContext: mocks.getContext,
}));
import * as projects from "@/app/api/admin/projects/route";
import * as testimonials from "@/app/api/admin/testimonials/route";
import {GET as publicGET} from "@/app/api/projects/route";

const id = "00000000-0000-4000-8000-000000000001";
const project = {
    name: "Example Website", category: "Websites", label: "Client project",
    description: "A responsive website for a local business.", href: "https://example.com",
    image: "", imageAlt: "", highlights: ["Responsive design"], theme: "teal", status: "draft", sort_order: 2,
};
const testimonial = {name: "Alex Taylor", email: "alex@example.com", company: "Example Ltd", rating: 4,
    message: "Adamant helped us launch our new website.", consent: true, status: "approved"};
function request(method: string, payload?: unknown, origin?: string) {
    return new NextRequest("https://theadamant.com/api/admin/content", {
        method, headers: {"Content-Type": "application/json", ...(origin ? {Origin: origin} : {})},
        ...(payload === undefined ? {} : {body: JSON.stringify(payload)}),
    });
}

describe("content management APIs", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        for (const fn of [mocks.from, mocks.select, mocks.eq, mocks.order, mocks.insert, mocks.update, mocks.delete]) fn.mockReturnValue(mocks);
        mocks.getContext.mockResolvedValue({actor: {id: "admin-id", role: "admin"}});
        mocks.limit.mockResolvedValue({data: [], error: null});
        mocks.single.mockResolvedValue({data: {id, ...project, image_alt: ""}, error: null});
        mocks.maybeSingle.mockResolvedValue({data: {id, ...project, image_alt: ""}, error: null});
    });
    for (const [name, api, payload] of [["projects", projects, project], ["testimonials", testimonials, testimonial]] as const) {
        describe(name, () => {
            it("requires authentication for every management action", async () => {
                mocks.getContext.mockRejectedValue(new CrmApiError("Sign in.", 401));
                for (const method of ["GET", "POST", "PATCH", "DELETE"] as const) {
                    expect((await api[method](request(method, method === "GET" ? undefined : {...payload, id}))).status).toBe(401);
                }
                expect(mocks.from).not.toHaveBeenCalled();
            });
            it.each(["employee", "cto", "developer", "qa"])("blocks %s from adding, editing, deleting, and reading", async (role) => {
                mocks.getContext.mockResolvedValue({actor: {id: "user", role}});
                for (const method of ["GET", "POST", "PATCH", "DELETE"] as const) {
                    expect((await api[method](request(method, method === "GET" ? undefined : {...payload, id}))).status).toBe(403);
                }
                expect(mocks.from).not.toHaveBeenCalled();
            });
            it("creates a record for an admin", async () => {
                expect((await api.POST(request("POST", payload))).status).toBe(201);
                expect(mocks.insert).toHaveBeenCalled();
            });
            it("validates edits before updating", async () => {
                expect((await api.PATCH(request("PATCH", {...payload, id, name: "a"}))).status).toBe(400);
                expect(mocks.update).not.toHaveBeenCalled();
            });
            it("saves full edits and rejects fields outside the editable schema", async () => {
                expect((await api.PATCH(request("PATCH", {...payload, id, name: "Updated Client", created_by: "other"}))).status).toBe(200);
                expect(mocks.update.mock.calls[0][0].name).toBe("Updated Client");
                expect(mocks.update.mock.calls[0][0]).not.toHaveProperty("created_by");
            });
            it("deletes only the selected record", async () => {
                expect((await api.DELETE(request("DELETE", {id}))).status).toBe(200);
                expect(mocks.delete).toHaveBeenCalled();
                expect(mocks.eq).toHaveBeenCalledWith("id", id);
            });
            it("returns 404 when editing or deleting a missing record", async () => {
                mocks.maybeSingle.mockResolvedValue({data: null, error: null});
                expect((await api.PATCH(request("PATCH", {...payload, id}))).status).toBe(404);
                expect((await api.DELETE(request("DELETE", {id}))).status).toBe(404);
            });
            it("does not claim success for failed database mutations", async () => {
                mocks.single.mockResolvedValue({data: null, error: {code: "42P01"}});
                mocks.maybeSingle.mockResolvedValue({data: null, error: {code: "42P01"}});
                expect((await api.POST(request("POST", payload))).status).toBe(503);
                expect((await api.PATCH(request("PATCH", {...payload, id}))).status).toBe(503);
                expect((await api.DELETE(request("DELETE", {id}))).status).toBe(503);
            });
            it("rejects cross-origin writes and malformed payloads", async () => {
                expect((await api.POST(request("POST", payload, "https://evil.example"))).status).toBe(403);
                expect((await api.POST(request("POST", null))).status).toBe(400);
                expect((await api.POST(request("POST", []))).status).toBe(400);
                expect(mocks.insert).not.toHaveBeenCalled();
            });
        });
    }
    it("requires publication consent when an admin adds a testimonial", async () => {
        expect((await testimonials.POST(request("POST", {...testimonial, consent: false}))).status).toBe(400);
        expect(mocks.insert).not.toHaveBeenCalled();
    });
    it("reads published projects only, without exposing admin fields or substituting deleted static entries", async () => {
        const response = await publicGET();
        expect(response.status).toBe(200);
        expect(await response.json()).toEqual({projects: []});
        expect(mocks.eq).toHaveBeenCalledWith("status", "published");
        expect(mocks.select.mock.calls[0][0]).not.toContain("created_by");
        expect(mocks.select.mock.calls[0][0]).not.toContain("status");
    });
    it("maps stored screenshot descriptions for the public view", async () => {
        mocks.limit.mockResolvedValue({data: [{id, image_alt: "Project homepage"}], error: null});
        expect(await (await publicGET()).json()).toEqual({projects: [{id, imageAlt: "Project homepage"}]});
    });
});
