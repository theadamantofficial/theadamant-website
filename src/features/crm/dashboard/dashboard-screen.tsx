"use client";

import {useCallback, useEffect, useState} from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import {ArrowRight, BadgeIndianRupee, BriefcaseBusiness, CalendarClock, Check, CirclePercent, Handshake, Plus, Presentation, RefreshCw, UsersRound} from "lucide-react";
import {useAdminActor} from "@/components/admin/admin-shell";
import {DataError, EmptyState, MetricCard, PageHeader, Skeleton, StatusBadge, UserAvatar} from "@/components/admin/admin-ui";
import {LEAD_STATUS_LABELS} from "@/features/crm/constants";
import type {Activity, DashboardMetrics, Lead, PipelineSummary} from "@/features/crm/types";
import {crmFetch} from "@/features/crm/api";
import {canManageLeads} from "@/features/crm/permissions";

type DashboardData = {metrics: DashboardMetrics; pipeline: PipelineSummary[]; recentLeads: Lead[]; followups: Lead[]; activities: Activity[]};

export function DashboardScreen() {
    const actor = useAdminActor();
    const canManage = canManageLeads(actor.role);
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const load = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            setData(await crmFetch<DashboardData>("/api/admin/dashboard"));
        } catch (loadError) {
            setError(loadError instanceof Error ? loadError.message : "Dashboard could not be loaded.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { void load(); }, [load]);

    async function completeFollowup(lead: Lead) {
        try {
            await crmFetch(`/api/admin/leads/${lead.id}`, {method: "PATCH", body: JSON.stringify({next_followup: null})});
            toast.success("Follow-up completed");
            await load();
        } catch (completeError) {
            toast.error(completeError instanceof Error ? completeError.message : "Follow-up could not be completed.");
        }
    }

    const metrics = data?.metrics;
    const cards = [
        {label: "Total Leads", value: formatNumber(metrics?.total_leads), context: `${formatNumber(metrics?.open_opportunities)} open opportunities`, icon: <UsersRound className="h-3.5 w-3.5"/>},
        {label: "New Leads", value: formatNumber(metrics?.new_leads), context: "Awaiting first action", icon: <BriefcaseBusiness className="h-3.5 w-3.5"/>},
        {label: "Follow-ups Today", value: formatNumber(metrics?.followups_today), context: `${formatNumber(metrics?.followups_due)} currently due`, icon: <CalendarClock className="h-3.5 w-3.5"/>},
        {label: "Meetings", value: formatNumber(metrics?.meetings), context: "Scheduled opportunities", icon: <Handshake className="h-3.5 w-3.5"/>},
        {label: "Proposals", value: formatNumber(metrics?.proposals), context: "Proposal or negotiation", icon: <Presentation className="h-3.5 w-3.5"/>},
        {label: "Pipeline Value", value: formatCurrency(metrics?.pipeline_value), context: "Across open opportunities", icon: <BadgeIndianRupee className="h-3.5 w-3.5"/>},
        {label: "Won Revenue", value: formatCurrency(metrics?.won_value), context: `${formatCurrency(metrics?.lost_value)} lost value`, icon: <Check className="h-3.5 w-3.5"/>},
        {label: "Conversion Rate", value: `${Number(metrics?.conversion_rate || 0).toFixed(1)}%`, context: `${formatNumber(metrics?.overdue_tasks)} overdue tasks`, icon: <CirclePercent className="h-3.5 w-3.5"/>},
    ];

    return <div className="space-y-6">
        <PageHeader
            eyebrow={formatFullDate(new Date())}
            title={`${greeting()}, ${actor.fullName.split(" ")[0]}`}
            description={canManage ? "Here’s what’s happening with your sales pipeline." : "Here’s the latest activity across the leads assigned to you."}
            actions={<><button onClick={() => void load()} className="crm-button-secondary"><RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`}/> Refresh</button>{canManage ? <Link href="/admin/leads/new" className="crm-button-primary"><Plus className="h-3.5 w-3.5"/> Add lead</Link> : null}</>}
        />
        {error ? <DataError message={error} onRetry={() => void load()}/> : null}

        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-8">
            {loading && !data ? Array.from({length: 8}).map((_, index) => <div key={index} className="crm-card p-4"><Skeleton className="h-3 w-20"/><Skeleton className="mt-4 h-7 w-24"/><Skeleton className="mt-4 h-3 w-28"/></div>) : cards.map((card) => <MetricCard key={card.label} {...card}/>)}
        </section>

        <section className="crm-card overflow-hidden">
            <div className="flex items-center justify-between border-b border-[var(--crm-border)] px-4 py-3.5 sm:px-5"><div><h2 className="text-sm font-semibold">Pipeline summary</h2><p className="mt-0.5 text-[11px] text-[var(--crm-muted)]">Lead count and value by stage</p></div><Link href="/admin/pipeline" className="text-xs font-semibold text-[#0d5c63]">Open board <ArrowRight className="ml-1 inline h-3 w-3"/></Link></div>
            <div className="grid grid-cols-2 divide-x divide-y divide-[var(--crm-border)] sm:grid-cols-4 xl:grid-cols-8">
                {(data?.pipeline || []).map((stage) => <div key={stage.status} className="min-w-0 p-4"><div className="flex items-center gap-2"><span className={`h-1.5 w-1.5 rounded-full pipeline-dot-${stage.status}`}/><p className="truncate text-[11px] font-semibold text-[var(--crm-muted)]">{LEAD_STATUS_LABELS[stage.status]}</p></div><p className="mt-3 text-lg font-semibold">{stage.lead_count} <span className="text-[10px] font-normal text-[var(--crm-muted)]">leads</span></p><p className="mt-1 text-xs text-[var(--crm-muted)]">{formatCurrency(stage.pipeline_value)}</p></div>)}
                {loading && !data ? Array.from({length: 8}).map((_, index) => <div key={index} className="p-4"><Skeleton className="h-3 w-16"/><Skeleton className="mt-4 h-5 w-20"/></div>) : null}
            </div>
        </section>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1.4fr)_minmax(19rem,.6fr)]">
            <section className="crm-card overflow-hidden">
                <SectionTitle title="Recent leads" subtitle="Newest opportunities across all sources" href="/admin/leads"/>
                {loading && !data ? <TableSkeleton/> : data?.recentLeads.length ? <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left"><thead><tr className="border-b border-[var(--crm-border)] bg-[var(--crm-subtle)] text-[10px] uppercase tracking-[.1em] text-[var(--crm-muted)]"><th className="px-5 py-2.5 font-medium">Lead</th><th className="px-3 py-2.5 font-medium">Company</th><th className="px-3 py-2.5 font-medium">Service</th><th className="px-3 py-2.5 font-medium">Source</th><th className="px-3 py-2.5 font-medium">Status</th><th className="px-3 py-2.5 font-medium">Value</th><th className="px-3 py-2.5 font-medium">Assigned</th><th className="px-5 py-2.5 font-medium">Created</th></tr></thead><tbody className="divide-y divide-[var(--crm-border)]">{data.recentLeads.map((lead) => <tr key={lead.id} className="text-xs transition hover:bg-[var(--crm-subtle)]"><td className="px-5 py-3"><Link href={`/admin/leads/${lead.id}`} className="font-semibold hover:text-[#0d5c63]">{lead.customer_name}</Link><p className="mt-0.5 text-[10px] text-[var(--crm-muted)]">{lead.email || lead.phone || "No contact"}</p></td><td className="px-3 py-3 text-[var(--crm-muted)]">{lead.company_name || "—"}</td><td className="px-3 py-3">{lead.service_required}</td><td className="px-3 py-3 capitalize text-[var(--crm-muted)]">{lead.lead_source}</td><td className="px-3 py-3"><StatusBadge status={lead.status}/></td><td className="px-3 py-3 font-medium">{formatCurrency(lead.estimated_value)}</td><td className="px-3 py-3">{lead.assigned_profile ? <span className="flex items-center gap-2"><UserAvatar size="sm" name={lead.assigned_profile.full_name || lead.assigned_profile.email}/><span className="max-w-24 truncate">{lead.assigned_profile.full_name || lead.assigned_profile.email}</span></span> : <span className="text-[var(--crm-muted)]">Unassigned</span>}</td><td className="px-5 py-3 text-[var(--crm-muted)]">{formatShortDate(lead.created_at)}</td></tr>)}</tbody></table></div> : <EmptyState title="No leads yet" description={canManage ? "Start building the sales pipeline by adding the first lead." : "No leads are currently assigned to you."} actionHref={canManage ? "/admin/leads/new" : undefined} actionLabel={canManage ? "Add lead" : undefined}/>}{/* Role-aware empty state. */}
            </section>

            <section className="crm-card overflow-hidden"><SectionTitle title="Today's follow-ups" subtitle="Actions scheduled for today"/>{loading && !data ? <div className="space-y-4 p-5"><Skeleton/><Skeleton/><Skeleton/></div> : data?.followups.length ? <div className="divide-y divide-[var(--crm-border)]">{data.followups.map((lead) => <div key={lead.id} className="p-4"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="text-[10px] font-semibold text-[#0d5c63]">{formatTime(lead.next_followup!)}</p><p className="mt-1 truncate text-xs font-semibold">{lead.customer_name}</p><p className="mt-0.5 truncate text-[11px] text-[var(--crm-muted)]">{lead.company_name || lead.service_required}</p></div><StatusBadge status={lead.status}/></div><div className="mt-3 flex items-center gap-2"><Link href={`/admin/leads/${lead.id}`} className="text-[10px] font-semibold text-[#0d5c63]">Open lead</Link>{canManage ? <><button onClick={() => void completeFollowup(lead)} className="text-[10px] font-semibold text-[var(--crm-muted)] hover:text-[var(--crm-text)]">Complete</button><Link href={`/admin/leads/${lead.id}/edit`} className="text-[10px] font-semibold text-[var(--crm-muted)] hover:text-[var(--crm-text)]">Reschedule</Link></> : null}</div></div>)}</div> : <EmptyState title="No follow-ups today" description="Nothing is scheduled for the rest of today."/>}</section>
        </div>

        <section className="crm-card overflow-hidden"><SectionTitle title="Recent activity" subtitle="Latest movement across the CRM"/>{loading && !data ? <div className="grid gap-4 p-5 md:grid-cols-2"><Skeleton/><Skeleton/><Skeleton/><Skeleton/></div> : data?.activities.length ? <div className="grid md:grid-cols-2">{data.activities.map((activity, index) => <div key={activity.id} className={`flex gap-3 p-4 ${index % 2 === 0 ? "md:border-r md:border-[var(--crm-border)]" : ""} ${index < data.activities.length - 2 ? "border-b border-[var(--crm-border)]" : ""}`}><UserAvatar size="sm" name={activity.actor?.full_name || activity.actor?.email || "System"}/><div className="min-w-0"><p className="text-xs"><span className="font-semibold">{activity.actor?.full_name || "System"}</span> <span className="text-[var(--crm-muted)]">{activity.description.toLowerCase()}</span>{activity.lead ? <> for <Link className="font-semibold hover:text-[#0d5c63]" href={`/admin/leads/${activity.lead.id}`}>{activity.lead.customer_name}</Link></> : null}</p><p className="mt-1 text-[10px] text-[var(--crm-muted)]">{formatRelative(activity.created_at)}</p></div></div>)}</div> : <EmptyState title="No activity yet" description="Lead and task changes will appear here automatically."/>}</section>
    </div>;
}

function SectionTitle({title, subtitle, href}: {title: string; subtitle: string; href?: string}) {
    return <div className="flex items-center justify-between border-b border-[var(--crm-border)] px-4 py-3.5 sm:px-5"><div><h2 className="text-sm font-semibold">{title}</h2><p className="mt-0.5 text-[11px] text-[var(--crm-muted)]">{subtitle}</p></div>{href ? <Link href={href} className="text-xs font-semibold text-[#0d5c63]">View all</Link> : null}</div>;
}

function TableSkeleton() { return <div className="space-y-4 p-5">{Array.from({length: 6}).map((_, index) => <Skeleton key={index} className="h-7 w-full"/>)}</div>; }
function greeting() { const hour = new Date().getHours(); return hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening"; }
function formatNumber(value?: number) { return new Intl.NumberFormat("en-IN").format(Number(value || 0)); }
function formatCurrency(value?: number) { return new Intl.NumberFormat("en-IN", {style: "currency", currency: "INR", maximumFractionDigits: 0}).format(Number(value || 0)); }
function formatShortDate(value: string) { return new Intl.DateTimeFormat("en-IN", {day: "numeric", month: "short", year: "2-digit"}).format(new Date(value)); }
function formatFullDate(value: Date) { return new Intl.DateTimeFormat("en-IN", {weekday: "long", day: "numeric", month: "long"}).format(value); }
function formatTime(value: string) { return new Intl.DateTimeFormat("en-IN", {hour: "numeric", minute: "2-digit"}).format(new Date(value)); }
function formatRelative(value: string) { const minutes = Math.round((Date.now() - new Date(value).getTime()) / 60000); if (minutes < 1) return "Just now"; if (minutes < 60) return `${minutes}m ago`; const hours = Math.round(minutes / 60); if (hours < 24) return `${hours}h ago`; return formatShortDate(value); }
