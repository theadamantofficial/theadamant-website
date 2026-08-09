"use client";

import {useCallback, useEffect, useState} from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import {CalendarClock, Check, ChevronLeft, ChevronRight, Plus} from "lucide-react";
import {useAdminActor} from "@/components/admin/admin-shell";
import {DataError, EmptyState, Modal, PageHeader, PriorityBadge, Skeleton, UserAvatar} from "@/components/admin/admin-ui";
import type {CrmTask} from "@/features/crm/types";
import {crmFetch} from "@/features/crm/api";
import {formatRelativeDate} from "@/features/crm/format";
import {canManageLeads} from "@/features/crm/permissions";
import {TaskForm} from "@/features/crm/tasks/task-form";

const TABS = [
    {id: "all", label: "All"},
    {id: "my", label: "My Tasks"},
    {id: "today", label: "Today"},
    {id: "upcoming", label: "Upcoming"},
    {id: "overdue", label: "Overdue"},
    {id: "completed", label: "Completed"},
] as const;

type Pagination = {page: number; pageSize: number; total: number; pages: number};

export function TasksScreen({initialNew = false}: {initialNew?: boolean}) {
    const actor = useAdminActor();
    const canManage = canManageLeads(actor.role);
    const [tasks, setTasks] = useState<CrmTask[]>([]);
    const [tab, setTab] = useState("all");
    const [pagination, setPagination] = useState<Pagination>({page: 1, pageSize: 25, total: 0, pages: 1});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [createOpen, setCreateOpen] = useState(initialNew && canManage);

    const load = useCallback(async (page = 1) => {
        setLoading(true);
        setError("");
        try {
            const data = await crmFetch<{tasks: CrmTask[]; pagination: Pagination}>(`/api/admin/tasks?tab=${tab}&page=${page}&pageSize=25`);
            setTasks(data.tasks);
            setPagination(data.pagination);
        } catch (loadError) {
            setError(loadError instanceof Error ? loadError.message : "Tasks could not be loaded.");
        } finally {
            setLoading(false);
        }
    }, [tab]);

    useEffect(() => {
        void load(1);
    }, [load]);

    async function complete(task: CrmTask) {
        try {
            await crmFetch(`/api/admin/tasks/${task.id}`, {method: "PATCH", body: JSON.stringify({status: task.status === "completed" ? "open" : "completed"})});
            toast.success(task.status === "completed" ? "Task reopened" : "Task completed");
            await load(pagination.page);
        } catch (taskError) {
            toast.error(taskError instanceof Error ? taskError.message : "Task could not be updated.");
        }
    }

    return <div className="space-y-5">
        <PageHeader
            title="Tasks"
            description={canManage ? "Keep follow-ups and commitments moving." : "Review the tasks assigned to you."}
            actions={canManage ? <button onClick={() => setCreateOpen(true)} className="crm-button-primary"><Plus className="h-3.5 w-3.5"/> New task</button> : <span className="rounded-lg border border-[var(--crm-border)] bg-[var(--crm-surface)] px-3 py-2 text-[11px] text-[var(--crm-muted)]">Read only</span>}
        />
        {error ? <DataError message={error} onRetry={() => void load(pagination.page)}/> : null}
        <section className="crm-card overflow-hidden">
            <div className="flex gap-1 overflow-x-auto border-b border-[var(--crm-border)] p-2">
                {TABS.map((item) => <button key={item.id} onClick={() => setTab(item.id)} className={`h-8 whitespace-nowrap rounded-md px-3 text-xs font-semibold transition ${tab === item.id ? "bg-[#e1efed] text-[#0d5c63]" : "text-[var(--crm-muted)] hover:bg-[var(--crm-subtle)] hover:text-[var(--crm-text)]"}`}>{item.label}</button>)}
            </div>
            {loading ? <div className="space-y-4 p-5">{Array.from({length: 7}).map((_, index) => <Skeleton key={index} className="h-12 w-full"/>)}</div> : tasks.length ? <div className="divide-y divide-[var(--crm-border)]">
                {tasks.map((task) => <article key={task.id} className="grid gap-3 p-4 transition hover:bg-[var(--crm-subtle)] md:grid-cols-[2rem_minmax(14rem,1.5fr)_minmax(9rem,.8fr)_minmax(10rem,.8fr)_7rem] md:items-center">
                    {canManage ? <button aria-label={task.status === "completed" ? "Reopen task" : "Complete task"} onClick={() => void complete(task)} className={`flex h-5 w-5 items-center justify-center rounded-full border ${task.status === "completed" ? "border-emerald-500 bg-emerald-500 text-white" : "border-[var(--crm-border)] hover:border-[#0d5c63]"}`}>{task.status === "completed" ? <Check className="h-3 w-3"/> : null}</button> : <span aria-hidden="true" className={`flex h-5 w-5 items-center justify-center rounded-full border ${task.status === "completed" ? "border-emerald-500 bg-emerald-500 text-white" : "border-[var(--crm-border)]"}`}>{task.status === "completed" ? <Check className="h-3 w-3"/> : null}</span>}
                    <div className="min-w-0"><p className={`truncate text-xs font-semibold ${task.status === "completed" ? "text-[var(--crm-muted)] line-through" : ""}`}>{task.title}</p>{task.lead ? <Link href={`/admin/leads/${task.lead.id}`} className="mt-1 block truncate text-[10px] text-[#0d5c63]">{task.lead.customer_name}{task.lead.company_name ? ` · ${task.lead.company_name}` : ""}</Link> : <p className="mt-1 text-[10px] text-[var(--crm-muted)]">No associated lead</p>}</div>
                    <div className="flex items-center gap-2">{task.assigned_profile ? <><UserAvatar size="sm" name={task.assigned_profile.full_name || task.assigned_profile.email}/><span className="truncate text-[11px]">{task.assigned_profile.full_name || task.assigned_profile.email}</span></> : null}</div>
                    <span className={`flex items-center gap-1.5 text-[11px] ${task.due_date && new Date(task.due_date) < new Date() && task.status !== "completed" ? "text-rose-600" : "text-[var(--crm-muted)]"}`}><CalendarClock className="h-3.5 w-3.5"/>{formatRelativeDate(task.due_date)}</span>
                    <PriorityBadge priority={task.priority}/>
                </article>)}
            </div> : <EmptyState title="No tasks here" description={canManage ? "Create a task to keep the next action visible." : "No tasks are currently assigned to you."}/>}{/* Employees receive a read-only task list. */}
            <div className="flex items-center justify-between border-t border-[var(--crm-border)] px-4 py-3 text-[11px] text-[var(--crm-muted)]"><span>{pagination.total} tasks</span><div className="flex items-center gap-2"><button disabled={pagination.page <= 1} onClick={() => void load(pagination.page - 1)} className="crm-icon-button h-8 w-8"><ChevronLeft className="h-3.5 w-3.5"/></button><span>{pagination.page} / {Math.max(1, pagination.pages)}</span><button disabled={pagination.page >= pagination.pages} onClick={() => void load(pagination.page + 1)} className="crm-icon-button h-8 w-8"><ChevronRight className="h-3.5 w-3.5"/></button></div></div>
        </section>
        {canManage && createOpen ? <Modal title="New task" description="Create a task and connect it to a lead when useful." onClose={() => setCreateOpen(false)}><TaskForm onCancel={() => setCreateOpen(false)} onCreated={() => { setCreateOpen(false); toast.success("Task created"); void load(1); }}/></Modal> : null}
    </div>;
}
