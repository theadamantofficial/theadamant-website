"use client";

import {FormEvent, useCallback, useEffect, useMemo, useState} from "react";
import toast from "react-hot-toast";
import {Building2, ChevronLeft, ChevronRight, Database, ExternalLink, MapPin, MessageCircle, Phone, UserRound} from "lucide-react";
import {DataError, EmptyState, Modal, PageHeader, SearchInput, Skeleton} from "@/components/admin/admin-ui";
import {crmFetch} from "@/features/crm/api";
import type {Prospect} from "@/features/crm/types";

type ProspectPage = {
    prospects: Prospect[];
    page: {hasMore: boolean; nextAfter: number | null};
    database: {total: number; createdAt: string | null};
};

type Filters = {search: string; state: string; city: string; industry: string; hasPhone: boolean};
const EMPTY_FILTERS: Filters = {search: "", state: "", city: "", industry: "", hasPhone: true};

export function ProspectsScreen() {
    const [prospects, setProspects] = useState<Prospect[]>([]);
    const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
    const [activeFilters, setActiveFilters] = useState<Filters>(EMPTY_FILTERS);
    const [cursorStack, setCursorStack] = useState<number[]>([0]);
    const [nextAfter, setNextAfter] = useState<number | null>(null);
    const [databaseTotal, setDatabaseTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selected, setSelected] = useState<Prospect | null>(null);

    const currentAfter = cursorStack.at(-1) || 0;
    const load = useCallback(async (after: number, requestedFilters: Filters) => {
        setLoading(true);
        setError("");
        const params = new URLSearchParams({after: String(after), pageSize: "50"});
        if (requestedFilters.search) params.set("search", requestedFilters.search);
        if (requestedFilters.state) params.set("state", requestedFilters.state);
        if (requestedFilters.city) params.set("city", requestedFilters.city);
        if (requestedFilters.industry) params.set("industry", requestedFilters.industry);
        if (requestedFilters.hasPhone) params.set("hasPhone", "true");
        try {
            const data = await crmFetch<ProspectPage>(`/api/admin/prospects?${params}`);
            setProspects(data.prospects);
            setNextAfter(data.page.nextAfter);
            setDatabaseTotal(data.database.total);
        } catch (loadError) {
            setError(loadError instanceof Error ? loadError.message : "Lead database could not be loaded.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { void load(0, EMPTY_FILTERS); }, [load]);

    function submitFilters(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setActiveFilters(filters);
        setCursorStack([0]);
        void load(0, filters);
    }

    function clearFilters() {
        setFilters(EMPTY_FILTERS);
        setActiveFilters(EMPTY_FILTERS);
        setCursorStack([0]);
        void load(0, EMPTY_FILTERS);
    }

    function nextPage() {
        if (nextAfter === null) return;
        setCursorStack((current) => [...current, nextAfter]);
        void load(nextAfter, activeFilters);
    }

    function previousPage() {
        if (cursorStack.length <= 1) return;
        const previous = cursorStack[cursorStack.length - 2];
        setCursorStack((current) => current.slice(0, -1));
        void load(previous, activeFilters);
    }

    const filterCount = useMemo(() => [activeFilters.search, activeFilters.state, activeFilters.city, activeFilters.industry].filter(Boolean).length + (activeFilters.hasPhone ? 1 : 0), [activeFilters]);

    return <div className="space-y-5">
        <PageHeader
            eyebrow="USA prospect source"
            title="Lead Database"
            description={`${databaseTotal ? databaseTotal.toLocaleString("en-US") : "10M+"} source records · Access is controlled by administrators · Outreach is logged for future CRM integration.`}
            actions={<span className="inline-flex items-center gap-2 rounded-lg border border-[var(--crm-border)] bg-[var(--crm-surface)] px-3 py-2 text-[11px] text-[var(--crm-muted)]"><Database className="h-3.5 w-3.5"/> Read-only source</span>}
        />
        {error ? <DataError message={error} onRetry={() => void load(currentAfter, activeFilters)}/> : null}
        <section className="crm-card overflow-hidden">
            <form onSubmit={submitFilters} className="border-b border-[var(--crm-border)] p-3 sm:p-4">
                <div className="grid gap-2 md:grid-cols-[minmax(14rem,1fr)_repeat(3,minmax(8rem,.35fr))_auto]">
                    <SearchInput value={filters.search} onChange={(search) => setFilters((current) => ({...current, search}))} placeholder="Search name, company, email or phone…"/>
                    <FilterInput label="State" value={filters.state} placeholder="State e.g. CA" onChange={(state) => setFilters((current) => ({...current, state}))}/>
                    <FilterInput label="City" value={filters.city} placeholder="City" onChange={(city) => setFilters((current) => ({...current, city}))}/>
                    <FilterInput label="Industry" value={filters.industry} placeholder="Industry" onChange={(industry) => setFilters((current) => ({...current, industry}))}/>
                    <button className="crm-button-primary">Apply filters</button>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-3 text-[11px] text-[var(--crm-muted)]">
                    <label className="inline-flex items-center gap-2"><input type="checkbox" checked={filters.hasPhone} onChange={(event) => setFilters((current) => ({...current, hasPhone: event.target.checked}))}/> Only leads with phone numbers</label>
                    {filterCount ? <button type="button" onClick={clearFilters} className="ml-auto font-semibold text-[#0d5c63]">Clear filters</button> : null}
                </div>
            </form>

            {loading ? <div className="space-y-4 p-5">{Array.from({length: 9}).map((_, index) => <Skeleton key={index} className="h-12 w-full"/>)}</div> : prospects.length ? <div className="overflow-x-auto">
                <table className="w-full min-w-[1050px] text-left">
                    <thead><tr className="border-b border-[var(--crm-border)] bg-[var(--crm-subtle)] text-[10px] uppercase tracking-[.09em] text-[var(--crm-muted)]"><th className="px-5 py-2.5 font-medium">Contact</th><th className="px-3 py-2.5 font-medium">Company</th><th className="px-3 py-2.5 font-medium">Phone</th><th className="px-3 py-2.5 font-medium">Email</th><th className="px-3 py-2.5 font-medium">Location</th><th className="px-3 py-2.5 font-medium">Industry</th><th className="px-5 py-2.5 font-medium">Action</th></tr></thead>
                    <tbody className="divide-y divide-[var(--crm-border)]">{prospects.map((prospect) => {
                        const name = prospect.name || prospect.contact_person || joinName(prospect) || "Unnamed contact";
                        const company = prospect.company_name || prospect.business_name || "—";
                        const phone = prospect.phone || prospect.company_phone;
                        const email = cleanEmail(prospect.email || prospect.corporate_email || prospect.company_email);
                        return <tr key={prospect.record_id} className="text-xs transition hover:bg-[var(--crm-subtle)]">
                            <td className="px-5 py-3"><span className="flex items-start gap-2.5"><span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--crm-subtle)]"><UserRound className="h-3.5 w-3.5 text-[var(--crm-muted)]"/></span><span><span className="block max-w-64 font-semibold">{name}</span>{prospect.job_title ? <span className="mt-0.5 block text-[10px] text-[var(--crm-muted)]">{prospect.job_title}</span> : null}</span></span></td>
                            <td className="max-w-56 px-3 py-3"><span className="flex items-start gap-1.5"><Building2 className="mt-0.5 h-3 w-3 shrink-0 text-[var(--crm-muted)]"/><span className="line-clamp-2">{company}</span></span></td>
                            <td className="px-3 py-3">{phone ? <a href={`tel:${phone}`} className="inline-flex items-center gap-1.5 hover:text-[#0d5c63]"><Phone className="h-3 w-3"/>{phone}</a> : <span className="text-[var(--crm-muted)]">—</span>}</td>
                            <td className="max-w-56 px-3 py-3">{email ? <a href={`mailto:${email}`} className="block truncate hover:text-[#0d5c63]">{email}</a> : <span className="text-[var(--crm-muted)]">—</span>}</td>
                            <td className="px-3 py-3"><span className="flex items-start gap-1.5"><MapPin className="mt-0.5 h-3 w-3 shrink-0 text-[var(--crm-muted)]"/><span>{[prospect.city, prospect.state, prospect.country].filter(Boolean).join(", ") || prospect.location || "—"}</span></span></td>
                            <td className="px-3 py-3 text-[var(--crm-muted)]">{prospect.industry || prospect.sub_industry || "—"}</td>
                            <td className="px-5 py-3"><button disabled={!phone} onClick={() => setSelected(prospect)} className="crm-button-secondary whitespace-nowrap disabled:cursor-not-allowed disabled:opacity-50"><MessageCircle className="h-3.5 w-3.5 text-emerald-600"/> WhatsApp</button></td>
                        </tr>;
                    })}</tbody>
                </table>
            </div> : <EmptyState title="No leads found" description="Try a broader search or remove one of the exact location filters."/>}

            <div className="flex items-center justify-between border-t border-[var(--crm-border)] px-4 py-3 text-[11px] text-[var(--crm-muted)]"><span>Page {cursorStack.length} · {prospects.length} records shown</span><div className="flex items-center gap-2"><button disabled={cursorStack.length <= 1 || loading} onClick={previousPage} className="crm-button-secondary"><ChevronLeft className="h-3.5 w-3.5"/> Previous</button><button disabled={nextAfter === null || loading} onClick={nextPage} className="crm-button-secondary">Next <ChevronRight className="h-3.5 w-3.5"/></button></div></div>
        </section>
        {selected ? <WhatsAppModal prospect={selected} onClose={() => setSelected(null)}/> : null}
    </div>;
}

function WhatsAppModal({prospect, onClose}: {prospect: Prospect; onClose: () => void}) {
    const company = prospect.company_name || prospect.business_name || "your company";
    const firstName = prospect.first_name || firstNameFromDisplay(prospect.name || prospect.contact_person);
    const [message, setMessage] = useState(`Hi${firstName ? ` ${firstName}` : ""}, I’m reaching out from The Adamant. I came across ${company} and would love to explore how our digital services could support your growth. Would you be open to a quick conversation?`);
    const [opening, setOpening] = useState(false);

    async function openWhatsApp() {
        setOpening(true);
        const whatsappWindow = window.open("", "_blank");
        try {
            const data = await crmFetch<{url: string}>("/api/admin/prospects/whatsapp", {method: "POST", body: JSON.stringify({recordId: prospect.record_id, message})});
            if (whatsappWindow) {
                whatsappWindow.opener = null;
                whatsappWindow.location.assign(data.url);
            } else {
                window.location.assign(data.url);
            }
            toast.success("WhatsApp opened and outreach logged");
            onClose();
        } catch (error) {
            whatsappWindow?.close();
            toast.error(error instanceof Error ? error.message : "WhatsApp could not be opened.");
        } finally {
            setOpening(false);
        }
    }

    return <Modal title="Message on WhatsApp" description="Review the message before opening WhatsApp. This action is logged in the CRM for future provider integration." onClose={onClose}>
        <div className="rounded-lg border border-[var(--crm-border)] bg-[var(--crm-subtle)] p-3 text-xs"><p className="font-semibold">{prospect.name || prospect.contact_person || "Lead"}</p><p className="mt-1 text-[var(--crm-muted)]">{prospect.phone || prospect.company_phone}</p></div>
        <label className="mt-4 block"><span className="mb-1.5 block text-xs font-medium">Message</span><textarea rows={7} maxLength={2000} value={message} onChange={(event) => setMessage(event.target.value)} className="admin-input h-auto resize-y py-3"/><span className="mt-1.5 block text-right text-[10px] text-[var(--crm-muted)]">{message.length}/2000</span></label>
        <div className="mt-5 flex justify-end gap-2"><button onClick={onClose} className="crm-button-secondary">Cancel</button><button disabled={opening || !message.trim()} onClick={() => void openWhatsApp()} className="crm-button-primary"><MessageCircle className="h-3.5 w-3.5"/>{opening ? "Opening…" : "Open WhatsApp"}<ExternalLink className="h-3 w-3"/></button></div>
    </Modal>;
}

function FilterInput({label, value, placeholder, onChange}: {label: string; value: string; placeholder: string; onChange: (value: string) => void}) {
    return <label><span className="sr-only">{label}</span><input aria-label={label} value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} className="crm-control w-full"/></label>;
}

function joinName(prospect: Prospect) { return [prospect.first_name, prospect.last_name].filter(Boolean).join(" "); }
function cleanEmail(value?: string | null) { return value?.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0] || null; }
function firstNameFromDisplay(value?: string | null) { return value?.replace(/^(mr|mrs|ms|miss|dr)\.?\s+/i, "").split(/[\s,(]/)[0] || ""; }
