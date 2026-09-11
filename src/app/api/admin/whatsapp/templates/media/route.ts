import {NextRequest, NextResponse} from "next/server";
import {randomUUID} from "node:crypto";
import {crmErrorResponse, CrmApiError, getCrmRequestContext} from "@/lib/crm/auth";
import {getCrmServiceClient} from "@/lib/crm/server-client";
import {uploadWhatsAppDocument} from "@/lib/crm/whatsapp-cloud";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
    try {
        const {client} = await getCrmRequestContext(request);
        const {data, error} = await client.from("whatsapp_template_documents")
            .select("media_id,filename,created_at")
            .order("created_at", {ascending: false})
            .limit(100);
        if (error) throw new CrmApiError("Previously uploaded PDFs could not be loaded. Apply the latest Supabase migration.", 502);
        return NextResponse.json({documents: data || []});
    } catch (error) {
        const {message, status} = crmErrorResponse(error);
        return NextResponse.json({error: message}, {status});
    }
}

export async function POST(request: NextRequest) {
    try {
        const {actor} = await getCrmRequestContext(request);
        if (request.headers.get("content-type")?.includes("application/json")) {
            const payload = await request.json() as {action?: unknown; filename?: unknown; path?: unknown};
            const serviceClient = getCrmServiceClient();
            if (payload.action === "prepare") {
                const filename = typeof payload.filename === "string" ? payload.filename.trim() : "";
                if (!filename.toLowerCase().endsWith(".pdf")) throw new CrmApiError("Choose a PDF file.");
                const path = `${actor.id}/${Date.now()}-${randomUUID()}.pdf`;
                const signed = await serviceClient.storage.from("whatsapp-template-documents").createSignedUploadUrl(path);
                if (signed.error || !signed.data) throw new CrmApiError("Could not prepare PDF upload.", 502);
                return NextResponse.json({path, signedUrl: signed.data.signedUrl});
            }
            if (payload.action === "complete" && typeof payload.path === "string" && typeof payload.filename === "string") {
                if (!payload.path.startsWith(`${actor.id}/`)) throw new CrmApiError("Invalid PDF upload.", 400);
                const stored = await serviceClient.storage.from("whatsapp-template-documents").download(payload.path);
                if (stored.error || !stored.data) throw new CrmApiError("The PDF upload could not be completed.", 502);
                const file = new File([stored.data], payload.filename, {type: "application/pdf"});
                const mediaId = await uploadWhatsAppDocument(file);
                const {error} = await serviceClient.from("whatsapp_template_documents").upsert({
                    media_id: mediaId, filename: payload.filename, uploaded_by: actor.id,
                }, {onConflict: "media_id"});
                await serviceClient.storage.from("whatsapp-template-documents").remove([payload.path]);
                if (error) throw new CrmApiError("The PDF was uploaded but could not be saved for reuse.", 502);
                return NextResponse.json({mediaId, filename: payload.filename});
            }
            throw new CrmApiError("Invalid PDF upload request.", 400);
        }
        const form = await request.formData();
        const file = form.get("file");
        if (!(file instanceof File) || file.type !== "application/pdf" || !file.size || file.size > 10 * 1024 * 1024) {
            throw new CrmApiError("Choose a PDF up to 10 MB.");
        }
        const mediaId = await uploadWhatsAppDocument(file);
        const {error} = await getCrmServiceClient().from("whatsapp_template_documents").upsert({
            media_id: mediaId,
            filename: file.name,
            uploaded_by: actor.id,
        }, {onConflict: "media_id"});
        if (error) throw new CrmApiError("The PDF was uploaded but could not be saved for reuse.", 502);
        return NextResponse.json({mediaId, filename: file.name});
    } catch (error) {
        const {message, status} = crmErrorResponse(error);
        return NextResponse.json({error: message}, {status});
    }
}
