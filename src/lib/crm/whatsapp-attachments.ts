export type WhatsAppAttachmentKind = "image" | "document";

export type WhatsAppAttachment = {
    mediaId: string;
    kind: WhatsAppAttachmentKind;
    filename: string;
    mimeType: string;
};

export const WHATSAPP_DIRECT_UPLOAD_SIZE = 4 * 1024 * 1024;
export const WHATSAPP_IMAGE_MAX_SIZE = 5 * 1024 * 1024;
export const WHATSAPP_DOCUMENT_MAX_SIZE = 10 * 1024 * 1024;

const IMAGE_TYPES = new Set(["image/jpeg", "image/png"]);
const DOCUMENT_TYPES = new Set([
    "application/pdf",
    "text/plain",
    "application/msword",
    "application/vnd.ms-excel",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
]);

export const WHATSAPP_ATTACHMENT_ACCEPT = [...IMAGE_TYPES, ...DOCUMENT_TYPES].join(",");

export function validateWhatsAppAttachment(filename: string, mimeType: string, size: number): Omit<WhatsAppAttachment, "mediaId"> {
    const normalizedFilename = filename.trim();
    const normalizedMimeType = mimeType.trim().toLowerCase();
    const kind = IMAGE_TYPES.has(normalizedMimeType) ? "image" : DOCUMENT_TYPES.has(normalizedMimeType) ? "document" : null;
    if (!normalizedFilename || normalizedFilename.length > 180 || /[/\\\u0000-\u001f]/.test(normalizedFilename)) {
        throw new Error("Choose a file with a valid name up to 180 characters.");
    }
    if (!kind) throw new Error("Choose a JPG, PNG, PDF, text, Word, Excel, or PowerPoint file.");
    const maximumSize = kind === "image" ? WHATSAPP_IMAGE_MAX_SIZE : WHATSAPP_DOCUMENT_MAX_SIZE;
    if (!Number.isFinite(size) || size <= 0 || size > maximumSize) {
        throw new Error(kind === "image" ? "Choose an image up to 5 MB." : "Choose a document up to 10 MB.");
    }
    return {kind, filename: normalizedFilename, mimeType: normalizedMimeType};
}

export function parseWhatsAppAttachment(value: unknown): WhatsAppAttachment | null {
    if (!value || typeof value !== "object" || Array.isArray(value)) return null;
    const candidate = value as Partial<Record<keyof WhatsAppAttachment, unknown>>;
    const mediaId = typeof candidate.mediaId === "string" ? candidate.mediaId.trim() : "";
    const kind = candidate.kind === "image" || candidate.kind === "document" ? candidate.kind : null;
    const filename = typeof candidate.filename === "string" ? candidate.filename.trim() : "";
    const mimeType = typeof candidate.mimeType === "string" ? candidate.mimeType.trim().toLowerCase() : "";
    if (!/^\d+$/.test(mediaId) || !kind) throw new Error("Choose a valid WhatsApp attachment.");
    const validated = validateWhatsAppAttachment(filename, mimeType, 1);
    if (validated.kind !== kind) throw new Error("The WhatsApp attachment type does not match its file.");
    return {mediaId, ...validated};
}
