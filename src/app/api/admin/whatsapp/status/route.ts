import {NextRequest, NextResponse} from "next/server";
import {crmErrorResponse, getCrmRequestContext} from "@/lib/crm/auth";
import {getWhatsAppIntegrationStatus} from "@/lib/crm/whatsapp-cloud";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
    try {
        await getCrmRequestContext(request);
        return NextResponse.json({
            ...getWhatsAppIntegrationStatus(),
            callbackUrl: `${(process.env.NEXT_PUBLIC_SITE_URL || "https://theadamant.com").replace(/\/$/, "")}/api/webhooks/whatsapp`,
        });
    } catch (error) {
        const {message, status} = crmErrorResponse(error);
        return NextResponse.json({error: message}, {status});
    }
}
