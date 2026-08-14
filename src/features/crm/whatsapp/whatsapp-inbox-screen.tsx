"use client";

import {FormEvent, useCallback, useEffect, useMemo, useState} from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import {AlertCircle, Check, CheckCheck, ChevronDown, Clock3, Loader2, RefreshCw, Search, Send, UserRound} from "lucide-react";
import {useAdminActor} from "@/components/admin/admin-shell";
import {DataError, EmptyState, PageHeader, Skeleton, UserAvatar} from "@/components/admin/admin-ui";
import {crmFetch} from "@/features/crm/api";
import {canManageLeads} from "@/features/crm/permissions";
import type {WhatsAppConversation, WhatsAppMessage} from "@/features/crm/types";
import {formatCrmDate} from "@/features/crm/format";

type TeamMember = {id: string; full_name: string; email: string; active: boolean};

export function WhatsAppInboxScreen({initialLeadId = ""}: {initialLeadId?: string}) {
    const actor = useAdminActor();
    const canAssign = canManageLeads(actor.role);
    const [conversations, setConversations] = useState<WhatsAppConversation[]>([]);
    const [selectedId, setSelectedId] = useState("");
    const [messages, setMessages] = useState<WhatsAppMessage[]>([]);
    const [members, setMembers] = useState<TeamMember[]>([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [messageLoading, setMessageLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const [assigning, setAssigning] = useState(false);
    const [error, setError] = useState("");

    const loadConversations = useCallback(async (silent = false) => {
        if (!silent) setLoading(true);
        try {
            const data = await crmFetch<{conversations: WhatsAppConversation[]}>("/api/admin/whatsapp/conversations");
            setConversations(data.conversations);
            setSelectedId((current) => {
                if (current && data.conversations.some((item) => item.id === current)) return current;
                return data.conversations.find((item) => item.lead_id === initialLeadId)?.id || data.conversations[0]?.id || "";
            });
            setError("");
        } catch (loadError) {
            if (!silent) setError(loadError instanceof Error ? loadError.message : "WhatsApp inbox could not be loaded.");
        } finally {
            if (!silent) setLoading(false);
        }
    }, [initialLeadId]);

    const loadMessages = useCallback(async (conversationId: string, silent = false) => {
        if (!conversationId) return;
        if (!silent) setMessageLoading(true);
        try {
            const data = await crmFetch<{messages: WhatsAppMessage[]}>(`/api/admin/whatsapp/conversations/${conversationId}/messages`);
            setMessages(data.messages);
        } catch (loadError) {
            if (!silent) toast.error(loadError instanceof Error ? loadError.message : "Messages could not be loaded.");
        } finally {
            if (!silent) setMessageLoading(false);
        }
    }, []);

    useEffect(() => {
        void loadConversations();
        const interval = window.setInterval(() => void loadConversations(true), 15000);
        return () => window.clearInterval(interval);
    }, [loadConversations]);

    useEffect(() => {
        if (!selectedId) {
            setMessages([]);
            return;
        }
        void loadMessages(selectedId);
        void crmFetch(`/api/admin/whatsapp/conversations/${selectedId}`, {method: "PATCH", body: JSON.stringify({markRead: true})})
            .then(() => setConversations((current) => current.map((item) => item.id === selectedId ? {...item, unread_count: 0} : item)))
            .catch(() => undefined);
        const interval = window.setInterval(() => void loadMessages(selectedId, true), 10000);
        return () => window.clearInterval(interval);
    }, [loadMessages, selectedId]);

    useEffect(() => {
        if (!canAssign) return;
        void crmFetch<{members: TeamMember[]}>('/api/admin/team')
            .then((data) => setMembers(data.members.filter((member) => member.active)))
            .catch(() => setMembers([]));
    }, [canAssign]);

    const selected = conversations.find((item) => item.id === selectedId) || null;
    const filtered = useMemo(() => {
        const query = search.trim().toLowerCase();
        if (!query) return conversations;
        return conversations.filter((item) => [item.contact_name, item.wa_id, item.lead?.company_name, item.last_message_preview]
            .some((value) => value?.toLowerCase().includes(query)));
    }, [conversations, search]);

    async function sendMessage(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!selected) return;
        const form = event.currentTarget;
        const body = String(new FormData(form).get("body") || "").trim();
        if (!body) return;
        setSending(true);
        try {
            await crmFetch(`/api/admin/whatsapp/conversations/${selected.id}/messages`, {method: "POST", body: JSON.stringify({body})});
            form.reset();
            await Promise.all([loadMessages(selected.id), loadConversations(true)]);
        } catch (sendError) {
            toast.error(sendError instanceof Error ? sendError.message : "Message could not be sent.");
        } finally {
            setSending(false);
        }
    }

    async function assignConversation(assignedTo: string) {
        if (!selected) return;
        setAssigning(true);
        try {
            await crmFetch(`/api/admin/whatsapp/conversations/${selected.id}`, {
                method: "PATCH",
                body: JSON.stringify({assignedTo: assignedTo || null}),
            });
            toast.success(assignedTo ? "Conversation assigned" : "Conversation unassigned");
            await loadConversations(true);
        } catch (assignError) {
            toast.error(assignError instanceof Error ? assignError.message : "Conversation could not be assigned.");
        } finally {
            setAssigning(false);
        }
    }

    if (error) return <DataError message={error} onRetry={() => void loadConversations()}/>;

    return <div className="space-y-5">
        <PageHeader
            title="WhatsApp Inbox"
            description={canAssign ? "Receive customer messages, assign conversations and reply from one workspace." : "Reply to WhatsApp conversations assigned to you."}
            actions={<button onClick={() => void loadConversations()} className="crm-button-secondary"><RefreshCw className="h-3.5 w-3.5"/> Refresh</button>}
        />
        <section className="crm-card grid min-h-[42rem] overflow-hidden lg:h-[calc(100vh-11.5rem)] lg:min-h-[38rem] lg:grid-cols-[21rem_minmax(0,1fr)]">
            <aside className="flex min-h-0 flex-col border-b border-[var(--crm-border)] lg:border-b-0 lg:border-r">
                <div className="border-b border-[var(--crm-border)] p-3">
                    <label className="relative block"><span className="sr-only">Search WhatsApp conversations</span><Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--crm-muted)]"/><input value={search} onChange={(event) => setSearch(event.target.value)} className="crm-control w-full pl-9" placeholder="Search conversations…"/></label>
                </div>
                <div className="max-h-[24rem] flex-1 overflow-y-auto lg:max-h-none">
                    {loading ? <div className="space-y-2 p-3">{Array.from({length: 7}).map((_, index) => <Skeleton key={index} className="h-20 w-full"/>)}</div> : filtered.length ? filtered.map((conversation) => <ConversationRow key={conversation.id} conversation={conversation} active={conversation.id === selectedId} onClick={() => setSelectedId(conversation.id)}/>) : <EmptyState title="No WhatsApp conversations" description={search ? "No conversation matches this search." : canAssign ? "New inbound WhatsApp messages will appear here automatically." : "An administrator can assign a conversation to you."}/>} 
                </div>
            </aside>

            <main className="flex min-h-[34rem] min-w-0 flex-col bg-[var(--crm-subtle)]/45">
                {selected ? <>
                    <ConversationHeader conversation={selected} canAssign={canAssign} members={members} assigning={assigning} onAssign={(id) => void assignConversation(id)}/>
                    <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                        {messageLoading ? <div className="space-y-4">{Array.from({length: 5}).map((_, index) => <Skeleton key={index} className={`h-16 ${index % 2 ? "ml-auto w-2/3" : "w-3/5"}`}/>)}</div> : messages.length ? <div className="mx-auto flex max-w-3xl flex-col gap-3">{messages.map((message) => <MessageBubble key={message.id} message={message}/>)}</div> : <EmptyState title="No stored messages" description="Messages received after the webhook is connected will appear here."/>}
                    </div>
                    <Composer conversation={selected} sending={sending} onSubmit={sendMessage}/>
                </> : <div className="flex flex-1 items-center justify-center"><EmptyState title="Select a conversation" description="Choose a WhatsApp conversation to view its messages and reply."/></div>}
            </main>
        </section>
    </div>;
}

function ConversationRow({conversation, active, onClick}: {conversation: WhatsAppConversation; active: boolean; onClick: () => void}) {
    const name = conversation.contact_name || conversation.lead?.customer_name || `+${conversation.wa_id}`;
    return <button onClick={onClick} className={`flex w-full gap-3 border-b border-[var(--crm-border)] p-3 text-left transition ${active ? "bg-[#e7f1f0] text-[#0d5c63] crm-dark:bg-white/[.08] crm-dark:text-white" : "hover:bg-[var(--crm-subtle)]"}`}>
        <UserAvatar name={name}/>
        <span className="min-w-0 flex-1"><span className="flex items-center justify-between gap-2"><span className="truncate text-xs font-semibold">{name}</span><span className="shrink-0 text-[9px] text-[var(--crm-muted)]">{shortTime(conversation.last_message_at)}</span></span><span className="mt-1 block truncate text-[10px] text-[var(--crm-muted)]">{conversation.last_message_preview || "New conversation"}</span><span className="mt-1.5 flex items-center justify-between gap-2"><span className="truncate text-[9px] text-[var(--crm-muted)]">{conversation.assigned_profile?.full_name || "Unassigned"}</span>{conversation.unread_count > 0 ? <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#0d5c63] px-1 text-[9px] font-bold text-white">{Math.min(conversation.unread_count, 99)}</span> : null}</span></span>
    </button>;
}

function ConversationHeader({conversation, canAssign, members, assigning, onAssign}: {conversation: WhatsAppConversation; canAssign: boolean; members: TeamMember[]; assigning: boolean; onAssign: (id: string) => void}) {
    const name = conversation.contact_name || conversation.lead?.customer_name || `+${conversation.wa_id}`;
    return <header className="flex flex-wrap items-center gap-3 border-b border-[var(--crm-border)] bg-[var(--crm-surface)] px-4 py-3 sm:px-5">
        <UserAvatar name={name}/><div className="min-w-0"><p className="truncate text-sm font-semibold">{name}</p><p className="text-[10px] text-[var(--crm-muted)]">+{conversation.wa_id}{conversation.lead?.company_name ? ` · ${conversation.lead.company_name}` : ""}</p></div>
        <div className="ml-auto flex items-center gap-2">{conversation.lead_id ? <Link href={`/admin/leads/${conversation.lead_id}`} className="crm-button-secondary">View lead</Link> : null}{canAssign ? <label className="relative"><span className="sr-only">Assign conversation</span><select aria-label="Assign conversation" value={conversation.assigned_to || ""} disabled={assigning} onChange={(event) => onAssign(event.target.value)} className="crm-control min-w-36 cursor-pointer appearance-none pr-9"><option value="">Unassigned</option>{members.map((member) => <option key={member.id} value={member.id}>{member.full_name || member.email}</option>)}</select>{assigning ? <Loader2 className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 animate-spin text-[var(--crm-muted)]"/> : <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--crm-muted)]"/>}</label> : <span className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--crm-border)] bg-[var(--crm-subtle)] px-3 py-2 text-[10px] text-[var(--crm-muted)]"><UserRound className="h-3 w-3"/>{conversation.assigned_profile?.full_name || "Assigned to you"}</span>}</div>
    </header>;
}

function MessageBubble({message}: {message: WhatsAppMessage}) {
    const outbound = message.direction === "outbound";
    return <div className={`flex ${outbound ? "justify-end" : "justify-start"}`}><div className={`max-w-[85%] rounded-xl px-3.5 py-2.5 shadow-sm sm:max-w-[72%] ${outbound ? "rounded-br-sm bg-[#0d5c63] text-white" : "rounded-bl-sm border border-[var(--crm-border)] bg-[var(--crm-surface)] text-[var(--crm-text)]"}`}>
        <p className="whitespace-pre-wrap break-words text-xs leading-5">{message.body || `[${message.message_type} message]`}</p>
        <span className={`mt-1.5 flex items-center justify-end gap-1 text-[9px] ${outbound ? "text-white/65" : "text-[var(--crm-muted)]"}`}>{formatCrmDate(message.message_timestamp, true)}{outbound ? <MessageStatus status={message.status}/> : null}</span>
        {message.status === "failed" ? <p className={`mt-1 text-[9px] ${outbound ? "text-rose-100" : "text-rose-600"}`}>{message.error_message || "Delivery failed"}</p> : null}
    </div></div>;
}

function MessageStatus({status}: {status: WhatsAppMessage["status"]}) {
    if (status === "queued") return <Clock3 aria-label="Queued" className="h-3 w-3"/>;
    if (status === "failed") return <AlertCircle aria-label="Failed" className="h-3 w-3"/>;
    if (status === "delivered" || status === "read") return <CheckCheck aria-label={status} className={`h-3 w-3 ${status === "read" ? "text-sky-200" : ""}`}/>;
    return <Check aria-label="Sent" className="h-3 w-3"/>;
}

function Composer({conversation, sending, onSubmit}: {conversation: WhatsAppConversation; sending: boolean; onSubmit: (event: FormEvent<HTMLFormElement>) => void}) {
    const windowOpen = Boolean(conversation.customer_service_window_expires_at && new Date(conversation.customer_service_window_expires_at).getTime() > Date.now());
    return <div className="border-t border-[var(--crm-border)] bg-[var(--crm-surface)] p-3 sm:p-4">{windowOpen ? <form onSubmit={onSubmit} className="mx-auto flex max-w-3xl items-end gap-2"><textarea name="body" required maxLength={4096} rows={2} className="admin-input h-auto min-h-12 flex-1 resize-y py-3" placeholder="Write a WhatsApp reply…"/><button disabled={sending} className="crm-button-primary h-12 px-4">{sending ? <Loader2 className="h-4 w-4 animate-spin"/> : <Send className="h-4 w-4"/>}<span className="hidden sm:inline">Send</span></button></form> : <div className="mx-auto flex max-w-3xl items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-[10px] leading-4 text-amber-800"><Clock3 className="mt-0.5 h-3.5 w-3.5 shrink-0"/><span>The 24-hour reply window is closed. The customer must message again, or an approved Meta message template must be used.</span></div>}</div>;
}

function shortTime(value: string | null) {
    if (!value) return "";
    const date = new Date(value);
    const now = new Date();
    return date.toDateString() === now.toDateString()
        ? new Intl.DateTimeFormat("en-IN", {hour: "2-digit", minute: "2-digit"}).format(date)
        : new Intl.DateTimeFormat("en-IN", {day: "2-digit", month: "short"}).format(date);
}
