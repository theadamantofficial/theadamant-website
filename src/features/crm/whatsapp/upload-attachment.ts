import {crmFetch} from "@/features/crm/api";
import {
    type WhatsAppAttachment,
    WHATSAPP_DIRECT_UPLOAD_SIZE,
    validateWhatsAppAttachment,
} from "@/lib/crm/whatsapp-attachments";

const MEDIA_ENDPOINT = "/api/admin/whatsapp/media";

export async function uploadWhatsAppAttachment(file: File): Promise<WhatsAppAttachment> {
    const attachment = validateWhatsAppAttachment(file.name, file.type, file.size);
    if (file.size <= WHATSAPP_DIRECT_UPLOAD_SIZE) {
        const body = new FormData();
        body.set("file", file);
        return crmFetch(MEDIA_ENDPOINT, {method: "POST", body});
    }

    const prepared = await crmFetch<{path: string; signedUrl: string}>(MEDIA_ENDPOINT, {
        method: "POST",
        body: JSON.stringify({
            action: "prepare",
            filename: attachment.filename,
            mimeType: attachment.mimeType,
            size: file.size,
        }),
    });
    const body = new FormData();
    body.set("cacheControl", "3600");
    body.set("", file);
    const response = await fetch(prepared.signedUrl, {method: "PUT", body});
    if (!response.ok) {
        const error = await response.json().catch(() => ({})) as {message?: unknown; error?: unknown};
        const detail = typeof error.message === "string" ? error.message : typeof error.error === "string" ? error.error : "";
        throw new Error(`Attachment storage upload failed (${response.status})${detail ? `: ${detail}` : ". Check the WhatsApp media bucket configuration."}`);
    }
    return crmFetch(MEDIA_ENDPOINT, {
        method: "POST",
        body: JSON.stringify({
            action: "complete",
            path: prepared.path,
            filename: attachment.filename,
            mimeType: attachment.mimeType,
            size: file.size,
        }),
    });
}
