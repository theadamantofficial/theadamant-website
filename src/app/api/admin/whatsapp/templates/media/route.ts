import {NextRequest, NextResponse} from "next/server";
import {crmErrorResponse, CrmApiError, getCrmRequestContext} from "@/lib/crm/auth";
import {uploadWhatsAppDocument} from "@/lib/crm/whatsapp-cloud";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
    try {
        await getCrmRequestContext(request);
        const form = await request.formData();
        const file = form.get("file");
        if (!(file instanceof File) || file.type !== "application/pdf" || !file.size || file.size > 10 * 1024 * 1024) {
            throw new CrmApiError("Choose a PDF up to 10 MB.");
        }
        const mediaId = await uploadWhatsAppDocument(file);
        return NextResponse.json({mediaId, filename: file.name});
    } catch (error) {
        const {message, status} = crmErrorResponse(error);
        return NextResponse.json({error: message}, {status});
    }
}
