import {NextRequest, NextResponse} from "next/server";
import {crmErrorResponse, CrmApiError, getCrmRequestContext} from "@/lib/crm/auth";
import {getCrmServiceClient} from "@/lib/crm/server-client";
import {
    PAYMENT_ORDER_SELECT,
    requireAccessiblePaymentConversation,
    sendStoredPaymentOrder,
} from "@/lib/crm/whatsapp-payment-server";
import {createWhatsAppPaymentReference, parseWhatsAppPaymentDraft} from "@/lib/crm/whatsapp-payments";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Context = {params: Promise<{id: string}>};

export async function GET(request: NextRequest, context: Context) {
    try {
        const {client} = await getCrmRequestContext(request);
        const {id} = await context.params;
        await requireAccessiblePaymentConversation(client, id);
        const {data, error} = await client.from("whatsapp_payment_orders")
            .select(PAYMENT_ORDER_SELECT)
            .eq("conversation_id", id)
            .order("created_at", {ascending: false})
            .limit(50);
        if (error) throw new CrmApiError("Payment orders could not be loaded. Apply the latest Supabase migration.", 502);
        return NextResponse.json({orders: data || []});
    } catch (error) {
        const {message, status} = crmErrorResponse(error);
        return NextResponse.json({error: message}, {status});
    }
}

export async function POST(request: NextRequest, context: Context) {
    try {
        const {client, actor} = await getCrmRequestContext(request);
        const {id} = await context.params;
        const conversation = await requireAccessiblePaymentConversation(client, id);
        const payload = await request.json() as Record<string, unknown>;
        const action = payload.action === "send" ? "send" : "save";
        const draft = parseWhatsAppPaymentDraft(payload);
        const serviceClient = getCrmServiceClient();
        const orderId = typeof payload.orderId === "string" ? payload.orderId.trim() : "";
        let savedId = orderId;

        const values = {
            body: draft.body,
            footer: draft.footer,
            items: draft.items,
            subtotal_paise: draft.subtotal_paise,
            tax_paise: draft.tax_paise,
            discount_paise: draft.discount_paise,
            total_paise: draft.total_paise,
            quick_pay: draft.quick_pay,
            expires_in_minutes: draft.expires_in_minutes,
            updated_by: actor.id,
            last_error: null,
        };
        if (orderId) {
            const existing = await client.from("whatsapp_payment_orders")
                .select("id,conversation_id,status")
                .eq("id", orderId)
                .maybeSingle();
            if (existing.error) throw new CrmApiError("The payment draft could not be loaded.", 502);
            if (!existing.data || existing.data.conversation_id !== id) throw new CrmApiError("Payment draft not found or unavailable.", 404);
            if (existing.data.status !== "draft") throw new CrmApiError("A sent payment request can no longer be edited.", 409);
            const {error} = await serviceClient.from("whatsapp_payment_orders").update(values).eq("id", orderId);
            if (error) throw new CrmApiError("The payment draft could not be updated.", 502);
        } else {
            const inserted = await serviceClient.from("whatsapp_payment_orders").insert({
                conversation_id: id,
                reference_id: createWhatsAppPaymentReference(),
                created_by: actor.id,
                ...values,
            }).select("id").single();
            if (inserted.error || !inserted.data) throw new CrmApiError("The payment draft could not be saved.", 502);
            savedId = String(inserted.data.id);
        }

        if (action === "send") await sendStoredPaymentOrder(conversation, savedId, actor.id);
        const {data, error} = await serviceClient.from("whatsapp_payment_orders")
            .select(PAYMENT_ORDER_SELECT)
            .eq("id", savedId)
            .single();
        if (error || !data) throw new CrmApiError("The saved payment order could not be loaded.", 502);
        return NextResponse.json({order: data}, {status: orderId ? 200 : 201});
    } catch (error) {
        const {message, status} = crmErrorResponse(error);
        return NextResponse.json({error: message}, {status});
    }
}
