import {crmFetch} from "@/features/crm/api";

const MAX_PDF_SIZE = 10 * 1024 * 1024;
// Leave room for multipart overhead below the serverless request-body limit.
const DIRECT_UPLOAD_SIZE = 4 * 1024 * 1024;
const MEDIA_ENDPOINT = "/api/admin/whatsapp/templates/media";

export async function uploadProposalPdf(file: File): Promise<{mediaId: string; filename: string}> {
    if (file.type !== "application/pdf" || !file.size || file.size > MAX_PDF_SIZE) {
        throw new Error("Choose a PDF up to 10 MB.");
    }
    if (file.size <= DIRECT_UPLOAD_SIZE) {
        const body = new FormData();
        body.set("file", file);
        return crmFetch(MEDIA_ENDPOINT, {method: "POST", body});
    }
    const prepared = await crmFetch<{path: string; signedUrl: string}>(MEDIA_ENDPOINT, {
        method: "POST", body: JSON.stringify({action: "prepare", filename: file.name}),
    });
    const body = new FormData();
    body.set("cacheControl", "3600");
    body.set("", file);
    const response = await fetch(prepared.signedUrl, {method: "PUT", body});
    if (!response.ok) {
        const error = await response.json().catch(() => ({})) as {message?: unknown; error?: unknown};
        const detail = typeof error.message === "string" ? error.message : typeof error.error === "string" ? error.error : "";
        throw new Error(`PDF storage upload failed (${response.status})${detail ? `: ${detail}` : ". Check the WhatsApp document bucket configuration."}`);
    }
    return crmFetch(MEDIA_ENDPOINT, {
        method: "POST", body: JSON.stringify({action: "complete", path: prepared.path, filename: file.name}),
    });
}
