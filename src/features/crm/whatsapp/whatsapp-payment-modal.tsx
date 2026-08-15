"use client";

import {useCallback, useEffect, useMemo, useState} from "react";
import toast from "react-hot-toast";
import {BadgeIndianRupee, CheckCircle2, Loader2, Pencil, Plus, Send, Trash2, XCircle} from "lucide-react";
import {FormField, Modal, Skeleton} from "@/components/admin/admin-ui";
import {crmFetch} from "@/features/crm/api";
import {formatCrmDate} from "@/features/crm/format";
import type {WhatsAppConversation, WhatsAppPaymentOrder, WhatsAppPaymentOrderStatus} from "@/features/crm/types";

type DraftItem = {name: string; amount: string; quantity: number};

const STATUS_LABELS: Record<WhatsAppPaymentOrderStatus, string> = {
    draft: "Draft",
    sending: "Sending",
    pending: "Awaiting payment",
    processing: "Payment confirmed",
    completed: "Completed",
    canceled: "Canceled",
};

export function WhatsAppPaymentModal({conversation, onClose, onChanged}: {
    conversation: WhatsAppConversation;
    onClose: () => void;
    onChanged: () => void;
}) {
    const [orders, setOrders] = useState<WhatsAppPaymentOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState<"save" | "send" | "">("");
    const [updatingId, setUpdatingId] = useState("");
    const [editingId, setEditingId] = useState("");
    const [body, setBody] = useState(`Hi ${conversation.contact_name || "there"}, please review your order and complete the payment.`);
    const [footer, setFooter] = useState("Adamant Technologies");
    const [items, setItems] = useState<DraftItem[]>([{name: "", amount: "", quantity: 1}]);
    const [tax, setTax] = useState("0");
    const [discount, setDiscount] = useState("0");
    const [expiryMinutes, setExpiryMinutes] = useState("1440");
    const [quickPay, setQuickPay] = useState(false);

    const loadOrders = useCallback(async () => {
        try {
            const data = await crmFetch<{orders: WhatsAppPaymentOrder[]}>(`/api/admin/whatsapp/conversations/${conversation.id}/payments`);
            setOrders(data.orders);
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Payment orders could not be loaded.");
        } finally {
            setLoading(false);
        }
    }, [conversation.id]);

    useEffect(() => {
        void loadOrders();
    }, [loadOrders]);

    const totals = useMemo(() => {
        const subtotal = items.reduce((sum, item) => sum + amountNumber(item.amount) * Math.max(0, Number(item.quantity) || 0), 0);
        return {subtotal, total: subtotal + amountNumber(tax) - amountNumber(discount)};
    }, [discount, items, tax]);

    function resetForm() {
        setEditingId("");
        setBody(`Hi ${conversation.contact_name || "there"}, please review your order and complete the payment.`);
        setFooter("Adamant Technologies");
        setItems([{name: "", amount: "", quantity: 1}]);
        setTax("0");
        setDiscount("0");
        setExpiryMinutes("1440");
        setQuickPay(false);
    }

    function editOrder(order: WhatsAppPaymentOrder) {
        setEditingId(order.id);
        setBody(order.body);
        setFooter(order.footer);
        setItems(order.items.map((item) => ({name: item.name, amount: paiseToInput(item.amount_paise), quantity: item.quantity})));
        setTax(paiseToInput(order.tax_paise));
        setDiscount(paiseToInput(order.discount_paise));
        setExpiryMinutes(String(order.expires_in_minutes));
        setQuickPay(order.quick_pay);
    }

    async function submit(action: "save" | "send") {
        setSaving(action);
        try {
            const data = await crmFetch<{order: WhatsAppPaymentOrder}>(`/api/admin/whatsapp/conversations/${conversation.id}/payments`, {
                method: "POST",
                body: JSON.stringify({
                    action,
                    orderId: editingId || undefined,
                    body,
                    footer,
                    items,
                    tax,
                    discount,
                    quickPay,
                    expiresInMinutes: expiryMinutes,
                }),
            });
            toast.success(action === "send" ? "Payment request sent" : "Payment draft saved");
            if (action === "save") editOrder(data.order);
            else resetForm();
            await loadOrders();
            onChanged();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "The payment request could not be saved.");
        } finally {
            setSaving("");
        }
    }

    async function updateOrder(order: WhatsAppPaymentOrder, payload: Record<string, unknown>, successMessage: string) {
        setUpdatingId(order.id);
        try {
            await crmFetch(`/api/admin/whatsapp/payments/${order.id}`, {method: "PATCH", body: JSON.stringify(payload)});
            toast.success(successMessage);
            await loadOrders();
            onChanged();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "The payment order could not be updated.");
        } finally {
            setUpdatingId("");
        }
    }

    function confirmPayment(order: WhatsAppPaymentOrder) {
        if (!window.confirm(`Confirm that ${formatPaise(order.total_paise)} has been received in Razorpay or the settlement account?`)) return;
        void updateOrder(order, {status: "processing"}, "Payment confirmed and customer notified");
    }

    return <Modal title="WhatsApp payment order" description="Draft a UPI payment request. Sent amounts cannot be edited; verify funds in Razorpay before confirming payment." onClose={onClose}>
        <form className="space-y-4" onSubmit={(event) => { event.preventDefault(); void submit("save"); }}>
            <div className="flex items-center justify-between gap-3 rounded-lg border border-[var(--crm-border)] bg-[var(--crm-subtle)] px-3 py-2">
                <div><p className="text-xs font-semibold text-[var(--crm-text)]">{editingId ? "Editing saved draft" : "New payment draft"}</p><p className="text-[10px] text-[var(--crm-muted)]">UPI · INR · {conversation.contact_name || `+${conversation.wa_id}`}</p></div>
                {editingId ? <button type="button" onClick={resetForm} className="crm-button-secondary"><Plus className="h-3.5 w-3.5"/>New</button> : null}
            </div>

            <FormField label="Customer message" required><textarea value={body} onChange={(event) => setBody(event.target.value)} required maxLength={1024} rows={3} className="admin-input h-auto resize-y"/></FormField>

            <div className="space-y-2">
                <div className="flex items-center justify-between"><p className="text-xs font-medium text-[var(--crm-text)]">Order items <span className="text-red-500">*</span></p><button type="button" disabled={items.length >= 10} onClick={() => setItems((current) => [...current, {name: "", amount: "", quantity: 1}])} className="text-[11px] font-semibold text-[#0d5c63] disabled:opacity-40"><Plus className="mr-1 inline h-3 w-3"/>Add item</button></div>
                {items.map((item, index) => <div key={index} className="grid grid-cols-[minmax(0,1fr)_6.5rem_4.5rem_2rem] gap-2">
                    <input aria-label={`Item ${index + 1} name`} value={item.name} onChange={(event) => setItems((current) => current.map((entry, itemIndex) => itemIndex === index ? {...entry, name: event.target.value} : entry))} required maxLength={60} placeholder="Service or item" className="admin-input"/>
                    <div className="relative"><span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-[var(--crm-muted)]">₹</span><input aria-label={`Item ${index + 1} amount`} value={item.amount} onChange={(event) => setItems((current) => current.map((entry, itemIndex) => itemIndex === index ? {...entry, amount: event.target.value} : entry))} required inputMode="decimal" placeholder="0.00" className="admin-input pl-6"/></div>
                    <input aria-label={`Item ${index + 1} quantity`} type="number" min={1} max={999} value={item.quantity} onChange={(event) => setItems((current) => current.map((entry, itemIndex) => itemIndex === index ? {...entry, quantity: Number(event.target.value)} : entry))} required className="admin-input"/>
                    <button type="button" aria-label={`Remove item ${index + 1}`} disabled={items.length === 1} onClick={() => setItems((current) => current.filter((_, itemIndex) => itemIndex !== index))} className="crm-icon-button h-9 w-8 disabled:opacity-30"><Trash2 className="h-3.5 w-3.5"/></button>
                </div>)}
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
                <FormField label="Tax"><div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-[var(--crm-muted)]">₹</span><input value={tax} onChange={(event) => setTax(event.target.value)} inputMode="decimal" className="admin-input pl-7"/></div></FormField>
                <FormField label="Discount"><div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-[var(--crm-muted)]">₹</span><input value={discount} onChange={(event) => setDiscount(event.target.value)} inputMode="decimal" className="admin-input pl-7"/></div></FormField>
                <FormField label="Expires after" hint="Between 5 minutes and 30 days."><select value={expiryMinutes} onChange={(event) => setExpiryMinutes(event.target.value)} className="admin-input"><option value="60">1 hour</option><option value="360">6 hours</option><option value="1440">24 hours</option><option value="4320">3 days</option><option value="10080">7 days</option><option value="43200">30 days</option></select></FormField>
                <FormField label="Footer"><input value={footer} onChange={(event) => setFooter(event.target.value)} maxLength={60} className="admin-input"/></FormField>
            </div>

            <label className="flex items-start gap-2 rounded-lg border border-[var(--crm-border)] p-3"><input type="checkbox" checked={quickPay} onChange={(event) => setQuickPay(event.target.checked)} className="mt-0.5"/><span><span className="block text-xs font-medium">Quick Pay</span><span className="block text-[10px] leading-4 text-[var(--crm-muted)]">Show Pay now directly instead of Review and pay.</span></span></label>

            <div className="rounded-lg border border-[var(--crm-border)] bg-[var(--crm-subtle)] p-3 text-xs">
                <div className="flex justify-between text-[var(--crm-muted)]"><span>Subtotal</span><span>{formatRupees(totals.subtotal)}</span></div>
                <div className="mt-2 flex justify-between text-sm font-semibold text-[var(--crm-text)]"><span>Total</span><span>{formatRupees(totals.total)}</span></div>
            </div>

            <div className="flex flex-wrap justify-end gap-2"><button type="submit" disabled={Boolean(saving)} className="crm-button-secondary">{saving === "save" ? <Loader2 className="h-4 w-4 animate-spin"/> : null}Save draft</button><button type="button" disabled={Boolean(saving)} onClick={() => void submit("send")} className="crm-button-primary">{saving === "send" ? <Loader2 className="h-4 w-4 animate-spin"/> : <Send className="h-4 w-4"/>}Send payment</button></div>
        </form>

        <div className="my-5 border-t border-[var(--crm-border)]"/>
        <div className="space-y-2"><h3 className="text-xs font-semibold text-[var(--crm-text)]">Payment history</h3>
            {loading ? <div className="space-y-2"><Skeleton className="h-20"/><Skeleton className="h-20"/></div> : orders.length ? orders.map((order) => <PaymentOrderCard key={order.id} order={order} busy={updatingId === order.id} onEdit={() => editOrder(order)} onSend={() => void updateOrder(order, {action: "send"}, "Payment request sent")} onConfirm={() => confirmPayment(order)} onComplete={() => void updateOrder(order, {status: "completed"}, "Order completed and customer notified")} onCancel={() => void updateOrder(order, {status: "canceled"}, "Payment request canceled")}/>) : <p className="rounded-lg border border-dashed border-[var(--crm-border)] px-3 py-5 text-center text-[11px] text-[var(--crm-muted)]">No payment orders for this conversation yet.</p>}
        </div>
    </Modal>;
}

function PaymentOrderCard({order, busy, onEdit, onSend, onConfirm, onComplete, onCancel}: {order: WhatsAppPaymentOrder; busy: boolean; onEdit: () => void; onSend: () => void; onConfirm: () => void; onComplete: () => void; onCancel: () => void}) {
    return <article className="rounded-lg border border-[var(--crm-border)] p-3">
        <div className="flex items-start justify-between gap-3"><div><p className="text-sm font-semibold text-[var(--crm-text)]">{formatPaise(order.total_paise)}</p><p className="mt-0.5 text-[9px] text-[var(--crm-muted)]">{order.reference_id} · {formatCrmDate(order.created_at, true)}</p></div><span className={`rounded-full px-2 py-1 text-[9px] font-semibold ${statusClass(order.status)}`}>{STATUS_LABELS[order.status]}</span></div>
        <p className="mt-2 line-clamp-2 text-[10px] leading-4 text-[var(--crm-muted)]">{order.items.map((item) => `${item.quantity}× ${item.name}`).join(" · ")}</p>
        {order.last_error ? <p className="mt-2 text-[10px] text-rose-600">{order.last_error}</p> : null}
        <div className="mt-3 flex flex-wrap gap-2">
            {busy ? <span className="flex items-center gap-1 text-[10px] text-[var(--crm-muted)]"><Loader2 className="h-3.5 w-3.5 animate-spin"/>Updating…</span> : <>
                {order.status === "draft" ? <><button onClick={onEdit} className="crm-button-secondary"><Pencil className="h-3 w-3"/>Edit</button><button onClick={onSend} className="crm-button-primary"><Send className="h-3 w-3"/>Send</button></> : null}
                {order.status === "pending" ? <><button onClick={onConfirm} className="crm-button-primary"><BadgeIndianRupee className="h-3.5 w-3.5"/>Confirm paid</button><button onClick={onCancel} className="crm-button-secondary text-rose-600"><XCircle className="h-3.5 w-3.5"/>Cancel</button></> : null}
                {order.status === "processing" ? <button onClick={onComplete} className="crm-button-primary"><CheckCircle2 className="h-3.5 w-3.5"/>Mark complete</button> : null}
            </>}
        </div>
    </article>;
}

function amountNumber(value: string) {
    const number = Number(value);
    return Number.isFinite(number) ? number : 0;
}

function formatRupees(value: number) {
    return new Intl.NumberFormat("en-IN", {style: "currency", currency: "INR", maximumFractionDigits: 2}).format(value || 0);
}

function formatPaise(value: number) {
    return formatRupees(Number(value || 0) / 100);
}

function paiseToInput(value: number) {
    return (Number(value || 0) / 100).toFixed(2).replace(/\.00$/, "");
}

function statusClass(status: WhatsAppPaymentOrderStatus) {
    if (status === "completed") return "bg-emerald-100 text-emerald-700";
    if (status === "processing") return "bg-sky-100 text-sky-700";
    if (status === "pending" || status === "sending") return "bg-amber-100 text-amber-700";
    if (status === "canceled") return "bg-rose-100 text-rose-700";
    return "bg-[var(--crm-subtle)] text-[var(--crm-muted)]";
}
