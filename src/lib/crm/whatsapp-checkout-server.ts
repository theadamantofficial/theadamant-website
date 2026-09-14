import {CrmApiError} from "@/lib/crm/errors";
import {getCrmServiceClient} from "@/lib/crm/server-client";
import {getRazorpayClient, razorpayRequest, validateCheckoutAmount, verifyRazorpaySignature} from "@/lib/crm/razorpay";

export type CheckoutOrder = {
    id: string;
    reference_id: string;
    body: string;
    total_paise: number;
    currency: string;
    status: string;
    sent_at: string | null;
    expires_in_minutes: number;
    razorpay_order_id: string | null;
    razorpay_payment_id: string | null;
};

export async function loadCheckoutOrder(token: unknown) {
    if (typeof token !== "string" || !/^[a-f0-9]{64}$/.test(token)) throw new CrmApiError("Invalid payment link.", 400);
    const {data, error} = await getCrmServiceClient().from("whatsapp_payment_orders")
        .select("id,reference_id,body,total_paise,currency,status,sent_at,expires_in_minutes,razorpay_order_id,razorpay_payment_id")
        .eq("checkout_token", token).maybeSingle();
    if (error) throw new CrmApiError("The payment request could not be loaded.", 500);
    if (!data) throw new CrmApiError("Payment request not found.", 404);
    return data as CheckoutOrder;
}

export function requirePayableCheckout(order: CheckoutOrder, now = Date.now()) {
    if (order.status !== "pending") throw new CrmApiError("This payment request is no longer awaiting payment.", 409);
    const sentAt = order.sent_at ? new Date(order.sent_at).getTime() : NaN;
    if (!Number.isFinite(sentAt) || sentAt + order.expires_in_minutes * 60_000 <= now) {
        throw new CrmApiError("This payment request has expired. Contact Adamant Technologies for a new link.", 410);
    }
    validateCheckoutAmount(Number(order.total_paise), order.currency);
}

export async function createCheckoutOrder(token: unknown) {
    const order = await loadCheckoutOrder(token);
    requirePayableCheckout(order);
    let orderId = order.razorpay_order_id;
    if (!orderId) {
        const client = getRazorpayClient();
        const created = await razorpayRequest(() => client.orders.create({
            amount: Number(order.total_paise), currency: order.currency, receipt: order.reference_id,
        }));
        // Only the winning provider order is returned to Checkout. Concurrent requests
        // can leave an unused provider order, but cannot replace the active order ID.
        const saved = await getCrmServiceClient().from("whatsapp_payment_orders")
            .update({razorpay_order_id: created.id})
            .eq("id", order.id).eq("status", "pending").is("razorpay_order_id", null)
            .select("razorpay_order_id").maybeSingle();
        if (saved.error) throw new CrmApiError("The checkout order could not be saved. Please try again.", 500);
        if (saved.data) orderId = String(saved.data.razorpay_order_id);
        else {
            const latest = await loadCheckoutOrder(token);
            requirePayableCheckout(latest);
            orderId = latest.razorpay_order_id;
        }
    }
    if (!orderId) throw new CrmApiError("Checkout is being prepared. Please try again.", 409);
    return {order_id: orderId, amount: Number(order.total_paise), currency: order.currency};
}

export async function verifyCheckoutPayment(payload: Record<string, unknown>) {
    const {token, razorpay_payment_id: paymentId, razorpay_order_id: orderId, razorpay_signature: signature} = payload;
    if (typeof paymentId !== "string" || !/^pay_[A-Za-z0-9]+$/.test(paymentId)
        || typeof orderId !== "string" || !/^order_[A-Za-z0-9]+$/.test(orderId)
        || typeof signature !== "string" || !signature) {
        throw new CrmApiError("Payment ID, order ID, and signature are required.");
    }
    const order = await loadCheckoutOrder(token);
    // Use the order ID saved by the server, never an unchecked browser order ID.
    if (!order.razorpay_order_id || order.razorpay_order_id !== orderId
        || !verifyRazorpaySignature(order.razorpay_order_id, paymentId, signature)) {
        throw new CrmApiError("Payment signature verification failed.");
    }
    if (order.razorpay_payment_id === paymentId && ["processing", "completed"].includes(order.status)) return {success: true};
    if (order.status !== "pending") throw new CrmApiError("This payment request is no longer awaiting payment. Contact Adamant Technologies.", 409);
    const client = getRazorpayClient();
    const payment = await razorpayRequest(() => client.payments.fetch(paymentId));
    if (payment.order_id !== order.razorpay_order_id || Number(payment.amount) !== Number(order.total_paise) || payment.currency !== order.currency) {
        throw new CrmApiError("The payment does not match this order.");
    }
    if (payment.status !== "captured") throw new CrmApiError("Payment is awaiting capture. Retry verification shortly; do not pay again.", 409);
    // Expiry prevents starting Checkout; it must not block a payment already made.
    const saved = await getCrmServiceClient().from("whatsapp_payment_orders").update({
        status: "processing", razorpay_payment_id: paymentId,
        payment_confirmed_at: new Date().toISOString(), last_error: null,
    }).eq("id", order.id).eq("status", "pending").eq("razorpay_order_id", order.razorpay_order_id)
        .select("id").maybeSingle();
    if (saved.error) throw new CrmApiError("The payment was verified but could not be recorded. Retry verification; do not pay again.", 500);
    if (!saved.data) {
        const latest = await loadCheckoutOrder(token);
        if (latest.razorpay_payment_id !== paymentId || !["processing", "completed"].includes(latest.status)) {
            throw new CrmApiError("The order changed during verification. Contact Adamant Technologies.", 409);
        }
    }
    return {success: true};
}
