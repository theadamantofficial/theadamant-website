"use client";

import {useCallback, useEffect, useState} from "react";
import toast from "react-hot-toast";
import {ChevronDown, Loader2, LockKeyhole, ShieldCheck} from "lucide-react";
import {useAdminActor} from "@/components/admin/admin-shell";
import {DataError, EmptyState, PageHeader, Skeleton, UserAvatar} from "@/components/admin/admin-ui";
import {CRM_ROLES, ROLE_LABELS} from "@/features/crm/constants";
import type {CrmRole} from "@/features/crm/types";
import {canManageTeam} from "@/features/crm/permissions";
import {crmFetch} from "@/features/crm/api";
import {formatCrmDate} from "@/features/crm/format";

type TeamMember = {
    id: string;
    full_name: string;
    email: string;
    role: CrmRole;
    avatar_url: string | null;
    active: boolean;
    created_at: string;
    active_leads: number;
    open_tasks: number;
};

const ASSIGNABLE_ROLES = CRM_ROLES.filter((role) => role !== "super_admin");

export function TeamScreen() {
    const actor = useAdminActor();
    const [members, setMembers] = useState<TeamMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState("");
    const [error, setError] = useState("");
    const canManage = canManageTeam(actor.role);

    const load = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            setMembers((await crmFetch<{members: TeamMember[]}>("/api/admin/team")).members);
        } catch (loadError) {
            setError(loadError instanceof Error ? loadError.message : "Team could not be loaded.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void load();
    }, [load]);

    async function update(id: string, changes: Record<string, unknown>) {
        setSaving(id);
        try {
            await crmFetch("/api/admin/team", {method: "PATCH", body: JSON.stringify({id, ...changes})});
            toast.success("Team access updated");
            await load();
        } catch (updateError) {
            toast.error(updateError instanceof Error ? updateError.message : "Team access could not be updated.");
        } finally {
            setSaving("");
        }
    }

    return <div className="space-y-5">
        <PageHeader
            title="Team"
            description="Company members, roles and current CRM workload."
            actions={<span className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--crm-border)] bg-[var(--crm-surface)] px-3 py-2 text-[11px] text-[var(--crm-muted)]"><ShieldCheck className="h-3.5 w-3.5"/> {canManage ? "Manage roles and access" : "View only · Super admin manages access"}</span>}
        />
        {error ? <DataError message={error} onRetry={() => void load()}/> : null}
        <section className="crm-card overflow-hidden">
            {loading ? <div className="space-y-4 p-5">{Array.from({length: 6}).map((_, index) => <Skeleton key={index} className="h-14 w-full"/>)}</div> : members.length ? <div className="overflow-x-auto">
                <table className="w-full min-w-[820px] text-left">
                    <thead>
                    <tr className="border-b border-[var(--crm-border)] bg-[var(--crm-subtle)] text-[10px] uppercase tracking-[.09em] text-[var(--crm-muted)]">
                        <th className="px-5 py-2.5 font-medium">Member</th>
                        <th className="w-44 px-3 py-2.5 font-medium">Role</th>
                        <th className="px-3 py-2.5 font-medium">Active leads</th>
                        <th className="px-3 py-2.5 font-medium">Open tasks</th>
                        <th className="px-3 py-2.5 font-medium">Joined</th>
                        <th className="px-5 py-2.5 font-medium">Access</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--crm-border)]">
                    {members.map((member) => {
                        const protectedAdmin = member.email === "admin@theadamant.com";
                        const isSaving = saving === member.id;
                        return <tr key={member.id} className="text-xs">
                            <td className="px-5 py-3">
                                <span className="flex items-center gap-3">
                                    <UserAvatar name={member.full_name || member.email} imageUrl={member.avatar_url}/>
                                    <span className="min-w-0">
                                        <span className="block truncate font-semibold">{member.full_name || member.email.split("@")[0]}</span>
                                        <span className="mt-0.5 block truncate text-[10px] text-[var(--crm-muted)]">{member.email}</span>
                                    </span>
                                    {protectedAdmin ? <span className="rounded-md bg-emerald-50 px-1.5 py-1 text-[9px] font-semibold text-emerald-700">Protected</span> : null}
                                </span>
                            </td>
                            <td className="px-3 py-3">
                                <RoleControl
                                    member={member}
                                    protectedAdmin={protectedAdmin}
                                    editable={canManage}
                                    disabled={isSaving}
                                    saving={isSaving}
                                    onChange={(role) => void update(member.id, {role})}
                                />
                            </td>
                            <td className="px-3 py-3 font-semibold">{member.active_leads}</td>
                            <td className="px-3 py-3 font-semibold">{member.open_tasks}</td>
                            <td className="px-3 py-3 text-[var(--crm-muted)]">{formatCrmDate(member.created_at)}</td>
                            <td className="px-5 py-3">
                                <button
                                    disabled={!canManage || protectedAdmin || isSaving}
                                    onClick={() => void update(member.id, {active: !member.active})}
                                    className={`rounded-md px-2.5 py-1.5 text-[10px] font-semibold transition disabled:cursor-not-allowed disabled:opacity-55 ${member.active ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}
                                >
                                    {isSaving ? "Saving…" : member.active ? "Active" : "Disabled"}
                                </button>
                            </td>
                        </tr>;
                    })}
                    </tbody>
                </table>
            </div> : <EmptyState title="No team members" description="Create an account with an approved company email; its profile will appear here automatically."/>}
        </section>
    </div>;
}

function RoleControl({member, protectedAdmin, editable, disabled, saving, onChange}: {
    member: TeamMember;
    protectedAdmin: boolean;
    editable: boolean;
    disabled: boolean;
    saving: boolean;
    onChange: (role: CrmRole) => void;
}) {
    if (protectedAdmin || !editable) {
        return <span title={protectedAdmin ? "This account is permanently reserved as the CRM super admin." : "Only the super admin can change team roles."} className="inline-flex h-9 w-full min-w-36 max-w-44 items-center justify-between gap-3 rounded-lg border border-[var(--crm-border)] bg-[var(--crm-subtle)] px-3 text-[11px] font-medium text-[var(--crm-muted)]">
            <span>{ROLE_LABELS[member.role]}</span>
            <LockKeyhole aria-hidden="true" className="h-3.5 w-3.5 shrink-0"/>
        </span>;
    }

    return <span className="relative block w-full min-w-36 max-w-44">
        <select
            aria-label={`Role for ${member.email}`}
            disabled={disabled}
            value={member.role}
            onChange={(event) => onChange(event.target.value as CrmRole)}
            className="crm-control h-9 w-full cursor-pointer appearance-none py-0 pl-3 pr-9 text-[11px] disabled:cursor-not-allowed"
        >
            {ASSIGNABLE_ROLES.map((role) => <option key={role} value={role}>{ROLE_LABELS[role]}</option>)}
        </select>
        {saving
            ? <Loader2 aria-hidden="true" className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 animate-spin text-[var(--crm-muted)]"/>
            : <ChevronDown aria-hidden="true" className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--crm-muted)]"/>}
    </span>;
}
