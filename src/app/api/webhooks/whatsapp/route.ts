import {NextRequest, NextResponse} from "next/server";
import {crmErrorResponse, CrmApiError} from "@/lib/crm/errors";
import {getWhatsAppWebhookChallenge, parseWhatsAppWebhook, processWhatsAppWebhook, verifyWhatsAppWebhookSignature} from "@/lib/crm/whatsapp-cloud";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
    try {
        const challenge = getWhatsAppWebhookChallenge(request.nextUrl.searchParams);
        return new NextResponse(challenge, {status: 200, headers: {"Content-Type": "text/plain"}});
    } catch (error) {
        const {message, status} = crmErrorResponse(error);
        return NextResponse.json({error: message}, {status});
    }
}

export async function POST(request: NextRequest) {
    try {
        const rawBody = await request.text();
        if (!verifyWhatsAppWebhookSignature(rawBody, request.headers.get("x-hub-signature-256"))) {
            throw new CrmApiError("Invalid WhatsApp webhook signature.", 401);
        }
        let payload: unknown;
        try {
            payload = JSON.parse(rawBody);
        } catch {
            throw new CrmApiError("Invalid WhatsApp webhook payload.", 400);
        }
        const events = parseWhatsAppWebhook(payload);
        const processed = await processWhatsAppWebhook(events);
        return NextResponse.json({received: true, processed});
    } catch (error) {
        const {message, status} = crmErrorResponse(error);
        return NextResponse.json({error: message}, {status});
    }
}
