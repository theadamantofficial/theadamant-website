import type {Metadata} from "next";
import {WhatsAppCheckout} from "@/features/crm/whatsapp/whatsapp-checkout";
import {CrmApiError} from "@/lib/crm/errors";
import {loadCheckoutOrder, requirePayableCheckout} from "@/lib/crm/whatsapp-checkout-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const metadata: Metadata = {
    title: {absolute: "Secure Payment | Adamant"},
    robots: {index: false, follow: false}, referrer: "no-referrer",
};

export default async function PaymentPage({params}: {params: Promise<{token: string}>}) {
    const {token} = await params;
    try {
        const order = await loadCheckoutOrder(token);
        const alreadyPaid = Boolean(order.razorpay_payment_id) && ["processing", "completed"].includes(order.status);
        let unavailableMessage = "";
        if (!alreadyPaid) {
            try { requirePayableCheckout(order); }
            catch (error) {
                // Keep callback recovery available after a link expires.
                if (error instanceof CrmApiError && [409, 410].includes(error.status)) unavailableMessage = error.message;
                else throw error;
            }
        }
        const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID?.trim();
        if (!keyId || keyId !== process.env.RAZORPAY_KEY_ID?.trim()) {
            throw new CrmApiError("Checkout is temporarily unavailable. Contact Adamant Technologies.", 503);
        }
        return <WhatsAppCheckout token={token} keyId={keyId} reference={order.reference_id}
            message={order.body} amount={Number(order.total_paise)} alreadyPaid={alreadyPaid} unavailableMessage={unavailableMessage}/>;
    } catch (error) {
        const message = error instanceof CrmApiError ? error.message : "The payment request could not be loaded. Please try again later.";
        return <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6 text-slate-900">
            <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-7">
                <h1 className="text-xl font-semibold">Payment link unavailable</h1>
                <p role="alert" className="mt-3 text-sm leading-6 text-slate-600">{message}</p>
            </section>
        </main>;
    }
}
