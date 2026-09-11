import {NextRequest, NextResponse} from "next/server";
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
