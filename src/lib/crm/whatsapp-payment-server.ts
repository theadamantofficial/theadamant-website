import type {SupabaseClient} from "@supabase/supabase-js";
import {CrmApiError} from "@/lib/crm/errors";
import {getCrmServiceClient} from "@/lib/crm/server-client";
import {
    formatWhatsAppPaymentAmount,
    sendWhatsAppOrderDetails,
    sendWhatsAppOrderStatus,
    type WhatsAppOrderStatus,
    type WhatsAppPaymentDraft,
} from "@/lib/crm/whatsapp-payments";

export const PAYMENT_ORDER_SELECT = [
    "id",
    "conversation_id",
    "reference_id",
    "body",
    "footer",
    "items",
    "subtotal_paise",
    "tax_paise",
    "discount_paise",
    "total_paise",
    "currency",
    "quick_pay",
    "expires_in_minutes",
    "status",
    "whatsapp_message_id",
    "last_status_message_id",
    "last_status_description",
    "last_error",
    "created_by",
    "updated_by",
    "sent_at",
    "payment_confirmed_at",
    "completed_at",
    "canceled_at",
    "created_at",
    "updated_at",
    "creator:profiles!whatsapp_payment_orders_created_by_fkey(id,full_name,email,avatar_url)",
    "updater:profiles!whatsapp_payment_orders_updated_by_fkey(id,full_name,email,avatar_url)",
].join(",");

export type AccessiblePaymentConversation = {
    id: string;
    wa_id: string;
    customer_service_window_expires_at: string | null;
};

type StoredPaymentOrder = WhatsAppPaymentDraft & {
    id: string;
    conversation_id: string;
    reference_id: string;
    status: string;
};

export async function requireAccessiblePaymentConversation(client: SupabaseClient, conversationId: string) {
    const {data, error} = await client.from("whatsapp_conversations")
        .select("id,wa_id,customer_service_window_expires_at")
        .eq("id", conversationId)
        .maybeSingle();
    if (error) throw new CrmApiError("The WhatsApp conversation could not be loaded.", 502);
    if (!data) throw new CrmApiError("WhatsApp conversation not found or unavailable.", 404);
    return data as AccessiblePaymentConversation;
}

export async function sendStoredPaymentOrder(conversation: AccessiblePaymentConversation, orderId: string, actorId: string) {
    requireOpenServiceWindow(conversation.customer_service_window_expires_at);
    const serviceClient = getCrmServiceClient();
    const claim = await serviceClient.from("whatsapp_payment_orders")
        .update({status: "sending", updated_by: actorId, last_error: null})
        .eq("id", orderId)
        .eq("conversation_id", conversation.id)
        .eq("status", "draft")
        .select("*")
        .maybeSingle();
    if (claim.error) throw new CrmApiError("The payment draft could not be prepared for sending.", 502);
    if (!claim.data) throw new CrmApiError("Only an unsent payment draft can be sent.", 409);
    const order = claim.data as StoredPaymentOrder;
    const timestamp = new Date().toISOString();
    const summary = `Payment request · ${formatWhatsAppPaymentAmount(Number(order.total_paise))}`;
    const queued = await serviceClient.from("whatsapp_messages").insert({
        conversation_id: conversation.id,
        whatsapp_message_id: null,
        direction: "outbound",
        message_type: "order_details",
        body: `${summary}\n${order.body}`,
        status: "queued",
        sent_by: actorId,
        message_timestamp: timestamp,
        metadata: {payment_order_id: order.id, reference_id: order.reference_id, total_paise: order.total_paise},
    }).select("id").single();
    if (queued.error || !queued.data) {
        await serviceClient.from("whatsapp_payment_orders").update({status: "draft", last_error: "The payment message could not be queued."}).eq("id", order.id);
        throw new CrmApiError("The payment message could not be queued.", 502);
    }

    const localMessageId = String(queued.data.id);
    let providerMessageId = "";
    try {
        const sent = await sendWhatsAppOrderDetails(conversation.wa_id, storedOrderToDraft(order), order.reference_id);
        providerMessageId = sent.messageId;
        const {error: messageError} = await serviceClient.from("whatsapp_messages").update({
            whatsapp_message_id: sent.messageId,
            status: "sent",
            message_timestamp: timestamp,
        }).eq("id", localMessageId);
        if (messageError) throw new CrmApiError("The payment request was sent but its message record could not be updated.", 502);
        const {error: orderError} = await serviceClient.from("whatsapp_payment_orders").update({
            status: "pending",
            whatsapp_message_id: sent.messageId,
            sent_at: timestamp,
            updated_by: actorId,
            last_error: null,
        }).eq("id", order.id);
        if (orderError) throw new CrmApiError("The payment request was sent but its order record could not be updated.", 502);
        await updateConversationPreview(serviceClient, conversation.id, timestamp, summary);
    } catch (error) {
        const message = error instanceof Error ? error.message.slice(0, 500) : "Meta could not send the payment request.";
        if (providerMessageId) {
            // Meta already accepted the request. Preserve the sent state so a
            // transient persistence failure cannot cause a duplicate invoice.
            await serviceClient.from("whatsapp_messages").update({whatsapp_message_id: providerMessageId, status: "sent", error_message: message}).eq("id", localMessageId);
            await serviceClient.from("whatsapp_payment_orders").update({status: "pending", whatsapp_message_id: providerMessageId, sent_at: timestamp, last_error: message, updated_by: actorId}).eq("id", order.id);
        } else {
            await serviceClient.from("whatsapp_messages").update({status: "failed", error_message: message}).eq("id", localMessageId);
            await serviceClient.from("whatsapp_payment_orders").update({status: "draft", last_error: message, updated_by: actorId}).eq("id", order.id);
        }
        throw error;
    }
}

export async function sendStoredOrderStatus(
    conversation: AccessiblePaymentConversation,
    order: StoredPaymentOrder,
    targetStatus: WhatsAppOrderStatus,
    description: string,
    actorId: string,
) {
    requireOpenServiceWindow(conversation.customer_service_window_expires_at);
    const allowed = order.status === "pending"
        ? ["processing", "canceled"]
        : order.status === "processing" ? ["completed"] : [];
    if (!allowed.includes(targetStatus)) throw new CrmApiError("That order status change is not allowed.", 409);

    const serviceClient = getCrmServiceClient();
    const claim = await serviceClient.from("whatsapp_payment_orders")
        .update({status: "sending", updated_by: actorId, last_error: null})
        .eq("id", order.id)
        .eq("conversation_id", conversation.id)
        .eq("status", order.status)
        .select("id")
        .maybeSingle();
    if (claim.error) throw new CrmApiError("The order status could not be prepared.", 502);
    if (!claim.data) throw new CrmApiError("This order was updated by someone else. Refresh and try again.", 409);

    const timestamp = new Date().toISOString();
    const queued = await serviceClient.from("whatsapp_messages").insert({
        conversation_id: conversation.id,
        whatsapp_message_id: null,
        direction: "outbound",
        message_type: "order_status",
        body: description,
        status: "queued",
        sent_by: actorId,
        message_timestamp: timestamp,
        metadata: {payment_order_id: order.id, reference_id: order.reference_id, order_status: targetStatus},
    }).select("id").single();
    if (queued.error || !queued.data) {
        await serviceClient.from("whatsapp_payment_orders").update({status: order.status, last_error: "The status message could not be queued."}).eq("id", order.id);
        throw new CrmApiError("The order status message could not be queued.", 502);
    }

    const localMessageId = String(queued.data.id);
    let providerMessageId = "";
    try {
        const sent = await sendWhatsAppOrderStatus(conversation.wa_id, order.reference_id, targetStatus, description);
        providerMessageId = sent.messageId;
        const {error: messageError} = await serviceClient.from("whatsapp_messages").update({
            whatsapp_message_id: sent.messageId,
            status: "sent",
            message_timestamp: timestamp,
        }).eq("id", localMessageId);
        if (messageError) throw new CrmApiError("The status was sent but its message record could not be updated.", 502);
        const statusDates = targetStatus === "processing"
            ? {payment_confirmed_at: timestamp}
            : targetStatus === "completed" ? {completed_at: timestamp} : {canceled_at: timestamp};
        const {error: orderError} = await serviceClient.from("whatsapp_payment_orders").update({
            status: targetStatus,
            last_status_message_id: sent.messageId,
            last_status_description: description,
            updated_by: actorId,
            last_error: null,
            ...statusDates,
        }).eq("id", order.id);
        if (orderError) throw new CrmApiError("The status was sent but the order could not be updated.", 502);
        await updateConversationPreview(serviceClient, conversation.id, timestamp, description);
    } catch (error) {
        const message = error instanceof Error ? error.message.slice(0, 500) : "Meta could not send the order status.";
        if (providerMessageId) {
            const statusDates = targetStatus === "processing"
                ? {payment_confirmed_at: timestamp}
                : targetStatus === "completed" ? {completed_at: timestamp} : {canceled_at: timestamp};
            await serviceClient.from("whatsapp_messages").update({whatsapp_message_id: providerMessageId, status: "sent", error_message: message}).eq("id", localMessageId);
            await serviceClient.from("whatsapp_payment_orders").update({
                status: targetStatus,
                last_status_message_id: providerMessageId,
                last_status_description: description,
                last_error: message,
                updated_by: actorId,
                ...statusDates,
            }).eq("id", order.id);
        } else {
            await serviceClient.from("whatsapp_messages").update({status: "failed", error_message: message}).eq("id", localMessageId);
            await serviceClient.from("whatsapp_payment_orders").update({status: order.status, last_error: message, updated_by: actorId}).eq("id", order.id);
        }
        throw error;
    }
}

export async function loadAccessiblePaymentOrder(client: SupabaseClient, orderId: string) {
    const {data, error} = await client.from("whatsapp_payment_orders")
        .select("*")
        .eq("id", orderId)
        .maybeSingle();
    if (error) throw new CrmApiError("The payment order could not be loaded. Apply the latest Supabase migration.", 502);
    if (!data) throw new CrmApiError("Payment order not found or unavailable.", 404);
    return data as StoredPaymentOrder;
}

function storedOrderToDraft(order: StoredPaymentOrder): WhatsAppPaymentDraft {
    return {
        body: String(order.body),
        footer: String(order.footer || ""),
        items: Array.isArray(order.items) ? order.items : [],
        subtotal_paise: Number(order.subtotal_paise),
        tax_paise: Number(order.tax_paise),
        discount_paise: Number(order.discount_paise),
        total_paise: Number(order.total_paise),
        quick_pay: Boolean(order.quick_pay),
        expires_in_minutes: Number(order.expires_in_minutes),
    };
}

function requireOpenServiceWindow(expiresAt: string | null) {
    if (!expiresAt || new Date(expiresAt).getTime() <= Date.now()) {
        throw new CrmApiError("The 24-hour WhatsApp reply window is closed. Ask the customer to message again before sending a payment request or status.", 409);
    }
}

async function updateConversationPreview(client: SupabaseClient, conversationId: string, timestamp: string, preview: string) {
    const {error} = await client.from("whatsapp_conversations").update({
        last_message_at: timestamp,
        last_message_preview: preview.slice(0, 180),
        last_message_direction: "outbound",
    }).eq("id", conversationId);
    if (error) throw new CrmApiError("The WhatsApp conversation summary could not be updated.", 502);
}
