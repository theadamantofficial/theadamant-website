"use client";

import Script from "next/script";
import {useEffect, useState} from "react";
import {CheckCircle2, Loader2, ShieldCheck} from "lucide-react";

type PaymentResponse = {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
};

type RazorpayOptions = {
    key: string;
    amount: number;
    currency: string;
    name: string;
    description: string;
    order_id: string;
    handler: (response: PaymentResponse) => void;
    modal: {ondismiss: () => void};
    theme: {color: string};
};

declare global {
    interface Window {
        Razorpay?: new (options: RazorpayOptions) => {
            open: () => void;
            on: (event: "payment.failed", callback: (response: {error?: {description?: string}}) => void) => void;
        };
    }
}

async function checkoutFetch<T>(path: string, payload: unknown): Promise<T> {
    const response = await fetch(path, {
        method: "POST", headers: {"Content-Type": "application/json"}, body: JSON.stringify(payload), cache: "no-store",
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || "The payment request could not be completed. Please try again.");
    return data as T;
}

export function WhatsAppCheckout({token, keyId, reference, message, amount, alreadyPaid, unavailableMessage = ""}: {
    token: string; keyId: string; reference: string; message: string; amount: number; alreadyPaid: boolean; unavailableMessage?: string;
}) {
    const [ready, setReady] = useState(false);
    const [busy, setBusy] = useState(false);
    const [paid, setPaid] = useState(alreadyPaid);
    const [notice, setNotice] = useState(unavailableMessage);
    const [pending, setPending] = useState<PaymentResponse | null>(null);
    const storageKey = `adamant-checkout:${token}`;
    const formattedAmount = new Intl.NumberFormat("en-IN", {style: "currency", currency: "INR"}).format(amount / 100);

    useEffect(() => {
        // Preserve the verification response across a refresh, without storing any credentials.
        try {
            const saved = sessionStorage.getItem(storageKey);
            if (alreadyPaid) sessionStorage.removeItem(storageKey);
            else if (saved) {
                const response = JSON.parse(saved) as PaymentResponse;
                if (response.razorpay_payment_id && response.razorpay_order_id && response.razorpay_signature) {
                    setPending(response);
                    setNotice("Your payment needs confirmation. Retry verification; do not pay again.");
                }
            }
        } catch { /* Storage may be disabled in the customer's browser. */ }
    }, [alreadyPaid, storageKey]);

    async function verify(response: PaymentResponse) {
        setBusy(true);
        setNotice("Confirming your payment…");
        try {
            await checkoutFetch<{success: boolean}>("/api/verify-payment", {token, ...response});
            setPaid(true);
            setPending(null);
            setNotice("");
            try { sessionStorage.removeItem(storageKey); } catch { /* Optional recovery storage. */ }
        } catch (error) {
            setNotice(error instanceof Error ? error.message : "Payment confirmation failed. Retry verification; do not pay again.");
        } finally {
            setBusy(false);
        }
    }

    async function pay() {
        setBusy(true);
        setNotice("");
        try {
            const order = await checkoutFetch<{order_id: string; amount: number; currency: string}>("/api/create-order", {token});
            if (!window.Razorpay) throw new Error("Checkout has not loaded. Refresh this page and try again.");
            let receivedPayment = false;
            let failed = false;
            const checkout = new window.Razorpay({
                key: keyId, amount: order.amount, currency: order.currency,
                name: "Adamant Technologies", description: reference, order_id: order.order_id,
                theme: {color: "#0d5c63"},
                handler: (response) => {
                    receivedPayment = true;
                    setPending(response);
                    try { sessionStorage.setItem(storageKey, JSON.stringify(response)); } catch { /* Optional recovery storage. */ }
                    void verify(response);
                },
                modal: {ondismiss: () => {
                    if (!receivedPayment) {
                        setBusy(false);
                        if (!failed) setNotice("Checkout cancelled. You can try again when you are ready.");
                    }
                }},
            });
            checkout.on("payment.failed", (response) => {
                failed = true;
                setNotice(response.error?.description || "Payment failed. Please try again or choose another payment method.");
            });
            checkout.open();
        } catch (error) {
            setNotice(error instanceof Error ? error.message : "Checkout could not be opened.");
            setBusy(false);
        }
    }

    return <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12 text-slate-900">
        {!paid ? <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive"
            onReady={() => setReady(true)} onError={() => setNotice("Checkout could not load. Check your connection and refresh this page.")}/> : null}
        <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
            <p className="text-sm font-semibold text-[#0d5c63]">Adamant Technologies</p>
            <h1 className="mt-5 text-2xl font-semibold">{paid ? "Payment confirmed" : "Complete your payment"}</h1>
            <p className="mt-2 break-words text-xs text-slate-500">Order {reference}</p>
            {keyId.startsWith("rzp_test_") ? <p className="mt-3 rounded-lg bg-amber-50 p-2 text-xs text-amber-800">Test mode · No real payment will be collected.</p> : null}
            {paid ? <div className="mt-6 flex items-start gap-3 rounded-lg bg-emerald-50 p-4 text-sm text-emerald-800"><CheckCircle2 className="h-5 w-5 shrink-0"/>Thank you. Your payment of {formattedAmount} has been confirmed.</div> : <>
                <p className="mt-5 whitespace-pre-wrap break-words text-sm leading-6 text-slate-600">{message}</p>
                <p className="my-6 text-3xl font-semibold">{formattedAmount}</p>
                <button type="button" disabled={busy || (!pending && (!ready || Boolean(unavailableMessage)))} onClick={() => pending ? void verify(pending) : void pay()}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#0d5c63] px-4 py-3 text-sm font-semibold text-white disabled:opacity-50">
                    {busy ? <Loader2 className="h-4 w-4 animate-spin"/> : <ShieldCheck className="h-4 w-4"/>}
                    {busy ? "Please wait…" : pending ? "Retry payment verification" : unavailableMessage ? "Payment link inactive" : ready ? `Pay ${formattedAmount}` : "Loading checkout…"}
                </button>
                {notice ? <p role="status" aria-live="polite" className="mt-4 text-sm leading-6 text-rose-700">{notice}</p> : null}
                <p className="mt-4 text-center text-xs text-slate-500">Secure checkout powered by Razorpay</p>
            </>}
        </section>
    </main>;
}
