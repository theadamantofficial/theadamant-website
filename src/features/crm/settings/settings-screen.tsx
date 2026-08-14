"use client";

import {ReactNode, useEffect, useState} from "react";
import {Check, Copy, Database, Globe2, Laptop, Loader2, Mail, MessageCircle, Moon, Sun} from "lucide-react";
import toast from "react-hot-toast";
import {PageHeader} from "@/components/admin/admin-ui";
import {useAdminTheme} from "@/components/admin/admin-theme-provider";
import {crmFetch} from "@/features/crm/api";

type WhatsAppStatus = {
    configured: boolean;
    accessToken: boolean;
    phoneNumberId: boolean;
    businessAccountId: boolean;
    appSecret: boolean;
    verifyToken: boolean;
    callbackUrl: string;
};

export function SettingsScreen() {
    const {theme, setTheme} = useAdminTheme();
    const [whatsApp, setWhatsApp] = useState<WhatsAppStatus | null>(null);

    useEffect(() => {
        void crmFetch<WhatsAppStatus>("/api/admin/whatsapp/status")
            .then(setWhatsApp)
            .catch(() => setWhatsApp(null));
    }, []);

    async function copyCallback() {
        if (!whatsApp?.callbackUrl) return;
        await navigator.clipboard.writeText(whatsApp.callbackUrl);
        toast.success("Webhook callback copied");
    }

    return <div className="mx-auto max-w-4xl space-y-5">
        <PageHeader title="Settings" description="Workspace preferences and integration readiness."/>
        <section className="crm-card p-5 sm:p-6">
            <h2 className="text-sm font-semibold">Appearance</h2>
            <p className="mt-1 text-[11px] text-[var(--crm-muted)]">Choose how the CRM looks on this device.</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">{([
                {id: "light", label: "Light", icon: Sun},
                {id: "dark", label: "Dark", icon: Moon},
                {id: "system", label: "System", icon: Laptop},
            ] as const).map((option) => {
                const Icon = option.icon;
                return <button key={option.id} onClick={() => setTheme(option.id)} className={`flex items-center gap-3 rounded-lg border p-3 text-left transition ${theme === option.id ? "border-[#0d5c63] bg-[#eaf3f2] text-[#0d5c63]" : "border-[var(--crm-border)] bg-[var(--crm-surface)] hover:bg-[var(--crm-subtle)]"}`}><span className="flex h-8 w-8 items-center justify-center rounded-lg border border-current/15"><Icon className="h-4 w-4"/></span><span className="text-xs font-semibold">{option.label}</span>{theme === option.id ? <Check className="ml-auto h-4 w-4"/> : null}</button>;
            })}</div>
        </section>
        <section className="crm-card overflow-hidden">
            <div className="border-b border-[var(--crm-border)] p-5 sm:p-6"><h2 className="text-sm font-semibold">Connections</h2><p className="mt-1 text-[11px] text-[var(--crm-muted)]">Website enquiries flow into the CRM while existing email and Discord delivery continues.</p></div>
            <div className="divide-y divide-[var(--crm-border)]">
                <Connection icon={<Database className="h-4 w-4"/>} name="Supabase" description="Authentication, PostgreSQL data and RLS" status="Connected" active/>
                <Connection icon={<Globe2 className="h-4 w-4"/>} name="Website lead capture" description="Contact form, website audit and SEO AI chat" status="Connected" active/>
                <Connection icon={<Mail className="h-4 w-4"/>} name="Email and Discord" description="Existing EmailJS, automation and Discord notifications remain active" status="Unchanged" active/>
                <Connection icon={<MessageCircle className="h-4 w-4"/>} name="WhatsApp Business" description={whatsApp?.configured ? "Meta Cloud API sending, signed webhooks and CRM inbox" : "Add all required Meta values in Vercel to activate the inbox"} status={whatsApp ? whatsApp.configured ? "Connected" : "Needs setup" : "Checking…"} active={Boolean(whatsApp?.configured)} loading={!whatsApp}/>
            </div>
            {whatsApp ? <div className="border-t border-[var(--crm-border)] bg-[var(--crm-subtle)] p-4 sm:px-6"><div className="flex flex-col gap-2 sm:flex-row sm:items-center"><div className="min-w-0 flex-1"><p className="text-[10px] font-semibold uppercase tracking-[.1em] text-[var(--crm-muted)]">Meta callback URL</p><p className="mt-1 truncate font-mono text-[11px] text-[var(--crm-text)]">{whatsApp.callbackUrl}</p></div><button onClick={() => void copyCallback()} className="crm-button-secondary"><Copy className="h-3.5 w-3.5"/> Copy</button></div><div className="mt-3 flex flex-wrap gap-2"><Readiness label="Access token" ready={whatsApp.accessToken}/><Readiness label="Phone ID" ready={whatsApp.phoneNumberId}/><Readiness label="WABA ID" ready={whatsApp.businessAccountId}/><Readiness label="App secret" ready={whatsApp.appSecret}/><Readiness label="Verify token" ready={whatsApp.verifyToken}/></div></div> : null}
        </section>
    </div>;
}

function Connection({icon, name, description, status, active = false, loading = false}: {icon: ReactNode; name: string; description: string; status: string; active?: boolean; loading?: boolean}) {
    return <div className="flex items-center gap-3 p-4 sm:px-6"><span className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--crm-border)] bg-[var(--crm-subtle)] text-[var(--crm-muted)]">{icon}</span><div className="min-w-0 flex-1"><p className="text-xs font-semibold">{name}</p><p className="mt-0.5 text-[10px] text-[var(--crm-muted)]">{description}</p></div><span className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-semibold ${active ? "bg-emerald-50 text-emerald-700" : "bg-[var(--crm-subtle)] text-[var(--crm-muted)]"}`}>{loading ? <Loader2 className="h-3 w-3 animate-spin"/> : null}{status}</span></div>;
}

function Readiness({label, ready}: {label: string; ready: boolean}) {
    return <span className={`inline-flex items-center gap-1 rounded-md border px-2 py-1 text-[9px] font-semibold ${ready ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-amber-200 bg-amber-50 text-amber-800"}`}><span className={`h-1.5 w-1.5 rounded-full ${ready ? "bg-emerald-500" : "bg-amber-500"}`}/>{label}</span>;
}
