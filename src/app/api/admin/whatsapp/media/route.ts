import {randomUUID} from "node:crypto";
import {NextRequest, NextResponse} from "next/server";
import {crmErrorResponse, CrmApiError, getCrmRequestContext} from "@/lib/crm/auth";
import {getCrmServiceClient} from "@/lib/crm/server-client";
import {uploadWhatsAppMedia} from "@/lib/crm/whatsapp-cloud";
import {validateWhatsAppAttachment} from "@/lib/crm/whatsapp-attachments";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BUCKET = "whatsapp-outbound-media";

export async function POST(request: NextRequest) {
    try {
        const {actor} = await getCrmRequestContext(request);
        if (request.headers.get("content-type")?.includes("application/json")) {
            const payload = await request.json() as {action?: unknown; filename?: unknown; mimeType?: unknown; size?: unknown; path?: unknown};
            const filename = typeof payload.filename === "string" ? payload.filename : "";
            const mimeType = typeof payload.mimeType === "string" ? payload.mimeType : "";
            const size = Number(payload.size);
            const attachment = validateForRequest(filename, mimeType, size);
            const serviceClient = getCrmServiceClient();

            if (payload.action === "prepare") {
                const path = `${actor.id}/${Date.now()}-${randomUUID()}`;
                const signed = await serviceClient.storage.from(BUCKET).createSignedUploadUrl(path);
                if (signed.error || !signed.data) throw new CrmApiError("Could not prepare the attachment upload. Apply the WhatsApp media storage migration.", 502);
                return NextResponse.json({path, signedUrl: signed.data.signedUrl});
            }

            if (payload.action === "complete" && typeof payload.path === "string") {
                if (!payload.path.startsWith(`${actor.id}/`)) throw new CrmApiError("Invalid attachment upload.", 400);
                const stored = await serviceClient.storage.from(BUCKET).download(payload.path);
                if (stored.error || !stored.data) throw new CrmApiError("The attachment upload could not be completed.", 502);
                try {
                    if (stored.data.size !== size) throw new CrmApiError("The uploaded attachment size did not match.", 400);
                    const file = new File([stored.data], attachment.filename, {type: attachment.mimeType});
                    const mediaId = await uploadWhatsAppMedia(file);
                    return NextResponse.json({mediaId, ...attachment});
                } finally {
                    await serviceClient.storage.from(BUCKET).remove([payload.path]);
                }
            }
            throw new CrmApiError("Invalid attachment upload request.", 400);
        }

        const form = await request.formData();
        const file = form.get("file");
        if (!(file instanceof File)) throw new CrmApiError("Choose an image or document.");
        const attachment = validateForRequest(file.name, file.type, file.size);
        const mediaId = await uploadWhatsAppMedia(file);
        return NextResponse.json({mediaId, ...attachment});
    } catch (error) {
        const {message, status} = crmErrorResponse(error);
        return NextResponse.json({error: message}, {status});
    }
}

function validateForRequest(filename: string, mimeType: string, size: number) {
    try {
        return validateWhatsAppAttachment(filename, mimeType, size);
    } catch (error) {
        throw new CrmApiError(error instanceof Error ? error.message : "Choose a valid image or document.");
    }
}
