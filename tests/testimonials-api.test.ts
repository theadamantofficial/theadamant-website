import {beforeEach, describe, expect, it, vi} from "vitest";
import {NextRequest} from "next/server";
import {CrmApiError} from "@/lib/crm/errors";

const mocks = vi.hoisted(() => ({
    from: vi.fn(), rpc: vi.fn(), getContext: vi.fn(),
    select: vi.fn(), eq: vi.fn(), order: vi.fn(), limit: vi.fn(), update: vi.fn(), maybeSingle: vi.fn(),
}));

vi.mock("@/lib/crm/server-client", () => ({getCrmServiceClient: () => ({from: mocks.from, rpc: mocks.rpc})}));
vi.mock("@/lib/crm/auth", async () => ({
    ...await vi.importActual<typeof import("@/lib/crm/auth")>("@/lib/crm/auth"),
    getCrmRequestContext: mocks.getContext,
}));

import {GET, POST} from "@/app/api/testimonials/route";
import {GET as adminGET, PATCH} from "@/app/api/admin/testimonials/route";

const valid = {
    name: "Alex Taylor", email: "alex@example.com", company: "Example Ltd", rating: 5,
    message: "Adamant helped us launch our new website.", consent: true, status: "approved",
};
const id = "00000000-0000-4000-8000-000000000001";
const request = (payload: unknown, method = "POST", origin?: string) => new NextRequest("https://theadamant.com/api/testimonials", {
    method, headers: {"Content-Type": "application/json", ...(origin ? {Origin: origin} : {})}, body: JSON.stringify(payload),
});

describe("testimonial APIs", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        for (const fn of [mocks.from, mocks.select, mocks.eq, mocks.order, mocks.update]) fn.mockReturnValue(mocks);
        mocks.limit.mockResolvedValue({data: [], error: null});
        mocks.rpc.mockResolvedValue({data: null, error: null});
        mocks.maybeSingle.mockResolvedValue({data: {id, status: "approved"}, error: null});
        mocks.getContext.mockResolvedValue({actor: {role: "admin"}});
    });

    it("reads only approved testimonials and does not select emails or consent records", async () => {
        expect((await GET()).status).toBe(200);
        expect(mocks.select).toHaveBeenCalledWith("id,name,company,rating,message,created_at");
        expect(mocks.eq).toHaveBeenCalledWith("status", "approved");
    });

    it("saves through the database rate limiter and returns pending status", async () => {
        const response = await POST(request(valid));
        expect(response.status).toBe(201);
        expect(await response.json()).toEqual({success: true, status: "pending"});
        expect(mocks.rpc).toHaveBeenCalledWith("submit_testimonial", {
            p_name: valid.name, p_email: valid.email, p_company: valid.company,
            p_rating: valid.rating, p_message: valid.message,
        });
    });

    it("returns a rate limit response for duplicate submissions", async () => {
        mocks.rpc.mockResolvedValue({error: {code: "P0001"}});
        expect((await POST(request(valid))).status).toBe(429);
    });

    it("does not report success when persistence fails", async () => {
        mocks.rpc.mockResolvedValue({error: {code: "42P01"}});
        expect((await POST(request(valid))).status).toBe(503);
    });

    it("shows an availability error for failed reads", async () => {
        mocks.limit.mockResolvedValue({error: {code: "42P01"}});
        expect((await GET()).status).toBe(503);
    });

    it("rejects malformed JSON", async () => {
        const response = await POST(new NextRequest("https://theadamant.com/api/testimonials", {method: "POST", body: "{"}));
        expect(response.status).toBe(400);
        expect(mocks.rpc).not.toHaveBeenCalled();
    });

    it("rejects invalid details before writing", async () => {
        expect((await POST(request({...valid, consent: false}))).status).toBe(400);
        expect(mocks.rpc).not.toHaveBeenCalled();
    });

    it("rejects cross-origin and oversized submissions", async () => {
        expect((await POST(request(valid, "POST", "https://another-site.com"))).status).toBe(403);
        expect((await POST(request({...valid, message: "a".repeat(16001)}))).status).toBe(413);
        expect(mocks.rpc).not.toHaveBeenCalled();
    });

    it("requires authentication before reading private submissions", async () => {
        mocks.getContext.mockRejectedValue(new CrmApiError("Sign in again.", 401));
        expect((await adminGET(new NextRequest("https://theadamant.com/api/admin/testimonials"))).status).toBe(401);
        expect(mocks.from).not.toHaveBeenCalled();
    });

    it.each(["employee", "cto", "developer", "qa"])("blocks %s from private submissions and moderation", async (role) => {
        mocks.getContext.mockResolvedValue({actor: {role}});
        expect((await adminGET(new NextRequest("https://theadamant.com/api/admin/testimonials"))).status).toBe(403);
        expect((await PATCH(request({id, status: "approved"}, "PATCH"))).status).toBe(403);
        expect(mocks.from).not.toHaveBeenCalled();
    });

    it("allows admins to approve submissions without altering testimonial text", async () => {
        const response = await PATCH(request({id, status: "approved", message: "Altered"}, "PATCH"));
        expect(response.status).toBe(200);
        expect(mocks.update).toHaveBeenCalledWith({status: "approved"});
        expect(mocks.eq).toHaveBeenCalledWith("id", id);
    });

    it("rejects invalid moderation and returns 404 for missing records", async () => {
        expect((await PATCH(request({id, status: "deleted"}, "PATCH"))).status).toBe(400);
        mocks.maybeSingle.mockResolvedValue({data: null, error: null});
        expect((await PATCH(request({id, status: "approved"}, "PATCH"))).status).toBe(404);
    });
});
