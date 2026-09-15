import {NextRequest} from "next/server";
import {beforeEach, describe, expect, it, vi} from "vitest";

const mocks = vi.hoisted(() => ({
    context: vi.fn(),
    service: vi.fn(),
    upload: vi.fn(),
}));
vi.mock("@/lib/crm/auth", async () => ({
    ...await import("@/lib/crm/errors"),
    getCrmRequestContext: mocks.context,
}));
vi.mock("@/lib/crm/server-client", () => ({getCrmServiceClient: mocks.service}));
vi.mock("@/lib/crm/whatsapp-cloud", () => ({uploadWhatsAppMedia: mocks.upload}));
import {POST} from "@/app/api/admin/whatsapp/media/route";

const bucket = {
    createSignedUploadUrl: vi.fn(),
    download: vi.fn(),
    remove: vi.fn(),
};

beforeEach(() => {
    vi.clearAllMocks();
    mocks.context.mockResolvedValue({actor: {id: "actor-1"}});
    mocks.service.mockReturnValue({storage: {from: () => bucket}});
    mocks.upload.mockResolvedValue("123456789");
    bucket.remove.mockResolvedValue({error: null});
});

describe("CRM WhatsApp media upload API", () => {
    it("uploads a supported multipart image to Meta", async () => {
        const form = new FormData();
        form.set("file", new File([new Uint8Array([1, 2, 3])], "reference.png", {type: "image/png"}));
        const response = await POST(new NextRequest("https://theadamant.com/api/admin/whatsapp/media", {method: "POST", body: form}));

        expect(response.status).toBe(200);
        expect(await response.json()).toEqual({
            mediaId: "123456789",
            kind: "image",
            filename: "reference.png",
            mimeType: "image/png",
        });
        expect(mocks.upload).toHaveBeenCalledOnce();
    });

    it("rejects unsupported file types before contacting Meta", async () => {
        const form = new FormData();
        form.set("file", new File(["<svg/>"] , "unsafe.svg", {type: "image/svg+xml"}));
        const response = await POST(new NextRequest("https://theadamant.com/api/admin/whatsapp/media", {method: "POST", body: form}));

        expect(response.status).toBe(400);
        expect(mocks.upload).not.toHaveBeenCalled();
    });

    it("only completes staged uploads belonging to the signed-in CRM user", async () => {
        const response = await POST(new NextRequest("https://theadamant.com/api/admin/whatsapp/media", {
            method: "POST",
            body: JSON.stringify({
                action: "complete",
                path: "another-actor/media",
                filename: "brief.pdf",
                mimeType: "application/pdf",
                size: 100,
            }),
            headers: {"Content-Type": "application/json"},
        }));

        expect(response.status).toBe(400);
        expect(bucket.download).not.toHaveBeenCalled();
        expect(mocks.upload).not.toHaveBeenCalled();
    });
});
