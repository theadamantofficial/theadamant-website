"use client";
import dynamic from "next/dynamic";
import {useEffect, useState} from "react";
import {BotMessageSquare, Gauge} from "lucide-react";
import type {SiteLocale} from "@/lib/site-locale";
import {OPEN_WEBSITE_AUDIT_EVENT} from "@/lib/website-audit-events";
import {OPEN_SEO_CHAT_EVENT, type OpenSeoChatEventDetail} from "@/lib/seo-chat-events";
const Audit = dynamic(() => import("./website-audit-fab").then(module => module.WebsiteAuditFab), {ssr: false});
const Chat = dynamic(() => import("./seo-chat-fab").then(module => module.SeoChatFab), {ssr: false});
/** Keep lightweight launch buttons; load the forms and chat logic on demand. */
export function NonCriticalTools({locale}: {locale: SiteLocale}) {
    const [audit, setAudit] = useState(false), [chat, setChat] = useState(false);
    const [detail, setDetail] = useState<OpenSeoChatEventDetail | undefined>();
    useEffect(() => {
        const openAudit = () => setAudit(true);
        const openChat = (event: Event) => {setDetail((event as CustomEvent<OpenSeoChatEventDetail>).detail); setChat(true);};
        window.addEventListener(OPEN_WEBSITE_AUDIT_EVENT, openAudit);
        window.addEventListener(OPEN_SEO_CHAT_EVENT, openChat);
        return () => {window.removeEventListener(OPEN_WEBSITE_AUDIT_EVENT, openAudit); window.removeEventListener(OPEN_SEO_CHAT_EVENT, openChat);};
    }, []);
    if (locale !== "en") return null;
    return <>
        {audit ? <Audit locale={locale} initialOpen/> : <button type="button" className="audit-fab" onClick={() => setAudit(true)} aria-label="Open free website audit"><Gauge size={18}/><span className="hidden sm:inline">Free website audit</span><span className="sm:hidden">Audit</span></button>}
        {chat ? <Chat initialOpen initialDetail={detail}/> : <button type="button" className="seo-chat-fab" onClick={() => setChat(true)} aria-label="Open SEO AI chat"><BotMessageSquare size={18}/><span className="hidden sm:inline">SEO AI chat</span><span className="sm:hidden">SEO AI</span></button>}
    </>;
}
