import {NextRequest, NextResponse} from "next/server";
import {CrmApiError, crmErrorResponse} from "@/lib/crm/errors";
import {verifyCheckoutPayment} from "@/lib/crm/whatsapp-checkout-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
    try {
        const payload = await request.json().catch(() => null);
        if (!payload || typeof payload !== "object" || Array.isArray(payload)) throw new CrmApiError("Invalid payment verification request.");
        return NextResponse.json(await verifyCheckoutPayment(payload), {headers: {"Cache-Control": "no-store"}});
    } catch (error) {
        const {message, status} = crmErrorResponse(error);
        return NextResponse.json({error: message}, {status});
    }
}
