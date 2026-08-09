"use client";

import {DragEvent, useCallback, useEffect, useMemo, useState} from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import {GripVertical, Plus, RefreshCw} from "lucide-react";
import {DataError, EmptyState, PageHeader, Skeleton, UserAvatar} from "@/components/admin/admin-ui";
import {useAdminActor} from "@/components/admin/admin-shell";
import {LEAD_STATUS_LABELS, LEAD_STATUSES} from "@/features/crm/constants";
import type {Lead, LeadStatus, PipelineSummary} from "@/features/crm/types";
import {crmFetch} from "@/features/crm/api";
import {formatInr, formatRelativeDate} from "@/features/crm/format";
import {canManageLeads} from "@/features/crm/permissions";

type PipelineColumn = {status: LeadStatus; count: number; leads: Lead[]};

export function PipelineBoard() {
    const actor = useAdminActor();
    const canManage = canManageLeads(actor.role);
    const [columns, setColumns] = useState<PipelineColumn[]>([]);
    const [summary, setSummary] = useState<PipelineSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [draggedId, setDraggedId] = useState<string | null>(null);
    const [dropTarget, setDropTarget] = useState<LeadStatus | null>(null);

    const load = useCallback(async () => {
        setLoading(true); setError("");
        try { const data = await crmFetch<{columns: PipelineColumn[]; summary: PipelineSummary[]}>("/api/admin/pipeline"); setColumns(data.columns); setSummary(data.summary); }
        catch (loadError) { setError(loadError instanceof Error ? loadError.message : "Pipeline could not be loaded."); }
        finally { setLoading(false); }
    }, []);
    useEffect(() => { void load(); }, [load]);

    const draggedLead = useMemo(() => columns.flatMap((column) => column.leads).find((lead) => lead.id === draggedId), [columns, draggedId]);

    function startDrag(event: DragEvent, lead: Lead) {
        setDraggedId(lead.id); event.dataTransfer.effectAllowed = "move"; event.dataTransfer.setData("text/plain", lead.id);
    }

    async function drop(event: DragEvent, status: LeadStatus) {
        event.preventDefault(); setDropTarget(null);
        if (!draggedLead || draggedLead.status === status) { setDraggedId(null); return; }
        const previous = columns;
        setColumns((current) => current.map((column) => column.status === draggedLead.status ? {...column, count: Math.max(0, column.count - 1), leads: column.leads.filter((lead) => lead.id !== draggedLead.id)} : column.status === status ? {...column, count: column.count + 1, leads: [{...draggedLead, status}, ...column.leads]} : column));
        setDraggedId(null);
        try {
            await crmFetch(`/api/admin/leads/${draggedLead.id}`, {method: "PATCH", body: JSON.stringify({status})});
            toast.success(`Status changed to ${LEAD_STATUS_LABELS[status]}`);
            await load();
        } catch (moveError) {
            setColumns(previous);
            toast.error(moveError instanceof Error ? moveError.message : "Lead could not be moved.");
        }
    }

    return <div className="space-y-5">
        <PageHeader title="Sales pipeline" description={canManage ? "Move opportunities through each stage as conversations progress." : "Move your assigned leads as their conversations progress."} actions={<><button onClick={() => void load()} className="crm-button-secondary"><RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`}/> Refresh</button>{canManage ? <Link href="/admin/leads/new" className="crm-button-primary"><Plus className="h-3.5 w-3.5"/> Add lead</Link> : null}</>}/>
        {error ? <DataError message={error} onRetry={() => void load()}/> : null}
        {loading && !columns.length ? <div className="flex gap-3 overflow-hidden">{Array.from({length: 5}).map((_, index) => <div key={index} className="w-[17.5rem] shrink-0"><Skeleton className="h-[32rem] w-full"/></div>)}</div> : <div className="-mx-4 overflow-x-auto px-4 pb-3 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8"><div className="flex min-w-max gap-3">{LEAD_STATUSES.map((status) => {
            const column = columns.find((item) => item.status === status) || {status, count: 0, leads: []};
            const total = summary.find((item) => item.status === status)?.pipeline_value || 0;
            return <section key={status} onDragOver={(event) => { event.preventDefault(); event.dataTransfer.dropEffect = "move"; setDropTarget(status); }} onDragLeave={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node)) setDropTarget(null); }} onDrop={(event) => void drop(event, status)} className={`w-[17.5rem] shrink-0 rounded-xl border bg-[var(--crm-subtle)] transition duration-150 ${dropTarget === status ? "border-[#0d5c63] ring-2 ring-[#0d5c63]/10" : "border-[var(--crm-border)]"}`}>
                <header className="border-b border-[var(--crm-border)] p-3"><div className="flex items-center justify-between"><div className="flex items-center gap-2"><span className={`h-2 w-2 rounded-full pipeline-dot-${status}`}/><h2 className="text-xs font-semibold">{LEAD_STATUS_LABELS[status]}</h2></div><span className="rounded-md bg-[var(--crm-surface)] px-1.5 py-0.5 text-[10px] font-semibold text-[var(--crm-muted)]">{column.count}</span></div><p className="mt-2 text-[10px] text-[var(--crm-muted)]">{formatInr(total)} pipeline value</p></header>
                <div className="min-h-[26rem] space-y-2 p-2">{column.leads.map((lead) => <article key={lead.id} draggable onDragStart={(event) => startDrag(event, lead)} onDragEnd={() => { setDraggedId(null); setDropTarget(null); }} className={`group cursor-grab rounded-lg border border-[var(--crm-border)] bg-[var(--crm-surface)] p-3 shadow-[0_1px_2px_rgba(15,23,42,.03)] transition duration-150 hover:border-[#9eb7b5] active:cursor-grabbing ${draggedId === lead.id ? "scale-[.98] opacity-45" : ""}`}><div className="flex items-start gap-2"><div className="min-w-0 flex-1"><Link href={`/admin/leads/${lead.id}`} className="block truncate text-xs font-semibold hover:text-[#0d5c63]">{lead.customer_name}</Link><p className="mt-0.5 truncate text-[10px] text-[var(--crm-muted)]">{lead.company_name || "Individual lead"}</p></div><GripVertical className="h-3.5 w-3.5 shrink-0 text-[var(--crm-muted)] opacity-0 transition group-hover:opacity-100"/></div><p className="mt-3 truncate text-[11px]">{lead.service_required}</p><p className="mt-1.5 text-xs font-semibold">{formatInr(lead.estimated_value)}</p><div className="mt-3 flex items-center justify-between gap-2">{lead.assigned_profile ? <UserAvatar size="sm" name={lead.assigned_profile.full_name || lead.assigned_profile.email} imageUrl={lead.assigned_profile.avatar_url}/> : <span className="h-7 w-7 rounded-full border border-dashed border-[var(--crm-border)]"/>}<span className={`max-w-40 truncate text-[10px] ${lead.next_followup && new Date(lead.next_followup) < new Date() ? "text-rose-600" : "text-[var(--crm-muted)]"}`}>{formatRelativeDate(lead.next_followup)}</span></div></article>)}{!column.leads.length ? <div className="flex h-36 flex-col items-center justify-center text-center"><p className="text-[11px] font-medium text-[var(--crm-muted)]">No leads in this stage</p><p className="mt-1 text-[10px] text-[var(--crm-muted)]">Drop a card here</p></div> : null}{column.count > column.leads.length ? <p className="py-2 text-center text-[10px] text-[var(--crm-muted)]">Showing the 60 most recently updated leads</p> : null}</div>
            </section>;
        })}</div></div>}
        {!loading && !columns.some((column) => column.leads.length) ? <EmptyState title="Pipeline is empty" description={canManage ? "Add a lead to start building your sales pipeline." : "No leads are currently assigned to you."} actionHref={canManage ? "/admin/leads/new" : undefined} actionLabel={canManage ? "Add lead" : undefined}/> : null}
    </div>;
}
