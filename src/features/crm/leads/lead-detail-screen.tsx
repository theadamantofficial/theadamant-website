"use client";

import {FormEvent, useCallback, useEffect, useState} from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import {CalendarClock, Check, ChevronDown, Edit3, ExternalLink, Loader2, MessageCircle, MoreHorizontal, Phone, Plus, Send, UserRound} from "lucide-react";
import {useAdminActor} from "@/components/admin/admin-shell";
import {DataError, EmptyState, Modal, PriorityBadge, Skeleton, StatusBadge, UserAvatar} from "@/components/admin/admin-ui";
import {LEAD_SOURCE_LABELS, LEAD_STATUS_LABELS, LEAD_STATUSES} from "@/features/crm/constants";
import type {Activity, CrmTask, Lead, LeadNote, LeadStatus} from "@/features/crm/types";
import {crmFetch} from "@/features/crm/api";
import {formatCrmDate, formatInr, formatRelativeDate} from "@/features/crm/format";
import {TaskForm} from "@/features/crm/tasks/task-form";
import {canManageLeads} from "@/features/crm/permissions";

type LeadDetailData = {lead: Lead; notes: LeadNote[]; tasks: CrmTask[]; activities: Activity[]};
type DetailTab = "activity" | "comments" | "tasks";

export function LeadDetailScreen({leadId}: {leadId: string}) {
    const actor = useAdminActor();
    const canManage = canManageLeads(actor.role);
    const [data, setData] = useState<LeadDetailData | null>(null);
    const [tab, setTab] = useState<DetailTab>("activity");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [noteSaving, setNoteSaving] = useState(false);
    const [statusSaving, setStatusSaving] = useState(false);
    const [taskOpen, setTaskOpen] = useState(false);

    const load = useCallback(async () => {
        setLoading(true); setError("");
        try { setData(await crmFetch<LeadDetailData>(`/api/admin/leads/${leadId}`)); }
        catch (loadError) { setError(loadError instanceof Error ? loadError.message : "Lead could not be loaded."); }
        finally { setLoading(false); }
    }, [leadId]);
    useEffect(() => { void load(); }, [load]);

    async function addNote(event: FormEvent<HTMLFormElement>) {
        event.preventDefault(); setNoteSaving(true);
        const form = event.currentTarget; const note = String(new FormData(form).get("note") || "");
        try { await crmFetch(`/api/admin/leads/${leadId}/notes`, {method: "POST", body: JSON.stringify({note})}); form.reset(); toast.success("Comment added"); await load(); setTab("comments"); }
        catch (noteError) { toast.error(noteError instanceof Error ? noteError.message : "Comment could not be added."); }
        finally { setNoteSaving(false); }
    }

    async function completeTask(task: CrmTask) {
        try { await crmFetch(`/api/admin/tasks/${task.id}`, {method: "PATCH", body: JSON.stringify({status: "completed"})}); toast.success("Task completed"); await load(); }
        catch (taskError) { toast.error(taskError instanceof Error ? taskError.message : "Task could not be completed."); }
    }

    async function updateStatus(status: LeadStatus) {
        setStatusSaving(true);
        try {
            await crmFetch(`/api/admin/leads/${leadId}`, {method: "PATCH", body: JSON.stringify({status})});
            toast.success(`Status changed to ${LEAD_STATUS_LABELS[status]}`);
            await load();
        } catch (statusError) {
            toast.error(statusError instanceof Error ? statusError.message : "Lead status could not be changed.");
        } finally {
            setStatusSaving(false);
        }
    }

    if (error) return <DataError message={error} onRetry={() => void load()}/>;
    if (loading || !data) return <DetailSkeleton/>;
    const {lead, notes, tasks, activities} = data;

    return <div className="space-y-5">
        <section className="crm-card p-5 sm:p-6">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between"><div className="flex min-w-0 items-start gap-4"><UserAvatar size="lg" name={lead.customer_name}/><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h1 className="font-[var(--font-display)] text-2xl font-semibold tracking-[-.03em]">{lead.customer_name}</h1><StatusBadge status={lead.status}/></div><p className="mt-1 text-sm text-[var(--crm-muted)]">{lead.company_name || "Individual lead"} · {lead.service_required}</p><div className="mt-3 flex flex-wrap items-center gap-4 text-xs"><span className="font-semibold text-[var(--crm-text)]">{formatInr(lead.estimated_value)}</span><PriorityBadge priority={lead.priority}/><span className="text-[var(--crm-muted)]">Created {formatCrmDate(lead.created_at)}</span></div></div></div><div className="flex flex-wrap items-center gap-2"><LeadStatusControl value={lead.status} disabled={statusSaving} onChange={(status) => void updateStatus(status)}/>{canManage ? <Link href={`/admin/leads/${lead.id}/edit`} className="crm-button-primary"><Edit3 className="h-3.5 w-3.5"/> Edit</Link> : null}<Link href={`/admin/whatsapp?leadId=${lead.id}`} className="crm-button-secondary"><MessageCircle className="h-3.5 w-3.5"/> WhatsApp</Link><button disabled title="Calling will be added in a later phase" className="crm-button-secondary"><Phone className="h-3.5 w-3.5"/> Call</button><button title="More actions will be added in a later phase" className="crm-icon-button"><MoreHorizontal className="h-4 w-4"/></button></div></div>
        </section>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1.85fr)_minmax(19rem,.85fr)]">
            <main className="min-w-0 space-y-5">
                <section className="crm-card overflow-hidden">
                    <div className="flex items-center gap-5 border-b border-[var(--crm-border)] px-5">{(["activity", "comments", "tasks"] as DetailTab[]).map((item) => <button key={item} onClick={() => setTab(item)} className={`border-b-2 py-3.5 text-xs font-semibold capitalize transition ${tab === item ? "border-[#0d5c63] text-[#0d5c63]" : "border-transparent text-[var(--crm-muted)] hover:text-[var(--crm-text)]"}`}>{item}{item === "comments" ? ` (${notes.length})` : item === "tasks" ? ` (${tasks.length})` : ""}</button>)}</div>
                    {tab === "activity" ? <ActivityTimeline activities={activities}/> : tab === "comments" ? <CommentsPanel comments={notes} onSubmit={addNote} saving={noteSaving}/> : <TasksPanel tasks={tasks} canManage={canManage} onAdd={() => setTaskOpen(true)} onComplete={completeTask}/>}{/* Employees can comment, while task controls remain read-only. */}
                </section>

                <section className="crm-card p-5"><h2 className="text-sm font-semibold">Requirement</h2><p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-[var(--crm-muted)]">{lead.description || "No project requirement has been added yet."}</p></section>
            </main>

            <aside className="space-y-5">
                <InfoCard title="Contact information" rows={[{label: "Email", value: lead.email || "Not provided", href: lead.email ? `mailto:${lead.email}` : undefined},{label: "Phone", value: lead.phone || "Not provided", href: lead.phone ? `tel:${lead.phone}` : undefined},{label: "Company", value: lead.company_name || "Not provided"}]}/>
                <InfoCard title="Lead information" rows={[{label: "Service", value: lead.service_required},{label: "Source", value: LEAD_SOURCE_LABELS[lead.lead_source]},{label: "Status", value: LEAD_STATUS_LABELS[lead.status]},{label: "Value", value: formatInr(lead.estimated_value)},{label: "Next follow-up", value: formatRelativeDate(lead.next_followup)},{label: "Created", value: formatCrmDate(lead.created_at, true)}]}/>
                <section className="crm-card p-4"><p className="text-xs font-semibold">Assigned user</p><div className="mt-3 flex items-center gap-3">{lead.assigned_profile ? <><UserAvatar name={lead.assigned_profile.full_name || lead.assigned_profile.email} imageUrl={lead.assigned_profile.avatar_url}/><div className="min-w-0"><p className="truncate text-xs font-semibold">{lead.assigned_profile.full_name || lead.assigned_profile.email}</p><p className="truncate text-[10px] text-[var(--crm-muted)]">{lead.assigned_profile.email}</p></div></> : <><span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--crm-subtle)]"><UserRound className="h-3.5 w-3.5 text-[var(--crm-muted)]"/></span><p className="text-xs text-[var(--crm-muted)]">Unassigned</p></>}</div></section>
            </aside>
        </div>

        {canManage && taskOpen ? <Modal title="Create task" description={`Add a task for ${lead.customer_name}.`} onClose={() => setTaskOpen(false)}><TaskForm leadId={lead.id} onCancel={() => setTaskOpen(false)} onCreated={() => { setTaskOpen(false); toast.success("Task created"); void load(); }}/></Modal> : null}
    </div>;
}

function ActivityTimeline({activities}: {activities: Activity[]}) {
    if (!activities.length) return <EmptyState title="No activity yet" description="Changes to this lead will appear here automatically."/>;
    return <div className="p-5"><div className="relative ml-2 border-l border-[var(--crm-border)]">{activities.map((activity) => <div key={activity.id} className="relative pb-6 pl-6 last:pb-0"><span className="absolute -left-1.5 top-1.5 h-3 w-3 rounded-full border-2 border-[var(--crm-surface)] bg-[#0d5c63]"/><div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between"><div><p className="text-xs font-semibold">{activity.description}</p>{activity.activity_type === "status_changed" ? <p className="mt-1 text-[11px] text-[var(--crm-muted)]">{statusFromMetadata(activity.metadata.old_status)} → {statusFromMetadata(activity.metadata.new_status)}</p> : null}<div className="mt-2 flex items-center gap-2"><UserAvatar size="sm" name={activity.actor?.full_name || activity.actor?.email || "System"}/><span className="text-[10px] text-[var(--crm-muted)]">{activity.actor?.full_name || "System"}</span></div></div><time className="text-[10px] text-[var(--crm-muted)]">{formatCrmDate(activity.created_at, true)}</time></div></div>)}</div></div>;
}

function CommentsPanel({comments, onSubmit, saving}: {comments: LeadNote[]; onSubmit: (event: FormEvent<HTMLFormElement>) => void; saving: boolean}) {
    return <div><form onSubmit={onSubmit} className="border-b border-[var(--crm-border)] p-5"><textarea name="note" required rows={3} className="admin-input h-auto resize-y py-3" placeholder="Add a comment or conversation update…"/><div className="mt-2 flex justify-end"><button disabled={saving} className="crm-button-primary">{saving ? <Loader2 className="h-3.5 w-3.5 animate-spin"/> : <Send className="h-3.5 w-3.5"/>} Add comment</button></div></form>{comments.length ? <div className="divide-y divide-[var(--crm-border)]">{comments.map((comment) => <div key={comment.id} className="flex gap-3 p-5"><UserAvatar size="sm" name={comment.author?.full_name || comment.author?.email || "Team"}/><div className="min-w-0 flex-1"><div className="flex items-center justify-between gap-3"><p className="text-xs font-semibold">{comment.author?.full_name || comment.author?.email || "Team member"}</p><time className="text-[10px] text-[var(--crm-muted)]">{formatCrmDate(comment.created_at, true)}</time></div><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[var(--crm-muted)]">{comment.note}</p></div></div>)}</div> : <EmptyState title="No comments yet" description="Add context from calls, meetings or discovery conversations."/>}</div>;
}

function TasksPanel({tasks, canManage, onAdd, onComplete}: {tasks: CrmTask[]; canManage: boolean; onAdd: () => void; onComplete: (task: CrmTask) => Promise<void>}) {
    return <div>{canManage ? <div className="flex justify-end border-b border-[var(--crm-border)] p-3"><button onClick={onAdd} className="crm-button-secondary"><Plus className="h-3.5 w-3.5"/> Add task</button></div> : null}{tasks.length ? <div className="divide-y divide-[var(--crm-border)]">{tasks.map((task) => <div key={task.id} className="flex items-start gap-3 p-4">{canManage ? <button disabled={task.status === "completed"} onClick={() => void onComplete(task)} className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${task.status === "completed" ? "border-emerald-500 bg-emerald-500 text-white" : "border-[var(--crm-border)] hover:border-[#0d5c63]"}`}>{task.status === "completed" ? <Check className="h-3 w-3"/> : null}</button> : <span aria-hidden="true" className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${task.status === "completed" ? "border-emerald-500 bg-emerald-500 text-white" : "border-[var(--crm-border)]"}`}>{task.status === "completed" ? <Check className="h-3 w-3"/> : null}</span>}<div className="min-w-0 flex-1"><p className={`text-xs font-semibold ${task.status === "completed" ? "text-[var(--crm-muted)] line-through" : ""}`}>{task.title}</p><div className="mt-1.5 flex flex-wrap items-center gap-2 text-[10px] text-[var(--crm-muted)]"><CalendarClock className="h-3 w-3"/>{formatRelativeDate(task.due_date)}<span>·</span><PriorityBadge priority={task.priority}/></div></div></div>)}</div> : <EmptyState title="No tasks for this lead" description={canManage ? "Create a task to keep the next action visible." : "No tasks are currently assigned to you for this lead."}/>}</div>;
}

function LeadStatusControl({value, disabled, onChange}: {value: LeadStatus; disabled: boolean; onChange: (status: LeadStatus) => void}) {
    return <label className="relative block"><span className="sr-only">Lead status</span><select aria-label="Lead status" value={value} disabled={disabled} onChange={(event) => onChange(event.target.value as LeadStatus)} className="crm-control h-9 cursor-pointer appearance-none py-0 pl-3 pr-9 text-[11px] font-semibold disabled:cursor-wait">{LEAD_STATUSES.map((status) => <option key={status} value={status}>{LEAD_STATUS_LABELS[status]}</option>)}</select>{disabled ? <Loader2 aria-hidden="true" className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 animate-spin text-[var(--crm-muted)]"/> : <ChevronDown aria-hidden="true" className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--crm-muted)]"/>}</label>;
}

function InfoCard({title, rows}: {title: string; rows: {label: string; value: string; href?: string}[]}) { return <section className="crm-card p-4"><h2 className="text-xs font-semibold">{title}</h2><dl className="mt-3 divide-y divide-[var(--crm-border)]">{rows.map((row) => <div key={row.label} className="flex items-start justify-between gap-4 py-2.5"><dt className="text-[10px] text-[var(--crm-muted)]">{row.label}</dt><dd className="max-w-[65%] break-words text-right text-[11px] font-medium">{row.href ? <a href={row.href} className="inline-flex items-center gap-1 hover:text-[#0d5c63]">{row.value}<ExternalLink className="h-2.5 w-2.5"/></a> : row.value}</dd></div>)}</dl></section>; }
function DetailSkeleton() { return <div className="space-y-5"><Skeleton className="h-36 w-full"/><div className="grid gap-5 xl:grid-cols-[minmax(0,1.85fr)_minmax(19rem,.85fr)]"><Skeleton className="h-[34rem] w-full"/><Skeleton className="h-96 w-full"/></div></div>; }
function statusFromMetadata(value: unknown) { return typeof value === "string" && value in LEAD_STATUS_LABELS ? LEAD_STATUS_LABELS[value as keyof typeof LEAD_STATUS_LABELS] : "Unknown"; }
