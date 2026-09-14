import {createHmac, timingSafeEqual} from "node:crypto";
import Razorpay from "razorpay";
import {CrmApiError} from "@/lib/crm/errors";

export function getRazorpayClient() {
    const key_id = process.env.RAZORPAY_KEY_ID?.trim();
    const key_secret = process.env.RAZORPAY_KEY_SECRET?.trim();
    if (!key_id || !key_secret) throw new CrmApiError("Razorpay is not configured on the server.", 503);
    return new Razorpay({key_id, key_secret});
}

export function validateCheckoutAmount(amount: number, currency: string) {
    if (!Number.isSafeInteger(amount) || amount < 100) {
        throw new CrmApiError("The payment amount must be at least ₹1 (100 paise).");
    }
    if (currency !== "INR") throw new CrmApiError("WhatsApp payments must use INR.");
}

export function verifyRazorpaySignature(orderId: string, paymentId: string, signature: string) {
    const secret = process.env.RAZORPAY_KEY_SECRET?.trim();
    if (!secret) throw new CrmApiError("Razorpay is not configured on the server.", 503);
    if (!/^[a-fA-F0-9]{64}$/.test(signature)) return false;
    const expected = createHmac("sha256", secret).update(`${orderId}|${paymentId}`).digest();
    return timingSafeEqual(expected, Buffer.from(signature, "hex"));
}

export async function razorpayRequest<T>(operation: () => Promise<T>): Promise<T> {
    try {
        return await operation();
    } catch (error) {
        const statusCode = error && typeof error === "object" && "statusCode" in error ? Number(error.statusCode) : 0;
        // Provider errors can contain request details. Keep them out of responses and logs.
        throw new CrmApiError(statusCode === 401 ? "Razorpay authentication failed. Contact Adamant Technologies." : "Razorpay could not process the request. Please try again.", statusCode === 401 ? 401 : 500);
    }
}
