import {AlertCircle, Check, CheckCheck, Clock3} from "lucide-react";
import type {WhatsAppMessage} from "@/features/crm/types";

export function WhatsAppMessageStatus({status}: {status: WhatsAppMessage["status"]}) {
    if (status === "received") return <span data-status={status}>Received</span>;
    const label = {queued: "Queued", sent: "Sent", delivered: "Delivered", read: "Read", failed: "Failed"}[status];
    const Icon = status === "queued" ? Clock3 : status === "failed" ? AlertCircle : status === "delivered" || status === "read" ? CheckCheck : Check;
    return <span data-status={status} aria-label={label} title={label} className={`inline-flex shrink-0 items-center gap-1 ${status === "failed" ? "text-rose-100" : status === "read" ? "text-sky-200" : ""}`}>
        <Icon aria-hidden="true" className="h-3 w-3"/>{label}
    </span>;
}
