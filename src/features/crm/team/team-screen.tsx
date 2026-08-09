"use client";

import {useCallback, useEffect, useState} from "react";
import toast from "react-hot-toast";
import {ShieldCheck} from "lucide-react";
import {useAdminActor} from "@/components/admin/admin-shell";
import {DataError, EmptyState, PageHeader, Skeleton, UserAvatar} from "@/components/admin/admin-ui";
import {CRM_ROLES, ROLE_LABELS} from "@/features/crm/constants";
import type {CrmRole} from "@/features/crm/types";
import {crmFetch} from "@/features/crm/api";
import {formatCrmDate} from "@/features/crm/format";

type TeamMember = {id: string; full_name: string; email: string; role: CrmRole; avatar_url: string | null; active: boolean; created_at: string; active_leads: number; open_tasks: number};

export function TeamScreen() {
    const actor = useAdminActor();
    const [members, setMembers] = useState<TeamMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState("");
    const [error, setError] = useState("");
    const canManage = actor.role === "super_admin" || actor.role === "admin";
    const load = useCallback(async () => { setLoading(true); setError(""); try { setMembers((await crmFetch<{members: TeamMember[]}>("/api/admin/team")).members); } catch (loadError) { setError(loadError instanceof Error ? loadError.message : "Team could not be loaded."); } finally { setLoading(false); } }, []);
    useEffect(() => { void load(); }, [load]);

    async function update(id: string, changes: Record<string, unknown>) {
        setSaving(id);
        try { await crmFetch("/api/admin/team", {method: "PATCH", body: JSON.stringify({id, ...changes})}); toast.success("Team access updated"); await load(); }
        catch (updateError) { toast.error(updateError instanceof Error ? updateError.message : "Team access could not be updated."); }
        finally { setSaving(""); }
    }

    return <div className="space-y-5"><PageHeader title="Team" description="Company members, roles and current CRM workload." actions={<span className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--crm-border)] bg-[var(--crm-surface)] px-3 py-2 text-[11px] text-[var(--crm-muted)]"><ShieldCheck className="h-3.5 w-3.5"/> Users are created manually in Supabase Auth</span>}/>{error ? <DataError message={error} onRetry={() => void load()}/> : null}<section className="crm-card overflow-hidden">{loading ? <div className="space-y-4 p-5">{Array.from({length: 6}).map((_, index) => <Skeleton key={index} className="h-14 w-full"/>)}</div> : members.length ? <div className="overflow-x-auto"><table className="w-full min-w-[820px] text-left"><thead><tr className="border-b border-[var(--crm-border)] bg-[var(--crm-subtle)] text-[10px] uppercase tracking-[.09em] text-[var(--crm-muted)]"><th className="px-5 py-2.5 font-medium">Member</th><th className="px-3 py-2.5 font-medium">Role</th><th className="px-3 py-2.5 font-medium">Active leads</th><th className="px-3 py-2.5 font-medium">Open tasks</th><th className="px-3 py-2.5 font-medium">Joined</th><th className="px-5 py-2.5 font-medium">Access</th></tr></thead><tbody className="divide-y divide-[var(--crm-border)]">{members.map((member) => { const protectedAdmin = member.email === "admin@theadamant.com"; return <tr key={member.id} className="text-xs"><td className="px-5 py-3"><span className="flex items-center gap-3"><UserAvatar name={member.full_name || member.email} imageUrl={member.avatar_url}/><span className="min-w-0"><span className="block truncate font-semibold">{member.full_name || member.email.split("@")[0]}</span><span className="mt-0.5 block truncate text-[10px] text-[var(--crm-muted)]">{member.email}</span></span>{protectedAdmin ? <span className="rounded-md bg-emerald-50 px-1.5 py-1 text-[9px] font-semibold text-emerald-700">Protected</span> : null}</span></td><td className="px-3 py-3"><select aria-label={`Role for ${member.email}`} disabled={!canManage || protectedAdmin || saving === member.id} value={member.role} onChange={(event) => void update(member.id, {role: event.target.value})} className="crm-control min-w-32"><option value="super_admin" disabled={actor.role !== "super_admin"}>Super admin</option>{CRM_ROLES.filter((role) => role !== "super_admin").map((role) => <option key={role} value={role}>{ROLE_LABELS[role]}</option>)}</select></td><td className="px-3 py-3 font-semibold">{member.active_leads}</td><td className="px-3 py-3 font-semibold">{member.open_tasks}</td><td className="px-3 py-3 text-[var(--crm-muted)]">{formatCrmDate(member.created_at)}</td><td className="px-5 py-3"><button disabled={!canManage || protectedAdmin || saving === member.id} onClick={() => void update(member.id, {active: !member.active})} className={`rounded-md px-2.5 py-1.5 text-[10px] font-semibold transition disabled:opacity-55 ${member.active ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>{saving === member.id ? "Saving…" : member.active ? "Active" : "Disabled"}</button></td></tr>; })}</tbody></table></div> : <EmptyState title="No team members" description="Create approved users in Supabase Auth; profiles will appear here automatically."/>}</section></div>;
}
