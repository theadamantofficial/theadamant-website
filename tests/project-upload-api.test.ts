import {beforeEach, describe, expect, it, vi} from "vitest";
import {NextRequest} from "next/server";
import {CrmApiError} from "@/lib/crm/errors";

const mocks = vi.hoisted(() => ({getContext: vi.fn(), from: vi.fn(), upload: vi.fn(), getPublicUrl: vi.fn()}));
vi.mock("@/lib/crm/server-client", () => ({getCrmServiceClient: () => ({storage: {from: mocks.from}})}));
vi.mock("@/lib/crm/auth", async () => ({
    ...await vi.importActual<typeof import("@/lib/crm/auth")>("@/lib/crm/auth"),
    getCrmRequestContext: mocks.getContext,
}));
import {POST} from "@/app/api/admin/projects/upload/route";

function uploadRequest(bytes: Uint8Array, type = "image/png", origin?: string) {
    const form = new FormData();
    form.set("file", new File([bytes as Uint8Array<ArrayBuffer>], "screenshot.png", {type}));
    return new NextRequest("https://theadamant.com/api/admin/projects/upload", {method: "POST", body: form, headers: origin ? {Origin: origin} : {}});
}
const png = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

describe("project screenshot uploads", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mocks.getContext.mockResolvedValue({actor: {role: "admin"}});
        mocks.from.mockReturnValue(mocks);
        mocks.upload.mockResolvedValue({error: null});
        mocks.getPublicUrl.mockReturnValue({data: {publicUrl: "https://storage.example.com/screenshot.png"}});
    });
    it("requires admin authorization before storing images", async () => {
        mocks.getContext.mockRejectedValue(new CrmApiError("Sign in.", 401));
        expect((await POST(uploadRequest(png))).status).toBe(401);
        expect(mocks.from).not.toHaveBeenCalled();
    });
    it("rejects employee uploads", async () => {
        mocks.getContext.mockResolvedValue({actor: {role: "employee"}});
        expect((await POST(uploadRequest(png))).status).toBe(403);
        expect(mocks.upload).not.toHaveBeenCalled();
    });
    it("rejects forged image types, unsupported files, and empty files", async () => {
        expect((await POST(uploadRequest(new TextEncoder().encode("<script>alert(1)</script>")))).status).toBe(400);
        expect((await POST(uploadRequest(png, "image/svg+xml"))).status).toBe(400);
        const emptyResponse = await POST(uploadRequest(new Uint8Array()));
        expect(emptyResponse.status).toBe(400);
        expect(mocks.upload).not.toHaveBeenCalled();
    });
    it("rejects oversized files", async () => {
        const response = await POST(uploadRequest(new Uint8Array(4 * 1024 * 1024 + 1)));
        expect(response.status).toBe(413);
        expect(mocks.upload).not.toHaveBeenCalled();
    });
    it("blocks cross-origin uploads", async () => {
        expect((await POST(uploadRequest(png, "image/png", "https://evil.example"))).status).toBe(403);
    });
    it("returns a durable public screenshot URL after upload", async () => {
        const response = await POST(uploadRequest(png));
        expect(response.status).toBe(201);
        expect(await response.json()).toEqual({url: "https://storage.example.com/screenshot.png"});
        expect(mocks.from).toHaveBeenCalledWith("project_images");
        expect(mocks.upload).toHaveBeenCalledWith(expect.stringMatching(/^screenshots\/[0-9a-f-]+\.png$/), png,
            {contentType: "image/png", cacheControl: "31536000", upsert: false});
    });
    it("does not return success when storage fails", async () => {
        mocks.upload.mockResolvedValue({error: {message: "Unavailable"}});
        expect((await POST(uploadRequest(png))).status).toBe(503);
    });
});
