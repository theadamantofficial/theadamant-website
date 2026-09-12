"use client";

import dynamic from "next/dynamic";
import {useEffect, useState} from "react";
import type {SiteLocale} from "@/lib/site-locale";

const WebsiteAuditFab = dynamic(
    () => import("@/components/ui/website-audit-fab").then((module) => module.WebsiteAuditFab),
    {ssr: false},
);
const SeoChatFab = dynamic(
    () => import("@/components/ui/seo-chat-fab").then((module) => module.SeoChatFab),
    {ssr: false},
);

/** Defer lead tools until the browser has completed the critical page work. */
export function NonCriticalTools({locale}: {locale: SiteLocale}) {
    const [enabled, setEnabled] = useState(false);

    useEffect(() => {
        const schedule = window.requestIdleCallback
            ? window.requestIdleCallback(() => setEnabled(true), {timeout: 4000})
            : window.setTimeout(() => setEnabled(true), 2500);
        return () => window.cancelIdleCallback
            ? window.cancelIdleCallback(schedule as number)
            : window.clearTimeout(schedule as number);
    }, []);

    if (!enabled) return null;
    return <>
        {locale === "en" && <WebsiteAuditFab locale={locale}/>} 
        {locale === "en" && <SeoChatFab/>}
    </>;
}
