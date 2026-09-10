import {NextRequest, NextResponse} from "next/server";
import {crmErrorResponse, getCrmRequestContext} from "@/lib/crm/auth";
import {getApprovedWhatsAppTemplates} from "@/lib/crm/whatsapp-cloud";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
    try {
        await getCrmRequestContext(request);
        const templates = await getApprovedWhatsAppTemplates();
        return NextResponse.json({templates});
    } catch (error) {
        const {message, status} = crmErrorResponse(error);
        return NextResponse.json({error: message}, {status});
    }
}
