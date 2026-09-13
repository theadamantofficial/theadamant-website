"use client";

import {useEffect, useRef, useState} from "react";
import {Loader2, Send} from "lucide-react";
import toast from "react-hot-toast";
import {Modal} from "@/components/admin/admin-ui";
import {crmFetch} from "@/features/crm/api";
import type {Prospect} from "@/features/crm/types";
import {getProposalRecipients} from "@/lib/crm/proposal-email";

type ProposalDraft = {configured: boolean; subject: string; message: string; draftSource: string};

export function ProposalEmailModal({prospect, onClose}: {prospect: Prospect; onClose: () => void}) {
    const recipients = getProposalRecipients(prospect);
    const [to, setTo] = useState(recipients[0]?.email || "");
    const [subject, setSubject] = useState("");
    const [message, setMessage] = useState("");
    const [draft, setDraft] = useState<ProposalDraft | null>(null);
    const [error, setError] = useState("");
    const [sending, setSending] = useState(false);
    const sendingRef = useRef(false);

    useEffect(() => {
        let active = true;
        void crmFetch<ProposalDraft>("/api/admin/prospects/email")
            .then((data) => {if (active) {setDraft(data); setSubject(data.subject); setMessage(data.message);}})
            .catch((loadError) => {if (active) setError(loadError instanceof Error ? loadError.message : "The proposal could not be loaded.");});
        return () => {active = false;};
    }, []);

    async function sendEmail() {
        if (sendingRef.current || !draft?.configured) return;
        sendingRef.current = true;
        setSending(true);
        try {
            const result = await crmFetch<{sent: boolean; outreachLogged: boolean}>("/api/admin/prospects/email", {
                method: "POST", body: JSON.stringify({recordId: prospect.record_id, to, subject, message}),
            });
            toast.success("Proposal email sent");
            if (!result.outreachLogged) toast.error("The email was sent, but its outreach status could not be saved. Do not resend.");
            onClose();
        } catch (sendError) {
            toast.error(sendError instanceof Error ? sendError.message : "The proposal email could not be sent.");
        } finally {sendingRef.current = false; setSending(false);}
    }

    return <Modal title="Email client proposal" description="Review the recipient and proposal before sending." onClose={() => {if (!sendingRef.current) onClose();}}>
        {error ? <p role="alert" className="text-sm text-red-500">{error}</p> : !draft ? <p role="status" className="py-4 text-xs text-[var(--crm-muted)]">Loading client proposal…</p> : <form className="space-y-4" onSubmit={(event) => {event.preventDefault(); void sendEmail();}}>
            <label className="block text-xs font-medium">To<select aria-label="Proposal recipient" value={to} onChange={(event) => setTo(event.target.value)} disabled={sending} required className="admin-input mt-1.5">{recipients.map((recipient) => <option key={recipient.email} value={recipient.email}>{recipient.email} · {recipient.label}</option>)}</select></label>
            <label className="block text-xs font-medium">Subject<input value={subject} onChange={(event) => setSubject(event.target.value)} disabled={sending} required maxLength={240} className="admin-input mt-1.5"/></label>
            <label className="block text-xs font-medium">Message<span className="ml-2 font-normal text-[var(--crm-muted)]">{draft.draftSource}</span><textarea value={message} onChange={(event) => setMessage(event.target.value)} disabled={sending} required maxLength={16000} rows={10} className="admin-input mt-1.5 h-auto resize-y py-3"/></label>
            {!draft.configured ? <p role="status" className="text-xs text-[var(--crm-muted)]">Proposal email sending is not configured yet. Configure the client proposal email template to enable sending.</p> : null}
            <div className="flex justify-end gap-2"><button type="button" onClick={onClose} disabled={sending} className="crm-button-secondary">Cancel</button><button disabled={sending || !draft.configured || !to || !subject.trim() || !message.trim()} className="crm-button-primary">{sending ? <Loader2 className="h-3.5 w-3.5 animate-spin"/> : <Send className="h-3.5 w-3.5"/>}{sending ? "Sending…" : "Send proposal"}</button></div>
        </form>}
    </Modal>;
}
