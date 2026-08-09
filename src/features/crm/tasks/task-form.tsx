"use client";

import {FormEvent, useEffect, useState} from "react";
import {Loader2} from "lucide-react";
import {FormField} from "@/components/admin/admin-ui";
import {useAdminActor} from "@/components/admin/admin-shell";
import {PRIORITIES} from "@/features/crm/constants";
import type {CrmTask, Lead, Profile} from "@/features/crm/types";
import {crmFetch} from "@/features/crm/api";

export function TaskForm({leadId, onCancel, onCreated}: {leadId?: string; onCancel: () => void; onCreated: (task: CrmTask) => void}) {
    const actor = useAdminActor();
    const [members, setMembers] = useState<Profile[]>([]);
    const [leads, setLeads] = useState<Lead[]>([]);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        void crmFetch<{members: Profile[]}>("/api/admin/team").then((data) => setMembers(data.members)).catch(() => undefined);
        if (!leadId) void crmFetch<{leads: Lead[]}>("/api/admin/leads?pageSize=100").then((data) => setLeads(data.leads)).catch(() => undefined);
    }, [leadId]);

    async function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault(); setSaving(true); setError("");
        const form = new FormData(event.currentTarget);
        try {
            const data = await crmFetch<{task: CrmTask}>("/api/admin/tasks", {method: "POST", body: JSON.stringify({title: form.get("title"), description: form.get("description"), lead_id: leadId || form.get("lead_id"), assigned_to: form.get("assigned_to"), due_date: form.get("due_date"), priority: form.get("priority")})});
            onCreated(data.task);
        } catch (submitError) { setError(submitError instanceof Error ? submitError.message : "Task could not be created."); }
        finally { setSaving(false); }
    }

    return <form onSubmit={submit} className="space-y-4"><FormField label="Task title" required><input name="title" required className="admin-input" placeholder="Follow up on proposal"/></FormField>{!leadId ? <FormField label="Associated lead"><select name="lead_id" className="admin-input"><option value="">No associated lead</option>{leads.map((lead) => <option key={lead.id} value={lead.id}>{lead.customer_name}{lead.company_name ? ` — ${lead.company_name}` : ""}</option>)}</select></FormField> : null}<div className="grid gap-4 sm:grid-cols-2"><FormField label="Assigned to" required><select name="assigned_to" required defaultValue={actor.role === "sales" ? actor.id : ""} className="admin-input"><option value="" disabled>Choose member</option>{members.filter((member) => member.active).map((member) => <option key={member.id} value={member.id}>{member.full_name || member.email}</option>)}</select></FormField><FormField label="Due date" required><input name="due_date" type="datetime-local" required className="admin-input"/></FormField></div><FormField label="Priority"><select name="priority" defaultValue="medium" className="admin-input">{PRIORITIES.map((priority) => <option key={priority} value={priority}>{priority.charAt(0).toUpperCase() + priority.slice(1)}</option>)}</select></FormField><FormField label="Description"><textarea name="description" rows={3} className="admin-input h-auto resize-y py-3"/></FormField>{error ? <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-xs text-red-700">{error}</p> : null}<div className="flex justify-end gap-2 pt-2"><button type="button" onClick={onCancel} className="crm-button-secondary">Cancel</button><button disabled={saving} className="crm-button-primary">{saving ? <Loader2 className="h-3.5 w-3.5 animate-spin"/> : null}{saving ? "Creating…" : "Create task"}</button></div></form>;
}
