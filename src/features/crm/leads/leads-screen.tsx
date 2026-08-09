"use client";

import {useCallback, useEffect, useMemo, useState} from "react";
import Link from "next/link";
import {ChevronLeft, ChevronRight, MoreHorizontal, Plus, SlidersHorizontal} from "lucide-react";
import {DataError, EmptyState, PageHeader, PriorityBadge, SearchInput, Skeleton, StatusBadge, UserAvatar} from "@/components/admin/admin-ui";
import {useAdminActor} from "@/components/admin/admin-shell";
import {LEAD_SOURCE_LABELS, LEAD_SOURCES, LEAD_STATUS_LABELS, LEAD_STATUSES, PRIORITIES} from "@/features/crm/constants";
import type {Lead, Profile} from "@/features/crm/types";
import {crmFetch} from "@/features/crm/api";
import {formatInr, formatRelativeDate} from "@/features/crm/format";
import {canManageLeads} from "@/features/crm/permissions";

type Pagination = {page: number; pageSize: number; total: number; pages: number};
type TeamMember = Pick<Profile, "id" | "full_name" | "email" | "avatar_url" | "active">;

export function LeadsScreen({initialSearch = ""}: {initialSearch?: string}) {
    const actor = useAdminActor();
    const canManage = canManageLeads(actor.role);
    const [leads, setLeads] = useState<Lead[]>([]);
    const [members, setMembers] = useState<TeamMember[]>([]);
    const [pagination, setPagination] = useState<Pagination>({page: 1, pageSize: 25, total: 0, pages: 1});
    const [search, setSearch] = useState(initialSearch);
    const [debouncedSearch, setDebouncedSearch] = useState(initialSearch);
    const [status, setStatus] = useState("all");
    const [source, setSource] = useState("all");
    const [assignedTo, setAssignedTo] = useState("all");
    const [dateRange, setDateRange] = useState("all");
    const [priority, setPriority] = useState("all");
    const [moreOpen, setMoreOpen] = useState(false);
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => { const timer = window.setTimeout(() => setDebouncedSearch(search), 250); return () => window.clearTimeout(timer); }, [search]);

    const load = useCallback(async (page = 1) => {
        setLoading(true); setError("");
        const params = new URLSearchParams({page: String(page), pageSize: "25"});
        if (debouncedSearch) params.set("search", debouncedSearch);
        if (status !== "all") params.set("status", status);
        if (source !== "all") params.set("source", source);
        if (assignedTo !== "all") params.set("assignedTo", assignedTo);
        if (priority !== "all") params.set("priority", priority);
        const after = createdAfter(dateRange); if (after) params.set("createdAfter", after);
        try {
            const data = await crmFetch<{leads: Lead[]; pagination: Pagination}>(`/api/admin/leads?${params}`);
            setLeads(data.leads); setPagination(data.pagination); setSelected(new Set());
        } catch (loadError) { setError(loadError instanceof Error ? loadError.message : "Leads could not be loaded."); }
        finally { setLoading(false); }
    }, [assignedTo, dateRange, debouncedSearch, priority, source, status]);

    useEffect(() => { void load(1); }, [load]);
    useEffect(() => {
        if (canManage) void crmFetch<{members: TeamMember[]}>("/api/admin/team").then((data) => setMembers(data.members)).catch(() => undefined);
    }, [canManage]);

    const allSelected = leads.length > 0 && leads.every((lead) => selected.has(lead.id));
    const activeFilterCount = useMemo(() => [status, source, assignedTo, dateRange, priority].filter((value) => value !== "all").length, [assignedTo, dateRange, priority, source, status]);

    function toggleAll() { setSelected(allSelected ? new Set() : new Set(leads.map((lead) => lead.id))); }
    function toggleOne(id: string) { setSelected((current) => { const next = new Set(current); if (next.has(id)) next.delete(id); else next.add(id); return next; }); }
    function clearFilters() { setStatus("all"); setSource("all"); setAssignedTo("all"); setDateRange("all"); setPriority("all"); setSearch(""); }

    return <div className="space-y-5">
        <PageHeader title="Leads" description={canManage ? "Manage prospects, assignments and opportunities." : "View your assigned leads, update their status and add comments."} actions={canManage ? <Link href="/admin/leads/new" className="crm-button-primary"><Plus className="h-3.5 w-3.5"/> Add lead</Link> : <span className="rounded-lg border border-[var(--crm-border)] bg-[var(--crm-surface)] px-3 py-2 text-[11px] text-[var(--crm-muted)]">Assigned to you</span>}/>
        {error ? <DataError message={error} onRetry={() => void load(pagination.page)}/> : null}
        <section className="crm-card overflow-hidden">
            <div className="border-b border-[var(--crm-border)] p-3 sm:p-4">
                <div className="grid gap-2 md:grid-cols-[minmax(12rem,1fr)_repeat(4,minmax(8rem,auto))_auto]">
                    <SearchInput value={search} onChange={setSearch} placeholder="Search leads, company, email or phone…"/>
                    <FilterSelect label="Status" value={status} onChange={setStatus}><option value="all">All statuses</option>{LEAD_STATUSES.map((item) => <option key={item} value={item}>{LEAD_STATUS_LABELS[item]}</option>)}</FilterSelect>
                    <FilterSelect label="Source" value={source} onChange={setSource}><option value="all">All sources</option>{LEAD_SOURCES.map((item) => <option key={item} value={item}>{LEAD_SOURCE_LABELS[item]}</option>)}</FilterSelect>
                    {canManage ? <FilterSelect label="Assigned user" value={assignedTo} onChange={setAssignedTo}><option value="all">All owners</option><option value="unassigned">Unassigned</option>{members.filter((member) => member.active).map((member) => <option key={member.id} value={member.id}>{member.full_name || member.email}</option>)}</FilterSelect> : null}
                    <FilterSelect label="Date" value={dateRange} onChange={setDateRange}><option value="all">All dates</option><option value="7">Last 7 days</option><option value="30">Last 30 days</option><option value="90">Last 90 days</option></FilterSelect>
                    <button onClick={() => setMoreOpen((current) => !current)} className="crm-button-secondary"><SlidersHorizontal className="h-3.5 w-3.5"/> More{activeFilterCount ? ` (${activeFilterCount})` : ""}</button>
                </div>
                {moreOpen ? <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-[var(--crm-border)] pt-3"><span className="text-[11px] font-medium text-[var(--crm-muted)]">Priority</span><select value={priority} onChange={(event) => setPriority(event.target.value)} className="crm-control"><option value="all">All priorities</option>{PRIORITIES.map((item) => <option key={item} value={item}>{item.charAt(0).toUpperCase() + item.slice(1)}</option>)}</select>{activeFilterCount ? <button onClick={clearFilters} className="ml-auto text-[11px] font-semibold text-[#0d5c63]">Clear filters</button> : null}</div> : null}
            </div>

            {selected.size ? <div className="flex h-11 items-center gap-3 border-b border-[var(--crm-border)] bg-[#edf5f4] px-4 text-xs text-[#0d5c63]"><span className="font-semibold">{selected.size} selected</span><span className="text-[10px] text-[#4d7778]">Bulk actions are prepared for a later phase.</span></div> : null}
            {loading ? <TableLoading/> : leads.length ? <div className="overflow-x-auto"><table className="w-full min-w-[1180px] text-left"><thead><tr className="border-b border-[var(--crm-border)] bg-[var(--crm-subtle)] text-[10px] uppercase tracking-[.09em] text-[var(--crm-muted)]">{canManage ? <th className="w-12 px-4 py-2.5"><input aria-label="Select all leads" type="checkbox" checked={allSelected} onChange={toggleAll}/></th> : null}<th className="px-3 py-2.5 font-medium">Lead / Contact</th><th className="px-3 py-2.5 font-medium">Company</th><th className="px-3 py-2.5 font-medium">Service</th><th className="px-3 py-2.5 font-medium">Source</th><th className="px-3 py-2.5 font-medium">Status</th><th className="px-3 py-2.5 font-medium">Deal Value</th><th className="px-3 py-2.5 font-medium">Assigned To</th><th className="px-3 py-2.5 font-medium">Next Follow-up</th><th className="px-3 py-2.5 font-medium">Last Activity</th><th className="w-12 px-4 py-2.5"/></tr></thead><tbody className="divide-y divide-[var(--crm-border)]">{leads.map((lead) => <tr key={lead.id} className="text-xs transition hover:bg-[var(--crm-subtle)]">{canManage ? <td className="px-4 py-3"><input aria-label={`Select ${lead.customer_name}`} type="checkbox" checked={selected.has(lead.id)} onChange={() => toggleOne(lead.id)}/></td> : null}<td className="px-3 py-3"><Link href={`/admin/leads/${lead.id}`} className="font-semibold hover:text-[#0d5c63]">{lead.customer_name}</Link><p className="mt-0.5 max-w-44 truncate text-[10px] text-[var(--crm-muted)]">{lead.email || lead.phone || "No contact details"}</p></td><td className="px-3 py-3 text-[var(--crm-muted)]">{lead.company_name || "—"}</td><td className="max-w-44 px-3 py-3"><p className="truncate">{lead.service_required}</p></td><td className="px-3 py-3 text-[var(--crm-muted)]">{LEAD_SOURCE_LABELS[lead.lead_source]}</td><td className="px-3 py-3"><StatusBadge status={lead.status}/></td><td className="px-3 py-3 font-semibold">{formatInr(lead.estimated_value)}</td><td className="px-3 py-3">{lead.assigned_profile ? <span className="flex items-center gap-2"><UserAvatar size="sm" name={lead.assigned_profile.full_name || lead.assigned_profile.email} imageUrl={lead.assigned_profile.avatar_url}/><span className="max-w-24 truncate">{lead.assigned_profile.full_name || lead.assigned_profile.email}</span></span> : <span className="text-[var(--crm-muted)]">Unassigned</span>}</td><td className={`px-3 py-3 ${lead.next_followup && new Date(lead.next_followup) < new Date() ? "text-rose-600" : "text-[var(--crm-muted)]"}`}>{formatRelativeDate(lead.next_followup)}</td><td className="px-3 py-3"><div className="flex items-center gap-2"><PriorityBadge priority={lead.priority}/><span className="text-[10px] text-[var(--crm-muted)]">{formatRelativeDate(lead.updated_at)}</span></div></td><td className="px-4 py-3"><Link href={`/admin/leads/${lead.id}`} aria-label={`Open ${lead.customer_name}`} className="crm-icon-button h-7 w-7 border-0 bg-transparent"><MoreHorizontal className="h-4 w-4"/></Link></td></tr>)}</tbody></table></div> : <EmptyState title="No leads found" description={activeFilterCount || search ? "Try changing the current search or filters." : canManage ? "Start building your sales pipeline by adding your first lead." : "No leads are currently assigned to you."} actionHref={canManage ? "/admin/leads/new" : undefined} actionLabel={canManage ? "Add lead" : undefined}/>}{/* Employee lists never expose create or bulk actions. */}

            <div className="flex items-center justify-between border-t border-[var(--crm-border)] px-4 py-3 text-[11px] text-[var(--crm-muted)]"><span>{pagination.total ? `${(pagination.page - 1) * pagination.pageSize + 1}–${Math.min(pagination.page * pagination.pageSize, pagination.total)} of ${pagination.total}` : "0 leads"}</span><div className="flex items-center gap-2"><button disabled={pagination.page <= 1 || loading} onClick={() => void load(pagination.page - 1)} className="crm-icon-button h-8 w-8"><ChevronLeft className="h-3.5 w-3.5"/></button><span>Page {pagination.page} of {Math.max(1, pagination.pages)}</span><button disabled={pagination.page >= pagination.pages || loading} onClick={() => void load(pagination.page + 1)} className="crm-icon-button h-8 w-8"><ChevronRight className="h-3.5 w-3.5"/></button></div></div>
        </section>
    </div>;
}

function FilterSelect({label, value, onChange, children}: {label: string; value: string; onChange: (value: string) => void; children: React.ReactNode}) { return <label><span className="sr-only">{label}</span><select aria-label={label} value={value} onChange={(event) => onChange(event.target.value)} className="crm-control w-full">{children}</select></label>; }
function TableLoading() { return <div className="space-y-4 p-5">{Array.from({length: 8}).map((_, index) => <Skeleton key={index} className="h-8 w-full"/>)}</div>; }
function createdAfter(range: string) { if (range === "all") return ""; const days = Number(range); const date = new Date(); date.setDate(date.getDate() - days); return date.toISOString(); }
