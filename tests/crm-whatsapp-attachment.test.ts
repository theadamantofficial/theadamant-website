import {afterEach, describe, expect, it, vi} from "vitest";
import {uploadWhatsAppAttachment} from "@/features/crm/whatsapp/upload-attachment";
import {validateWhatsAppAttachment} from "@/lib/crm/whatsapp-attachments";

afterEach(() => vi.unstubAllGlobals());
const json = (data: unknown, status = 200) => new Response(JSON.stringify(data), {status, headers: {"Content-Type": "application/json"}});

describe("CRM WhatsApp attachments", () => {
    it("accepts supported images and documents with their respective limits", () => {
        expect(validateWhatsAppAttachment("reference.png", "image/png", 1024)).toMatchObject({kind: "image"});
        expect(validateWhatsAppAttachment("scope.docx", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", 1024)).toMatchObject({kind: "document"});
        expect(() => validateWhatsAppAttachment("vector.svg", "image/svg+xml", 1024)).toThrow("JPG, PNG");
        expect(() => validateWhatsAppAttachment("large.jpg", "image/jpeg", 5 * 1024 * 1024 + 1)).toThrow("5 MB");
    });

    it("uploads a small attachment directly through the authenticated CRM endpoint", async () => {
        const file = new File([new Uint8Array([1, 2, 3])], "reference.png", {type: "image/png"});
        const uploaded = {mediaId: "123", kind: "image", filename: file.name, mimeType: file.type};
        const fetcher = vi.fn().mockResolvedValue(json(uploaded));
        vi.stubGlobal("fetch", fetcher);

        await expect(uploadWhatsAppAttachment(file)).resolves.toEqual(uploaded);
        expect(fetcher.mock.calls[0][0]).toBe("/api/admin/whatsapp/media");
        expect(fetcher.mock.calls[0][1].body.get("file")).toBe(file);
    });

    it("stages larger attachments in private storage before uploading them to Meta", async () => {
        const file = new File([new Uint8Array(4 * 1024 * 1024 + 1)], "brief.pdf", {type: "application/pdf"});
        const uploaded = {mediaId: "456", kind: "document", filename: file.name, mimeType: file.type};
        const fetcher = vi.fn()
            .mockResolvedValueOnce(json({path: "actor/media", signedUrl: "https://storage.example/upload"}))
            .mockResolvedValueOnce(json({Key: "actor/media"}))
            .mockResolvedValueOnce(json(uploaded));
        vi.stubGlobal("fetch", fetcher);

        await expect(uploadWhatsAppAttachment(file)).resolves.toEqual(uploaded);
        expect(fetcher.mock.calls[1][0]).toBe("https://storage.example/upload");
        expect(JSON.parse(fetcher.mock.calls[2][1].body)).toMatchObject({action: "complete", filename: file.name, mimeType: file.type});
    });
});
