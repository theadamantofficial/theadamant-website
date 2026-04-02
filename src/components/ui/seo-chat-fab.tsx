"use client";

import {AnimatePresence, motion} from "motion/react";
import {BotMessageSquare, LoaderCircle, Maximize2, MessageSquareText, Minimize2, PhoneCall, SendHorizontal, Sparkles, UserRound, X} from "lucide-react";
import {FormEvent, type ReactNode, useEffect, useMemo, useRef, useState} from "react";
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/text-area";
import {OPEN_SEO_CHAT_EVENT, type OpenSeoChatEventDetail} from "@/lib/seo-chat-events";
import {OpenAuditButton} from "@/components/ui/open-audit-button";
import {SeoChatLead, SeoChatMessage, normalizeSeoChatLead} from "@/lib/seo-chat";
import {cn} from "@/lib/utils";

const initialLeadState: SeoChatLead = {
    name: "",
    email: "",
    phone: "",
    company: "",
    websiteUrl: "",
    issue: "",
};

export function SeoChatFab() {
    const [isOpen, setIsOpen] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [lead, setLead] = useState<SeoChatLead>(initialLeadState);
    const [messages, setMessages] = useState<SeoChatMessage[]>([]);
    const [draft, setDraft] = useState("");
    const [sessionId, setSessionId] = useState("");
    const [isResponding, setIsResponding] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [hasStarted, setHasStarted] = useState(false);
    const [hasEnded, setHasEnded] = useState(false);
    const [snapshotTitle, setSnapshotTitle] = useState("");
    const transcriptRef = useRef<HTMLDivElement | null>(null);
    const flushChatSessionRef = useRef<(reason: string) => Promise<void>>(async () => undefined);
    const currentPath = typeof window === "undefined" ? "" : window.location.pathname;

    const leadSummary = useMemo(() => [
        lead.company || lead.name,
        lead.websiteUrl || "No URL yet",
    ].filter(Boolean).join(" | "), [lead]);

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        return () => {
            document.body.style.overflow = previousOverflow;
        };
    }, [isOpen]);

    useEffect(() => {
        const handleOpen = (event: Event) => {
            const detail = (event as CustomEvent<OpenSeoChatEventDetail>).detail;

            setIsOpen(true);
            if (detail?.websiteUrl || detail?.issue) {
                setLead((current) => ({
                    ...current,
                    websiteUrl: detail.websiteUrl || current.websiteUrl,
                    issue: detail.issue || current.issue,
                }));
            }
        };

        window.addEventListener(OPEN_SEO_CHAT_EVENT, handleOpen);
        return () => window.removeEventListener(OPEN_SEO_CHAT_EVENT, handleOpen);
    }, []);

    useEffect(() => {
        transcriptRef.current?.scrollTo({
            top: transcriptRef.current.scrollHeight,
            behavior: "smooth",
        });
    }, [messages, isResponding]);

    flushChatSessionRef.current = async (reason: string) => {
        if (!hasStarted || hasEnded) {
            setIsOpen(false);
            return;
        }

        setHasEnded(true);
        const payload = JSON.stringify({
            sessionId,
            reason,
            pagePath: currentPath,
            lead,
            messages,
        });

        if (navigator.sendBeacon) {
            const blob = new Blob([payload], {type: "application/json"});
            navigator.sendBeacon("/api/seo-chat/end", blob);
            return;
        }

        await fetch("/api/seo-chat/end", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: payload,
            keepalive: true,
        }).then(() => undefined).catch(() => undefined);
    };

    useEffect(() => {
        if (!isOpen || !hasStarted || hasEnded) {
            return;
        }

        const handleBeforeUnload = () => {
            void flushChatSessionRef.current("page_exit");
        };

        window.addEventListener("beforeunload", handleBeforeUnload);
        return () => window.removeEventListener("beforeunload", handleBeforeUnload);
    }, [hasEnded, hasStarted, isOpen]);

    async function startChat(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setErrorMessage("");
        setIsResponding(true);

        const normalizedLead = normalizeSeoChatLead(lead);

        try {
            const response = await fetch("/api/seo-chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    lead: normalizedLead,
                    messages: [],
                    pagePath: currentPath,
                }),
            });

            const payload = await safeJson<{
                error?: string;
                message?: string;
                snapshot?: {
                    title?: string | null;
                };
            }>(response);

            if (!response.ok || !payload.message) {
                throw new Error(payload.error || "SEO chat is unavailable right now.");
            }

            setLead(normalizedLead);
            setSessionId(window.crypto?.randomUUID?.() || String(Date.now()));
            setMessages([createMessage("assistant", payload.message)]);
            setIsExpanded(true);
            setHasStarted(true);
            setHasEnded(false);
            setSnapshotTitle(payload.snapshot?.title || "");
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : "SEO chat is unavailable right now.");
        } finally {
            setIsResponding(false);
        }
    }

    async function sendMessage(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const nextDraft = draft.trim();
        if (!nextDraft || isResponding) {
            return;
        }

        const nextMessages = [
            ...messages,
            createMessage("user", nextDraft),
        ];

        setDraft("");
        setMessages(nextMessages);
        setIsResponding(true);
        setErrorMessage("");

        try {
            const response = await fetch("/api/seo-chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    lead,
                    messages: nextMessages,
                    pagePath: currentPath,
                }),
            });

            const payload = await safeJson<{
                error?: string;
                message?: string;
                snapshot?: {
                    title?: string | null;
                };
            }>(response);

            if (!response.ok || !payload.message) {
                throw new Error(payload.error || "SEO chat is unavailable right now.");
            }

            setMessages((current) => [...current, createMessage("assistant", payload.message!)]);
            setIsExpanded(true);
            setSnapshotTitle(payload.snapshot?.title || snapshotTitle);
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : "SEO chat is unavailable right now.");
        } finally {
            setIsResponding(false);
        }
    }

    async function closeChat(reason: string) {
        await flushChatSessionRef.current(reason);
        resetChat();
    }

    function resetChat() {
        setIsOpen(false);
        setIsExpanded(false);
        setLead(initialLeadState);
        setMessages([]);
        setDraft("");
        setErrorMessage("");
        setHasStarted(false);
        setHasEnded(false);
        setSnapshotTitle("");
        setSessionId("");
        setIsResponding(false);
    }

    return (
        <>
            <motion.button
                type="button"
                className="seo-chat-fab"
                initial={{opacity: 0, y: 24}}
                animate={{opacity: 1, y: 0}}
                transition={{duration: 0.55, delay: 0.08, ease: [0.22, 1, 0.36, 1]}}
                whileHover={{y: -4, scale: 1.01}}
                whileTap={{scale: 0.98}}
                onClick={() => setIsOpen(true)}
            >
                <span className="seo-chat-fab-pulse"/>
                <BotMessageSquare className="h-4.5 w-4.5"/>
                <span className="hidden sm:inline">SEO AI chat</span>
                <span className="sm:hidden">SEO AI</span>
            </motion.button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <motion.button
                            type="button"
                            aria-label="Close SEO AI chat"
                            className="fixed inset-0 z-[75] bg-black/45 backdrop-blur-[3px]"
                            initial={{opacity: 0}}
                            animate={{opacity: 1}}
                            exit={{opacity: 0}}
                            onClick={() => void closeChat("overlay_close")}
                        />

                        <motion.aside
                            className={cn("seo-chat-sheet", isExpanded && "seo-chat-sheet-expanded")}
                            initial={{opacity: 0, y: 28, scale: 0.98}}
                            animate={{opacity: 1, y: 0, scale: 1}}
                            exit={{opacity: 0, y: 24, scale: 0.98}}
                            transition={{duration: 0.32, ease: [0.22, 1, 0.36, 1]}}
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="seo-chat-title"
                        >
                            <div className="flex h-full flex-col overflow-hidden">
                                <div className="flex items-start justify-between border-b border-black/8 px-5 py-5 dark:border-white/8 sm:px-6">
                                    <div className="max-w-sm">
                                        <p className="section-kicker !px-3 !py-1.5">
                                            <Sparkles className="h-3.5 w-3.5"/>
                                            SEO AI
                                        </p>
                                        <h2 id="seo-chat-title" className="mt-4 text-2xl font-semibold text-foreground">
                                            Quick SEO help with lead capture built in.
                                        </h2>
                                        <p className="mt-2 text-sm leading-6 text-foreground/70">
                                            Share your details, website, and issue first. Closing the chat sends the transcript to The Adamant team.
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        {hasStarted && (
                                            <button
                                                type="button"
                                                className="button-secondary h-10 px-3"
                                                aria-label={isExpanded ? "Minimize SEO AI chat" : "Maximize SEO AI chat"}
                                                onClick={() => setIsExpanded((current) => !current)}
                                            >
                                                {isExpanded ? <Minimize2 className="h-4 w-4"/> : <Maximize2 className="h-4 w-4"/>}
                                                <span className="hidden sm:inline">{isExpanded ? "Minimize" : "Maximize"}</span>
                                            </button>
                                        )}
                                        <button
                                            type="button"
                                            className="theme-toggle h-10 w-10"
                                            onClick={() => void closeChat("dialog_close")}
                                        >
                                            <X className="h-4.5 w-4.5"/>
                                        </button>
                                    </div>
                                </div>

                                {!hasStarted ? (
                                    <form className="flex-1 overflow-y-auto px-5 py-5 sm:px-6" onSubmit={startChat}>
                                        <div className="grid gap-4">
                                            <LeadField
                                                icon={<UserRound className="h-4 w-4"/>}
                                                label="Full name"
                                                value={lead.name}
                                                onChange={(value) => setLead((current) => ({...current, name: value}))}
                                                placeholder="Rahul Patel"
                                            />
                                            <LeadField
                                                icon={<MessageSquareText className="h-4 w-4"/>}
                                                label="Email"
                                                type="email"
                                                value={lead.email}
                                                onChange={(value) => setLead((current) => ({...current, email: value}))}
                                                placeholder="rahul@example.com"
                                            />
                                            <LeadField
                                                icon={<PhoneCall className="h-4 w-4"/>}
                                                label="Phone number"
                                                value={lead.phone}
                                                onChange={(value) => setLead((current) => ({...current, phone: value}))}
                                                placeholder="+91 98765 43210"
                                            />
                                            <LeadField
                                                icon={<BotMessageSquare className="h-4 w-4"/>}
                                                label="Company"
                                                value={lead.company || ""}
                                                onChange={(value) => setLead((current) => ({...current, company: value}))}
                                                placeholder="The Adamant"
                                                required={false}
                                            />
                                            <LeadField
                                                icon={<MessageSquareText className="h-4 w-4"/>}
                                                label="Website URL"
                                                value={lead.websiteUrl || ""}
                                                onChange={(value) => setLead((current) => ({...current, websiteUrl: value}))}
                                                placeholder="https://yourwebsite.com"
                                                required={false}
                                            />

                                            <div className="rounded-[1.4rem] border border-black/8 bg-black/[0.03] p-4 dark:border-white/10 dark:bg-white/[0.03]">
                                                <label className="block text-sm font-medium text-foreground" htmlFor="seo-chat-issue">
                                                    Main issue
                                                </label>
                                                <Textarea
                                                    id="seo-chat-issue"
                                                    className="mt-2"
                                                    value={lead.issue}
                                                    onChange={(event) => setLead((current) => ({...current, issue: event.target.value}))}
                                                    placeholder="Explain the SEO, conversion, speed, or landing-page issue you want help fixing."
                                                    rows={4}
                                                    required
                                                />
                                            </div>

                                            <div className="rounded-[1.4rem] border border-black/8 bg-black/[0.03] p-4 text-sm leading-6 text-foreground/68 dark:border-white/10 dark:bg-white/[0.03]">
                                                The chat will analyze the provided website URL at runtime when possible, so the advice is less generic than a normal assistant chat.
                                            </div>

                                            {errorMessage && (
                                                <div className="rounded-[1.2rem] border border-destructive/20 bg-destructive/8 px-4 py-3 text-sm text-destructive">
                                                    {errorMessage}
                                                </div>
                                            )}

                                            <div className="flex flex-wrap gap-3">
                                                <button type="submit" className="button-primary" disabled={isResponding}>
                                                    {isResponding ? "Starting..." : "Start SEO AI chat"}
                                                    {isResponding ? <LoaderCircle className="h-4 w-4 animate-spin"/> : <SendHorizontal className="h-4 w-4"/>}
                                                </button>
                                                <OpenAuditButton>
                                                    Run full audit instead
                                                </OpenAuditButton>
                                            </div>
                                        </div>
                                    </form>
                                ) : (
                                    <>
                                        <div className="border-b border-black/8 px-5 py-4 dark:border-white/8 sm:px-6">
                                            <div className="flex flex-wrap items-center gap-3">
                                                <span className="feature-chip !px-3 !py-1 text-xs">Lead: {lead.name}</span>
                                                <span className="feature-chip !px-3 !py-1 text-xs">{leadSummary}</span>
                                                {snapshotTitle && <span className="feature-chip !px-3 !py-1 text-xs">Page title: {snapshotTitle}</span>}
                                            </div>
                                        </div>

                                        <div
                                            ref={transcriptRef}
                                            className={cn(
                                                "seo-chat-transcript flex-1 overflow-y-auto px-5 py-5 sm:px-6",
                                                isExpanded && "seo-chat-transcript-expanded",
                                            )}
                                        >
                                            <div className="space-y-4">
                                                {messages.map((message) => (
                                                    <div
                                                        key={message.id}
                                                        className={message.role === "assistant" ? "seo-chat-bubble seo-chat-bubble-assistant" : "seo-chat-bubble seo-chat-bubble-user"}
                                                    >
                                                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground/50">
                                                            {message.role === "assistant" ? "SEO AI" : "You"}
                                                        </p>
                                                        <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-foreground/80">
                                                            {message.content}
                                                        </p>
                                                    </div>
                                                ))}
                                                {isResponding && (
                                                    <div className="seo-chat-bubble seo-chat-bubble-assistant">
                                                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground/50">
                                                            SEO AI
                                                        </p>
                                                        <div className="mt-3 inline-flex items-center gap-2 text-sm text-foreground/70">
                                                            <LoaderCircle className="h-4 w-4 animate-spin"/>
                                                            Thinking through your site...
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="border-t border-black/8 px-5 py-4 dark:border-white/8 sm:px-6">
                                            {errorMessage && (
                                                <div className="mb-3 rounded-[1.2rem] border border-destructive/20 bg-destructive/8 px-4 py-3 text-sm text-destructive">
                                                    {errorMessage}
                                                </div>
                                            )}

                                            <form className="flex flex-col gap-3" onSubmit={sendMessage}>
                                                <Textarea
                                                    value={draft}
                                                    onChange={(event) => setDraft(event.target.value)}
                                                    placeholder="Ask about homepage SEO, landing pages, keyword targeting, metadata, schema, local SEO, or conversion fixes."
                                                    rows={3}
                                                />
                                                <div className="flex flex-wrap gap-3">
                                                    <button type="submit" className="button-primary" disabled={isResponding}>
                                                        Send
                                                        <SendHorizontal className="h-4 w-4"/>
                                                    </button>
                                                    <OpenAuditButton>
                                                        Run full audit
                                                    </OpenAuditButton>
                                                    <button type="button" className="button-secondary" onClick={() => void closeChat("manual_end")}>
                                                        End chat
                                                    </button>
                                                </div>
                                            </form>
                                        </div>
                                    </>
                                )}
                            </div>
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}

function LeadField({
    icon,
    label,
    value,
    onChange,
    placeholder,
    type = "text",
    required = true,
}: {
    icon: ReactNode;
    label: string;
    value: string;
    onChange: (value: string) => void;
    placeholder: string;
    type?: string;
    required?: boolean;
}) {
    return (
        <div className="rounded-[1.4rem] border border-black/8 bg-black/[0.03] p-4 dark:border-white/10 dark:bg-white/[0.03]">
            <div className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
                {icon}
                <span>{label}</span>
            </div>
            <Input
                type={type}
                value={value}
                onChange={(event) => onChange(event.target.value)}
                placeholder={placeholder}
                required={required}
            />
        </div>
    );
}

function createMessage(role: SeoChatMessage["role"], content: string): SeoChatMessage {
    return {
        id: `${role}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        role,
        content,
    };
}

async function safeJson<T>(response: Response) {
    const raw = await response.text();

    if (!raw) {
        return {} as T;
    }

    try {
        return JSON.parse(raw) as T;
    } catch {
        return {error: raw} as T;
    }
}
