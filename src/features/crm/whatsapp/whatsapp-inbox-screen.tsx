"use client";

import {useCallback, useEffect, useMemo, useState} from "react";
import Image from "next/image";
import Link from "next/link";
import toast from "react-hot-toast";
import {AlertCircle, ArrowLeft, AudioLines, BadgeIndianRupee, CalendarPlus, Check, CheckCheck, ChevronDown, Clock3, Download, FileText, Languages, Loader2, MapPin, Phone, PhoneIncoming, RefreshCw, Search, Send, SmilePlus, UserRound} from "lucide-react";
import {useAdminActor} from "@/components/admin/admin-shell";
import {DataError, EmptyState, PageHeader, Skeleton, UserAvatar} from "@/components/admin/admin-ui";
import {crmFetch} from "@/features/crm/api";
import {canManageLeads} from "@/features/crm/permissions";
import type {WhatsAppConversation, WhatsAppMessage} from "@/features/crm/types";
import {formatCrmDate} from "@/features/crm/format";
import {WhatsAppPaymentModal} from "@/features/crm/whatsapp/whatsapp-payment-modal";

type TeamMember = {id: string; full_name: string; email: string; active: boolean};
type WhatsAppTemplate = {
    name: string;
    language: string;
    category: string;
    parameterFormat: string;
    components: Array<{type?: unknown; text?: unknown; format?: unknown; buttons?: unknown}>;
};
type TranslationDirection = {targetLanguage: string; targetLanguageCode: string};
type OutgoingMessage = {body: string; template?: {name: string; language: string; parameters: Array<{name?: string; value: string}>}; translation?: TranslationDirection};

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
    const [promoting, setPromoting] = useState(false);
    const [reactingTo, setReactingTo] = useState("");
    const [paymentOpen, setPaymentOpen] = useState(false);
    const [mobileThreadOpen, setMobileThreadOpen] = useState(false);
    const [error, setError] = useState("");
    const [startPanel, setStartPanel] = useState<"chat" | "group" | null>(null);
    const [creating, setCreating] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [invite, setInvite] = useState("");
    const groupUrl = validGroupInvite(invite);

    useEffect(() => {
        const invitation = new URLSearchParams(window.location.search).get("groupInvite");
        if (invitation) {setInvite(invitation); setStartPanel("group");}
    }, []);

    async function startChat(form: HTMLFormElement) {
        if (creating) return;
        setCreating(true);
        try {
            const fields = new FormData(form);
            const {conversation} = await crmFetch<{conversation: WhatsAppConversation}>("/api/admin/whatsapp/conversations", {
                method: "POST", body: JSON.stringify({phone: fields.get("phone"), name: fields.get("name")}),
            });
            setMessages([]);
            setConversations((current) => [conversation, ...current.filter((item) => item.id !== conversation.id)]);
            setSelectedId(conversation.id);
            setMobileThreadOpen(true);
            setStartPanel(null);
        } catch (createError) {
            toast.error(createError instanceof Error ? createError.message : "Could not open the conversation.");
        } finally {setCreating(false);}
    }

    const loadConversations = useCallback(async (silent = false) => {
        if (!silent) setLoading(true);
        try {
            const data = await crmFetch<{conversations: WhatsAppConversation[]}>("/api/admin/whatsapp/conversations");
            setConversations(data.conversations);
            setSelectedId((current) => {
                if (current && data.conversations.some((item) => item.id === current)) return current;
                return data.conversations.find((item) => item.lead_id === initialLeadId)?.id || data.conversations[0]?.id || "";
            });
            if (initialLeadId && data.conversations.some((item) => item.lead_id === initialLeadId)) setMobileThreadOpen(true);
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
    const translationDirection = getConversationTranslation(messages);
    const filtered = useMemo(() => {
        const query = search.trim().toLowerCase();
        if (!query) return conversations;
        return conversations.filter((item) => [item.contact_name, item.wa_id, item.lead?.company_name, item.last_message_preview]
            .some((value) => value?.toLowerCase().includes(query)));
    }, [conversations, search]);

    async function sendMessage(payload: OutgoingMessage) {
        if (!selected) return false;
        setSending(true);
        try {
            const outgoing = !payload.template && translationDirection ? {...payload, translation: translationDirection} : payload;
            await crmFetch(`/api/admin/whatsapp/conversations/${selected.id}/messages`, {method: "POST", body: JSON.stringify(outgoing)});
            await Promise.all([loadMessages(selected.id), loadConversations(true)]);
            return true;
        } catch (sendError) {
            toast.error(sendError instanceof Error ? sendError.message : "Message could not be sent.");
            return false;
        } finally {
            setSending(false);
        }
    }

    async function deleteChat() {
        if (!selected || deleting) return;
        const target = selected;
        const leadWarning = target.lead_id
            ? `\n\nThis also permanently deletes the linked lead ${target.lead?.customer_name || target.lead_id}, its notes, tasks and activity history. Other chats linked to that lead will lose their lead link.`
            : "\n\nThere is no linked lead to delete.";
        if (!window.confirm(`Delete the CRM chat with ${target.contact_name || `+${target.wa_id}`}?\n\nAll stored messages and payment records for this chat will be permanently deleted.${leadWarning}\n\nThis cannot be undone and does not delete messages from the recipient's WhatsApp.`)) return;
        setDeleting(true);
        try {
            await crmFetch(`/api/admin/whatsapp/conversations/${target.id}`, {method: "DELETE", body: JSON.stringify({confirmed: true, expectedLeadId: target.lead_id})});
            setConversations((current) => current.filter((item) => item.id !== target.id));
            setSelectedId("");
            setMessages([]);
            setMobileThreadOpen(false);
            setPaymentOpen(false);
            toast.success(target.lead_id ? "Chat and linked lead deleted" : "Chat deleted");
            await loadConversations(true);
        } catch (deleteError) {
            toast.error(deleteError instanceof Error ? deleteError.message : "Chat could not be deleted.");
        } finally {setDeleting(false);}
    }

    async function sendReaction(messageId: string, emoji: string) {
        if (!selected) return;
        setReactingTo(messageId);
        try {
            await crmFetch(`/api/admin/whatsapp/conversations/${selected.id}/messages`, {method: "POST", body: JSON.stringify({reaction: {messageId, emoji}})});
            await loadMessages(selected.id, true);
        } catch (reactionError) {
            toast.error(reactionError instanceof Error ? reactionError.message : "Reaction could not be sent.");
        } finally {
            setReactingTo("");
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

    async function createLead() {
        if (!selected) return;
        setPromoting(true);
        try {
            await crmFetch(`/api/admin/whatsapp/conversations/${selected.id}`, {method: "PATCH", body: JSON.stringify({createLead: true})});
            toast.success("Lead created from this conversation");
            await loadConversations(true);
        } catch (promoteError) {
            toast.error(promoteError instanceof Error ? promoteError.message : "This contact could not be made into a lead.");
        } finally {
            setPromoting(false);
        }
    }

    if (error) return <DataError message={error} onRetry={() => void loadConversations()}/>;

    return <div className="space-y-3 sm:space-y-5">
        <PageHeader
            title="WhatsApp Inbox"
            description={canAssign ? "Receive customer messages, assign conversations and reply from one workspace." : "Reply to WhatsApp conversations assigned to you."}
            actions={<div className="flex flex-wrap gap-2">{canAssign ? <button onClick={() => setStartPanel("chat")} className="crm-button-primary">New chat</button> : null}<button onClick={() => setStartPanel("group")} className="crm-button-secondary">Join group</button><button onClick={() => void loadConversations()} className="crm-button-secondary"><RefreshCw className="h-3.5 w-3.5"/> Refresh</button></div>}
        />
        {startPanel ? <section className="crm-card space-y-3 p-4" aria-label={startPanel === "chat" ? "New WhatsApp chat" : "Join WhatsApp group"}>
            <div className="flex items-center justify-between gap-3"><h2 className="text-sm font-semibold">{startPanel === "chat" ? "Start a WhatsApp conversation" : "Open a group invitation"}</h2><button type="button" onClick={() => setStartPanel(null)} className="crm-button-secondary">Close</button></div>
            {startPanel === "chat" ? <form className="space-y-3" onSubmit={(event) => {event.preventDefault(); void startChat(event.currentTarget);}}>
                <div className="grid gap-3 sm:grid-cols-2"><label className="text-xs">Phone with country code<input name="phone" type="tel" required autoComplete="tel" placeholder="+91 98765 43210" className="admin-input mt-1"/></label><label className="text-xs">Contact name (optional)<input name="name" maxLength={300} autoComplete="name" className="admin-input mt-1"/></label></div>
                <p className="text-xs text-[var(--crm-muted)]">Choose an approved template in the chat to send the first message. Contact people who have agreed to receive your WhatsApp messages. Delivery depends on the number being registered with WhatsApp.</p>
                <button disabled={creating} className="crm-button-primary">{creating ? "Opening…" : "Open conversation"}</button>
            </form> : <div className="space-y-3">
                <label className="block text-xs">WhatsApp group invitation URL<input type="url" value={invite} onChange={(event) => setInvite(event.target.value)} placeholder="https://chat.whatsapp.com/…" className="admin-input mt-1"/></label>
                <p className="text-xs text-[var(--crm-muted)]">Continue in WhatsApp to review and join using the account signed in there. The group may require admin approval. Group chats are not synced to this inbox.</p>
                {groupUrl ? <div className="flex flex-wrap gap-2"><a href={groupUrl} target="_blank" rel="noopener noreferrer" className="crm-button-primary">Continue to WhatsApp</a><button type="button" className="crm-button-secondary" onClick={() => {
                    const link = new URL("/admin/whatsapp", window.location.origin);
                    link.searchParams.set("groupInvite", groupUrl);
                    void navigator.clipboard.writeText(link.toString()).then(() => toast.success("CRM invitation link copied")).catch(() => toast.error("Could not copy the link."));
                }}>Copy CRM invitation link</button></div> : invite ? <p role="alert" className="text-xs text-red-600">Enter a valid https://chat.whatsapp.com/ invitation link.</p> : null}
            </div>}
        </section> : null}
        <section className="crm-card grid h-[calc(100dvh-10.5rem)] min-h-[32rem] overflow-hidden sm:h-[calc(100dvh-11.5rem)] lg:min-h-[38rem] lg:grid-cols-[21rem_minmax(0,1fr)]">
            <aside className={`${mobileThreadOpen ? "hidden" : "flex"} min-h-0 flex-col lg:flex lg:border-r lg:border-[var(--crm-border)]`}>
                <div className="border-b border-[var(--crm-border)] p-3">
                    <label className="relative block"><span className="sr-only">Search WhatsApp conversations</span><Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--crm-muted)]"/><input value={search} onChange={(event) => setSearch(event.target.value)} className="crm-control w-full pl-9" placeholder="Search conversations…"/></label>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {loading ? <div className="space-y-2 p-3">{Array.from({length: 7}).map((_, index) => <Skeleton key={index} className="h-20 w-full"/>)}</div> : filtered.length ? filtered.map((conversation) => <ConversationRow key={conversation.id} conversation={conversation} active={conversation.id === selectedId} onClick={() => {setSelectedId(conversation.id); setMobileThreadOpen(true);}}/>) : <EmptyState title="No WhatsApp conversations" description={search ? "No conversation matches this search." : canAssign ? "New inbound WhatsApp messages will appear here automatically." : "An administrator can assign a conversation to you."}/>}</div>
            </aside>

            <main className={`${mobileThreadOpen ? "flex" : "hidden"} min-h-0 min-w-0 flex-col bg-[var(--crm-subtle)]/70 lg:flex`}>
                {selected ? <>
                    {canAssign ? <div className="flex justify-end border-b border-[var(--crm-border)] px-3 py-1"><button type="button" disabled={deleting} onClick={() => void deleteChat()} className="crm-button-secondary text-red-600">{deleting ? "Deleting…" : "Delete chat"}</button></div> : null}
                    <ConversationHeader conversation={selected} translation={translationDirection} canAssign={canAssign} members={members} assigning={assigning} promoting={promoting} onAssign={(id) => void assignConversation(id)} onPayment={() => setPaymentOpen(true)} onCreateLead={() => void createLead()} onBack={() => setMobileThreadOpen(false)}/>
                    <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                        {messageLoading ? <div className="space-y-4">{Array.from({length: 5}).map((_, index) => <Skeleton key={index} className={`h-16 ${index % 2 ? "ml-auto w-2/3" : "w-3/5"}`}/>)}</div> : messages.length ? <div className="mx-auto flex max-w-3xl flex-col gap-3">{messages.filter((message) => message.message_type !== "reaction").map((message) => <MessageBubble key={message.id} message={message} reactions={getMessageReactions(messages, message)} reacting={reactingTo === message.id} onReact={(emoji) => void sendReaction(message.id, emoji)}/>)}</div> : <EmptyState title="No stored messages" description="Messages received after the webhook is connected will appear here."/>}
                    </div>
                    <Composer key={selected.id} conversation={selected} translation={translationDirection} sending={sending} onSend={sendMessage}/>
                </> : <div className="flex flex-1 items-center justify-center"><EmptyState title="Select a conversation" description="Choose a WhatsApp conversation to view its messages and reply."/></div>}
            </main>
        </section>
        {selected && paymentOpen ? <WhatsAppPaymentModal conversation={selected} onClose={() => setPaymentOpen(false)} onChanged={() => void Promise.all([loadMessages(selected.id, true), loadConversations(true)])}/> : null}
    </div>;
}

function ConversationRow({conversation, active, onClick}: {conversation: WhatsAppConversation; active: boolean; onClick: () => void}) {
    const name = conversation.contact_name || conversation.lead?.customer_name || `+${conversation.wa_id}`;
    const secondaryText = active ? "text-[#3e6668] crm-dark:text-white/75" : "text-[var(--crm-muted)]";
    const tertiaryText = active ? "text-[#557476] crm-dark:text-white/60" : "text-[var(--crm-muted)]";
    return <button type="button" aria-current={active ? "true" : undefined} onClick={onClick} className={`relative flex w-full gap-3 border-b border-[var(--crm-border)] p-3 text-left transition focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#0d5c63] ${active ? "bg-[#dceceb] text-[#083f45] shadow-[inset_3px_0_0_#0d5c63] crm-dark:bg-[#193b3c] crm-dark:text-white crm-dark:shadow-[inset_3px_0_0_#5bc0bd]" : "hover:bg-[var(--crm-subtle)]"}`}>
        <UserAvatar name={name}/>
        <span className="min-w-0 flex-1"><span className="flex items-center justify-between gap-2"><span className="truncate text-xs font-semibold">{name}</span><span className={`shrink-0 text-[9px] font-medium ${tertiaryText}`}>{shortTime(conversation.last_message_at)}</span></span><span className={`mt-1 block truncate text-[10px] ${secondaryText}`}>{conversation.last_message_preview || "New conversation"}</span><span className="mt-1.5 flex items-center justify-between gap-2"><span className={`truncate text-[9px] ${tertiaryText}`}>{conversation.assigned_profile?.full_name || "Unassigned"}</span>{conversation.unread_count > 0 ? <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#0d5c63] px-1 text-[9px] font-bold text-white crm-dark:bg-[#5bc0bd] crm-dark:text-[#082f32]">{Math.min(conversation.unread_count, 99)}</span> : null}</span></span>
    </button>;
}

function ConversationHeader({conversation, translation, canAssign, members, assigning, promoting, onAssign, onPayment, onCreateLead, onBack}: {conversation: WhatsAppConversation; translation: TranslationDirection | null; canAssign: boolean; members: TeamMember[]; assigning: boolean; promoting: boolean; onAssign: (id: string) => void; onPayment: () => void; onCreateLead: () => void; onBack: () => void}) {
    const name = conversation.contact_name || conversation.lead?.customer_name || `+${conversation.wa_id}`;
    return <header className="border-b border-[var(--crm-border)] bg-[var(--crm-surface)] px-3 py-3 sm:px-5 lg:flex lg:items-center lg:gap-3">
        <div className="flex min-w-0 items-center gap-2 sm:gap-3"><button type="button" onClick={onBack} className="crm-icon-button lg:hidden" aria-label="Back to conversations"><ArrowLeft className="h-4 w-4"/></button><UserAvatar name={name}/><div className="min-w-0"><p className="truncate text-sm font-semibold">{name}</p><p className="truncate text-[10px] text-[var(--crm-muted)]">+{conversation.wa_id}{conversation.lead?.company_name ? ` · ${conversation.lead.company_name}` : ""}</p>{translation ? <p className="mt-0.5 flex items-center gap-1 truncate text-[9px] font-semibold text-[#0d6970]"><Languages className="h-3 w-3"/>Private translation: {translation.targetLanguage} → English · replies English → {translation.targetLanguage}</p> : null}</div></div>
        <div className="mt-3 flex items-center gap-2 overflow-x-auto pb-0.5 lg:ml-auto lg:mt-0 lg:justify-end lg:overflow-visible">
            <button type="button" onClick={onPayment} className="crm-button-primary"><BadgeIndianRupee className="h-3.5 w-3.5"/><span>Payment</span></button>
            <a href={`tel:+${conversation.wa_id}`} aria-label={`Call ${name} by phone`} title="Start a regular phone call" className="crm-button-secondary"><Phone className="h-3.5 w-3.5 text-[#0d5c63] crm-dark:text-[#70cbc7]"/><span>Call</span></a>
            <span title="WhatsApp Calling API setup is required before this CRM can receive calls."><button type="button" disabled aria-label="Receive WhatsApp calls; setup required" className="crm-button-secondary"><PhoneIncoming className="h-3.5 w-3.5"/><span>Receive</span><span className="rounded bg-[var(--crm-subtle)] px-1.5 py-0.5 text-[8px] uppercase tracking-wide text-[var(--crm-muted)]">Setup</span></button></span>
            {conversation.lead_id ? <Link href={`/admin/leads/${conversation.lead_id}`} className="crm-button-secondary">View lead</Link> : canAssign ? <button type="button" onClick={onCreateLead} disabled={promoting} className="crm-button-secondary">{promoting ? <Loader2 className="h-3.5 w-3.5 animate-spin"/> : <UserRound className="h-3.5 w-3.5"/>} Create lead</button> : null}
            {canAssign ? <label className="relative"><span className="sr-only">Assign conversation</span><select aria-label="Assign conversation" value={conversation.assigned_to || ""} disabled={assigning} onChange={(event) => onAssign(event.target.value)} className="crm-control min-w-36 cursor-pointer appearance-none pr-9"><option value="">Unassigned</option>{members.map((member) => <option key={member.id} value={member.id}>{member.full_name || member.email}</option>)}</select>{assigning ? <Loader2 className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 animate-spin text-[var(--crm-muted)]"/> : <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--crm-muted)]"/>}</label> : <span className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--crm-border)] bg-[var(--crm-subtle)] px-3 py-2 text-[10px] text-[var(--crm-muted)]"><UserRound className="h-3 w-3"/>{conversation.assigned_profile?.full_name || "Assigned to you"}</span>}
        </div>
    </header>;
}

function MessageBubble({message, reactions, reacting, onReact}: {message: WhatsAppMessage; reactions: string[]; reacting: boolean; onReact: (emoji: string) => void}) {
    const outbound = message.direction === "outbound";
    const translation = record(message.metadata?.translation);
    return <div className={`group flex ${outbound ? "justify-end" : "justify-start"}`}><div className={`relative max-w-[88%] rounded-2xl px-3.5 py-2.5 shadow-[0_2px_8px_rgba(15,23,42,.06)] sm:max-w-[72%] ${outbound ? "rounded-br-sm bg-[#0d5c63] text-white crm-dark:bg-[#116b72]" : "rounded-bl-sm border border-[#d7dedb] bg-white text-[#172321] crm-dark:border-white/10 crm-dark:bg-[#24312f] crm-dark:text-white"}`}>
        <MessageContent message={message}/>
        {translation && (outbound ? translation.targetLanguage : String(translation.detectedLanguageCode || "") !== "en") ? <details className={`mt-1.5 text-[9px] ${outbound ? "text-white/70" : "text-[#61716d] crm-dark:text-white/55"}`}><summary className="cursor-pointer select-none">{outbound ? `Sent in ${String(translation.targetLanguage || "recipient language")}` : `Translated from ${String(translation.detectedLanguage || "another language")}`}</summary><p className="mt-1 whitespace-pre-wrap rounded bg-black/5 p-1.5">{outbound ? String(translation.translatedText || "") : message.body}</p></details> : null}
        <span className={`mt-1.5 flex items-center justify-end gap-1 text-[9px] ${outbound ? "text-white/70" : "text-[#61716d] crm-dark:text-white/55"}`}>{formatCrmDate(message.message_timestamp, true)}{outbound ? <MessageStatus status={message.status}/> : null}</span>
        {message.status === "failed" ? <p className={`mt-1 text-[9px] ${outbound ? "text-rose-100" : "text-rose-600"}`}>{message.error_message || "Delivery failed"}</p> : null}
        <div className={`absolute -bottom-3 ${outbound ? "right-2" : "left-2"} flex items-center gap-1`}>{reactions.map((emoji, index) => <span key={`${emoji}-${index}`} className="rounded-full border border-[var(--crm-border)] bg-[var(--crm-surface)] px-1.5 py-0.5 text-xs shadow-sm">{emoji}</span>)}<span className="relative"><button type="button" disabled={reacting || !message.whatsapp_message_id} aria-label="React to message" className="flex h-6 w-6 items-center justify-center rounded-full border border-[var(--crm-border)] bg-[var(--crm-surface)] text-[var(--crm-muted)] opacity-100 shadow-sm sm:opacity-0 sm:group-hover:opacity-100"><SmilePlus className="h-3.5 w-3.5"/></button><span className="absolute bottom-7 left-0 z-10 hidden gap-0.5 rounded-full border border-[var(--crm-border)] bg-[var(--crm-surface)] p-1 shadow-xl focus-within:flex hover:flex">{["👍", "❤️", "😂", "😮", "😢", "🙏"].map((emoji) => <button key={emoji} type="button" onClick={() => onReact(emoji)} className="flex h-7 w-7 items-center justify-center rounded-full text-base hover:bg-[var(--crm-subtle)]">{emoji}</button>)}</span></span></div>
    </div></div>;
}

function MessageContent({message}: {message: WhatsAppMessage}) {
    const mediaUrl = `/api/admin/whatsapp/messages/${encodeURIComponent(message.id)}/media`;
    const referral = record(message.metadata?.referral);
    const location = record(message.metadata?.location);
    const translation = record(message.metadata?.translation);
    const visibleBody = message.direction === "inbound" && translation?.englishText ? String(translation.englishText) : message.body;
    return <div className="space-y-2">
        {referral && (referral.headline || referral.body) ? <a href={safeExternalUrl(referral.source_url) || undefined} target="_blank" rel="noreferrer" className="block rounded-lg border border-current/15 bg-black/5 px-3 py-2 text-[10px] leading-4 hover:bg-black/10"><span className="block font-semibold">{String(referral.headline || "WhatsApp referral")}</span>{referral.body ? <span className="block opacity-70">{String(referral.body)}</span> : null}</a> : null}
        {message.message_type === "image" && message.media_id ? <a href={mediaUrl} target="_blank" rel="noreferrer" className="block overflow-hidden rounded-xl"><Image unoptimized src={mediaUrl} alt={message.body || "WhatsApp image"} width={640} height={480} className="max-h-80 w-full object-cover"/></a> : null}
        {message.message_type === "sticker" && message.media_id ? <Image unoptimized src={mediaUrl} alt="WhatsApp sticker" width={180} height={180} className="h-auto max-h-44 w-auto max-w-full object-contain"/> : null}
        {message.message_type === "video" && message.media_id ? <video controls preload="metadata" className="max-h-80 w-full max-w-sm rounded-xl" src={mediaUrl}>Your browser does not support video playback.</video> : null}
        {message.message_type === "audio" && message.media_id ? <div className="w-64 max-w-full space-y-2 sm:w-72">
            <span className="flex items-center gap-2 text-[11px] font-semibold"><AudioLines className="h-4 w-4"/>Voice message</span>
            <audio
                controls
                preload="metadata"
                className="h-10 w-full max-w-full"
                aria-label="Play WhatsApp voice message"
                src={mediaUrl}
            >Your browser does not support audio playback.</audio>
        </div> : null}
        {message.message_type === "document" && message.media_id ? <a href={mediaUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 rounded-lg border border-current/15 px-3 py-2 text-[11px] font-semibold"><FileText className="h-4 w-4"/><span className="min-w-0 flex-1 truncate">{String(message.metadata?.filename || message.body || "Document")}</span><Download className="h-3.5 w-3.5"/></a> : null}
        {location && location.latitude && location.longitude ? <a href={`https://www.google.com/maps?q=${encodeURIComponent(`${location.latitude},${location.longitude}`)}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 rounded-lg border border-current/15 px-3 py-2 text-[11px] font-semibold"><MapPin className="h-4 w-4"/>Open shared location</a> : null}
        {visibleBody ? <p className="whitespace-pre-wrap break-words text-[13px] leading-5">{visibleBody === "[Unsupported message]" ? "WhatsApp did not provide the content of this older message." : visibleBody}</p> : null}
    </div>;
}

function MessageStatus({status}: {status: WhatsAppMessage["status"]}) {
    if (status === "queued") return <Clock3 aria-label="Queued" className="h-3 w-3"/>;
    if (status === "failed") return <AlertCircle aria-label="Failed" className="h-3 w-3"/>;
    if (status === "delivered" || status === "read") return <CheckCheck aria-label={status} className={`h-3 w-3 ${status === "read" ? "text-sky-200" : ""}`}/>;
    return <Check aria-label="Sent" className="h-3 w-3"/>;
}

function Composer({conversation, translation, sending, onSend}: {conversation: WhatsAppConversation; translation: TranslationDirection | null; sending: boolean; onSend: (payload: OutgoingMessage) => Promise<boolean>}) {
    const windowOpen = Boolean(conversation.customer_service_window_expires_at && new Date(conversation.customer_service_window_expires_at).getTime() > Date.now());
    const [templates, setTemplates] = useState<WhatsAppTemplate[]>([]);
    const [templateKey, setTemplateKey] = useState("");
    const [parameters, setParameters] = useState<Record<string, string>>({});
    const [loadingTemplates, setLoadingTemplates] = useState(false);

    useEffect(() => {
        if (windowOpen) return;
        setLoadingTemplates(true);
        void crmFetch<{templates: WhatsAppTemplate[]}>("/api/admin/whatsapp/templates")
            .then((data) => setTemplates(data.templates))
            .catch((loadError) => toast.error(loadError instanceof Error ? loadError.message : "Approved templates could not be loaded."))
            .finally(() => setLoadingTemplates(false));
    }, [windowOpen]);

    if (windowOpen) return <div className="border-t border-[var(--crm-border)] bg-[var(--crm-surface)] p-3 sm:p-4"><form onSubmit={(event) => {
        event.preventDefault();
        const form = event.currentTarget;
        const body = String(new FormData(form).get("body") || "").trim();
        if (!body) return;
        void onSend({body}).then((sent) => {if (sent) form.reset();});
    }} className="mx-auto max-w-3xl"><div className="flex items-end gap-2"><textarea name="body" required maxLength={4096} rows={2} className="admin-input h-auto min-h-12 flex-1 resize-none py-3 sm:resize-y" placeholder={translation ? `Type in English — sends in ${translation.targetLanguage}…` : "Write a WhatsApp reply…"}/><button disabled={sending} className="crm-button-primary h-12 px-4">{sending ? <Loader2 className="h-4 w-4 animate-spin"/> : <Send className="h-4 w-4"/>}<span className="hidden sm:inline">Send</span></button></div>{translation ? <p className="mt-1.5 flex items-center gap-1 text-[9px] text-[var(--crm-muted)]"><Languages className="h-3 w-3"/>Only your team sees English; the customer receives {translation.targetLanguage}.</p> : null}</form></div>;

    const selectedTemplate = templates.find((template) => `${template.name}:${template.language}` === templateKey) || null;
    const templateText = getTemplateBody(selectedTemplate);
    const variables = getTemplateVariables(selectedTemplate, templateText);
    const preview = renderTemplatePreview(templateText, variables, parameters);
    const complete = Boolean(selectedTemplate && variables.every((variable) => parameters[variable.key]?.trim()));
    return <div className="max-h-[50dvh] overflow-y-auto border-t border-[var(--crm-border)] bg-[var(--crm-surface)] p-3 sm:p-4">
        <form onSubmit={(event) => {
        event.preventDefault();
        if (!selectedTemplate || !complete) return;
        const templateParameters = variables.map((variable) => ({...(variable.name ? {name: variable.name} : {}), value: parameters[variable.key].trim()}));
        void onSend({body: preview || `Template: ${selectedTemplate.name}`, template: {name: selectedTemplate.name, language: selectedTemplate.language, parameters: templateParameters}});
    }} className="mx-auto max-w-3xl space-y-2">
        <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[10px] leading-4 text-amber-800"><Clock3 className="mt-0.5 h-3.5 w-3.5 shrink-0"/><span>The free-form reply window is closed. You can still start a message with an approved Meta template.</span></div>
        <div className="flex items-end gap-2"><label className="min-w-0 flex-1"><span className="sr-only">Approved WhatsApp template</span><select value={templateKey} onChange={(event) => {setTemplateKey(event.target.value); setParameters({});}} disabled={loadingTemplates || sending} className="crm-control w-full"><option value="">{loadingTemplates ? "Loading approved templates…" : templates.length ? "Choose an approved template…" : "No usable approved templates"}</option>{templates.map((template) => <option key={`${template.name}:${template.language}`} value={`${template.name}:${template.language}`}>{template.name.replaceAll("_", " ")} · {template.language}</option>)}</select></label><button disabled={sending || !complete} className="crm-button-primary"><Send className="h-4 w-4"/><span className="hidden sm:inline">Send template</span></button></div>
        {selectedTemplate ? <div className="rounded-lg border border-[var(--crm-border)] bg-[var(--crm-subtle)] p-2.5"><p className="whitespace-pre-wrap text-[11px] leading-4">{preview}</p>{variables.length ? <div className="mt-2 grid gap-2 sm:grid-cols-2">{variables.map((variable) => {
            const inputType = templateVariableInputType(variable);
            return <label key={variable.key} className="text-[9px] font-semibold capitalize text-[var(--crm-muted)]">{variable.label}
                <div className="relative mt-1">
                    <input type={inputType} value={parameters[variable.key] || ""} onChange={(event) => setParameters((current) => ({...current, [variable.key]: event.target.value}))} maxLength={1024} required className="crm-control w-full" placeholder={inputType === "date" ? "Choose a date" : inputType === "datetime-local" ? "Choose date and time" : `Value for ${variable.label}`}/>
                    {inputType === "url" && <button type="button" className="mt-1 text-[10px] font-semibold text-[#0d5c63] hover:underline" onClick={() => window.open("https://meet.google.com/new", "_blank", "noopener,noreferrer")}>Create Google Meet link</button>}
                </div>
            </label>;
        })}</div> : null}
        {isMeetingTemplate(templateText, variables) && complete ? <a
            href={googleCalendarUrl(conversation, selectedTemplate?.name || "Meeting", variables, parameters, templateText)}
            target="_blank"
            rel="noopener noreferrer"
            className="crm-button-secondary mt-2"
        ><CalendarPlus className="h-3.5 w-3.5"/> Add meeting to Google Calendar</a> : null}
        </div> : null}
    </form></div>;
}

function record(value: unknown): Record<string, unknown> | null {
    return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : null;
}

function safeExternalUrl(value: unknown) {
    if (typeof value !== "string") return "";
    try {
        const url = new URL(value);
        return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : "";
    } catch {
        return "";
    }
}

function getTemplateBody(template: WhatsAppTemplate | null) {
    const body = template?.components.find((component) => component.type === "BODY");
    return typeof body?.text === "string" ? body.text : "";
}

function getTemplateVariables(template: WhatsAppTemplate | null, body: string) {
    if (!template) return [];
    const named = template.parameterFormat.toUpperCase() === "NAMED";
    const matches = Array.from(body.matchAll(named ? /{{\s*([a-z][a-z0-9_]*)\s*}}/gi : /{{\s*(\d+)\s*}}/g));
    return Array.from(new Set(matches.map((match) => match[1]))).map((key) => ({key, name: named ? key : undefined, label: named ? key.replaceAll("_", " ") : `Variable ${key}`}));
}

function templateVariableInputType(variable: {key: string; label: string}) {
    const name = `${variable.key} ${variable.label}`.toLowerCase();
    if (/(^|[\s_])(date|day)([\s_]|$)/.test(name) && !/(time|at)/.test(name)) return "date";
    if (/(date.?time|time|schedule|slot|when)/.test(name)) return "datetime-local";
    if (/(meet|meeting|google)/.test(name)) return "url";
    return "text";
}

function isMeetingTemplate(body: string, variables: Array<{key: string; label: string}>) {
    return /(meet|meeting|calendar|schedule|appointment)/i.test(`${body} ${variables.map((variable) => `${variable.key} ${variable.label}`).join(" ")}`);
}

function googleCalendarUrl(conversation: WhatsAppConversation, templateName: string, variables: Array<{key: string; label: string}>, parameters: Record<string, string>, body: string) {
    const title = `${templateName.replaceAll("_", " ")} · ${conversation.contact_name || conversation.lead?.customer_name || `+${conversation.wa_id}`}`;
    const dateKey = variables.find((variable) => /(date|day|when|schedule)/i.test(`${variable.key} ${variable.label}`))?.key;
    const dateValue = dateKey ? parameters[dateKey] : "";
    const start = dateValue ? calendarDate(dateValue) : "";
    const end = start ? calendarDate(new Date(new Date(dateValue).getTime() + 60 * 60 * 1000).toISOString()) : "";
    const meetingKey = variables.find((variable) => /(meet|meeting|google|link)/i.test(`${variable.key} ${variable.label}`))?.key;
    const meetingLink = meetingKey ? parameters[meetingKey] : "";
    const details = `${body}\n\nClient: ${conversation.contact_name || conversation.lead?.customer_name || `+${conversation.wa_id}`}${meetingLink ? `\nGoogle Meet: ${meetingLink}` : ""}`;
    const params = new URLSearchParams({action: "TEMPLATE", text: title, details});
    if (start && end) params.set("dates", `${start}/${end}`);
    if (conversation.lead?.email) params.set("add", conversation.lead.email);
    return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function calendarDate(value: string) {
    const date = new Date(value);
    if (!Number.isFinite(date.getTime())) return "";
    return date.toISOString().replaceAll(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}

function renderTemplatePreview(body: string, variables: Array<{key: string}>, parameters: Record<string, string>) {
    return variables.reduce((preview, variable) => preview.replace(new RegExp(`{{\\s*${variable.key}\\s*}}`, "gi"), parameters[variable.key]?.trim() || `{{${variable.key}}}`), body);
}

function getConversationTranslation(messages: WhatsAppMessage[]): TranslationDirection | null {
    for (let index = messages.length - 1; index >= 0; index -= 1) {
        const message = messages[index];
        if (message.direction !== "inbound" || message.message_type === "reaction") continue;
        if (!message.body?.trim()) continue;
        const translation = record(message.metadata?.translation);
        if (!translation) return null;
        const targetLanguage = String(translation.detectedLanguage || "").trim();
        const targetLanguageCode = String(translation.detectedLanguageCode || "").trim().toLowerCase();
        if (!targetLanguage || targetLanguageCode === "en" || /^english$/i.test(targetLanguage)) return null;
        return {targetLanguage, targetLanguageCode};
    }
    return null;
}

function getMessageReactions(messages: WhatsAppMessage[], target: WhatsAppMessage) {
    if (!target.whatsapp_message_id) return [];
    const latestBySide = new Map<WhatsAppMessage["direction"], string>();
    for (const message of messages) {
        if (message.message_type !== "reaction" || message.metadata?.reacted_to_message_id !== target.whatsapp_message_id) continue;
        latestBySide.set(message.direction, String(message.metadata?.emoji || message.body.replace(/^Reacted\s+/, "")).trim());
    }
    return Array.from(latestBySide.values()).filter(Boolean);
}

function shortTime(value: string | null) {
    if (!value) return "";
    const date = new Date(value);
    const now = new Date();
    return date.toDateString() === now.toDateString()
        ? new Intl.DateTimeFormat("en-IN", {hour: "2-digit", minute: "2-digit"}).format(date)
        : new Intl.DateTimeFormat("en-IN", {day: "2-digit", month: "short"}).format(date);
}

function validGroupInvite(value: string) {
    try {
        const url = new URL(value.trim());
        if (url.protocol !== "https:" || url.hostname !== "chat.whatsapp.com" || url.port || url.username || url.password || !/^\/[a-zA-Z0-9_-]{10,100}\/?$/.test(url.pathname)) return "";
        return `https://chat.whatsapp.com/${url.pathname.split("/")[1]}`;
    } catch {return "";}
}
