import {NextRequest, NextResponse} from "next/server";
import {crmErrorResponse, CrmApiError, getCrmRequestContext} from "@/lib/crm/auth";
import {getCrmServiceClient} from "@/lib/crm/server-client";
import {
    loadAccessiblePaymentOrder,
    PAYMENT_ORDER_SELECT,
    requireAccessiblePaymentConversation,
    sendStoredOrderStatus,
    sendStoredPaymentOrder,
} from "@/lib/crm/whatsapp-payment-server";
import type {WhatsAppOrderStatus} from "@/lib/crm/whatsapp-payments";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Context = {params: Promise<{id: string}>};

const DEFAULT_STATUS_NOTES: Record<WhatsAppOrderStatus, string> = {
    processing: "Payment received. Your order is now being processed.",
    completed: "Your order has been completed. Thank you for choosing Adamant Technologies.",
    canceled: "This payment request has been canceled. Contact Adamant Technologies if you need a new request.",
};

export async function PATCH(request: NextRequest, context: Context) {
    try {
        const {client, actor} = await getCrmRequestContext(request);
        const {id} = await context.params;
        const order = await loadAccessiblePaymentOrder(client, id);
        const conversation = await requireAccessiblePaymentConversation(client, order.conversation_id);
        const payload = await request.json() as {action?: unknown; status?: unknown; description?: unknown};

        if (payload.action === "send") {
            await sendStoredPaymentOrder(conversation, order.id, actor.id);
        } else {
            const status = String(payload.status || "") as WhatsAppOrderStatus;
            if (!Object.prototype.hasOwnProperty.call(DEFAULT_STATUS_NOTES, status)) {
                throw new CrmApiError("Choose a valid order status.");
            }
            const description = String(payload.description || DEFAULT_STATUS_NOTES[status]).trim();
            if (!description || description.length > 120) throw new CrmApiError("The status note must be between 1 and 120 characters.");
            await sendStoredOrderStatus(conversation, order, status, description, actor.id);
        }

        const serviceClient = getCrmServiceClient();
        const {data, error} = await serviceClient.from("whatsapp_payment_orders")
            .select(PAYMENT_ORDER_SELECT)
            .eq("id", id)
            .single();
        if (error || !data) throw new CrmApiError("The updated payment order could not be loaded.", 502);
        return NextResponse.json({order: data});
    } catch (error) {
        const {message, status} = crmErrorResponse(error);
        return NextResponse.json({error: message}, {status});
    }
}
