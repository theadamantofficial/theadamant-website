"use client";

import {FormEvent, useEffect, useState} from "react";
import {useRouter} from "next/navigation";
import toast from "react-hot-toast";
import {ArrowLeft, Loader2, Save} from "lucide-react";
import {FormField} from "@/components/admin/admin-ui";
import {useAdminActor} from "@/components/admin/admin-shell";
import {ADAMANT_SERVICES, LEAD_SOURCE_LABELS, LEAD_SOURCES, LEAD_STATUS_LABELS, LEAD_STATUSES, PRIORITIES} from "@/features/crm/constants";
import type {Lead, Profile} from "@/features/crm/types";
import {crmFetch} from "@/features/crm/api";
import {canManageLeads} from "@/features/crm/permissions";
import {toDateTimeLocal} from "@/features/crm/format";

type TeamMember = Pick<Profile, "id" | "full_name" | "email" | "active">;

export function LeadForm({initialLead}: {initialLead?: Lead}) {
    const router = useRouter();
    const actor = useAdminActor();
    const [members, setMembers] = useState<TeamMember[]>([]);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const editing = Boolean(initialLead);

    useEffect(() => {
        void crmFetch<{members: TeamMember[]}>("/api/admin/team").then((data) => setMembers(data.members)).catch(() => undefined);
    }, []);

    async function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setSubmitting(true);
        setError("");
        const form = new FormData(event.currentTarget);
        const payload = {
            customer_name: form.get("customer_name"),
            phone: form.get("phone"),
            email: form.get("email"),
            company_name: form.get("company_name"),
            service_required: form.get("service_required"),
            lead_source: form.get("lead_source"),
            estimated_value: form.get("estimated_value"),
            status: form.get("status"),
            assigned_to: form.get("assigned_to"),
            next_followup: form.get("next_followup"),
            priority: form.get("priority"),
            description: form.get("description"),
        };
        try {
            const endpoint = editing ? `/api/admin/leads/${initialLead!.id}` : "/api/admin/leads";
            const data = await crmFetch<{lead: Lead}>(endpoint, {method: editing ? "PATCH" : "POST", body: JSON.stringify(payload)});
            toast.success(editing ? "Lead updated" : "Lead created successfully");
            router.push(`/admin/leads/${data.lead.id}`);
            router.refresh();
        } catch (submitError) {
            setError(submitError instanceof Error ? submitError.message : "Lead could not be saved.");
        } finally {
            setSubmitting(false);
        }
    }

    const canAssign = canManageLeads(actor.role);

    return <form onSubmit={submit} className="space-y-5">
        <FormSection title="Contact" description="Primary contact and company information.">
            <div className="grid gap-4 md:grid-cols-2">
                <FormField label="Customer name" required><input name="customer_name" required defaultValue={initialLead?.customer_name} className="admin-input" placeholder="Rahul Sharma"/></FormField>
                <FormField label="Company"><input name="company_name" defaultValue={initialLead?.company_name || ""} className="admin-input" placeholder="ABC Pvt Ltd"/></FormField>
                <FormField label="Phone"><input name="phone" defaultValue={initialLead?.phone || ""} className="admin-input" placeholder="+91 98765 43210"/></FormField>
                <FormField label="Email"><input name="email" type="email" defaultValue={initialLead?.email || ""} className="admin-input" placeholder="rahul@company.com"/></FormField>
            </div>
        </FormSection>

        <FormSection title="Opportunity" description="Commercial context and pipeline ownership.">
            <div className="grid gap-4 md:grid-cols-2">
                <FormField label="Service required" required><select name="service_required" required defaultValue={initialLead?.service_required || ADAMANT_SERVICES[0]} className="admin-input">{ADAMANT_SERVICES.map((service) => <option key={service} value={service}>{service}</option>)}</select></FormField>
                <FormField label="Lead source"><select name="lead_source" defaultValue={initialLead?.lead_source || "other"} className="admin-input">{LEAD_SOURCES.map((source) => <option key={source} value={source}>{LEAD_SOURCE_LABELS[source]}</option>)}</select></FormField>
                <FormField label="Estimated deal value" hint="Amounts are stored and displayed in INR."><div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[var(--crm-muted)]">₹</span><input name="estimated_value" type="number" min="0" step="1000" defaultValue={initialLead?.estimated_value || 0} className="admin-input pl-7"/></div></FormField>
                <FormField label="Status"><select name="status" defaultValue={initialLead?.status || "new"} className="admin-input">{LEAD_STATUSES.map((status) => <option key={status} value={status}>{LEAD_STATUS_LABELS[status]}</option>)}</select></FormField>
                <FormField label="Assigned to"><select name="assigned_to" disabled={!canAssign} defaultValue={initialLead?.assigned_to || ""} className="admin-input"><option value="">Unassigned</option>{members.filter((member) => member.active).map((member) => <option key={member.id} value={member.id}>{member.full_name || member.email}</option>)}</select></FormField>
                <FormField label="Priority"><select name="priority" defaultValue={initialLead?.priority || "medium"} className="admin-input">{PRIORITIES.map((priority) => <option key={priority} value={priority}>{priority.charAt(0).toUpperCase() + priority.slice(1)}</option>)}</select></FormField>
            </div>
        </FormSection>

        <FormSection title="Follow-up" description="Set the next action while the opportunity is warm.">
            <FormField label="Next follow-up"><input name="next_followup" type="datetime-local" defaultValue={toDateTimeLocal(initialLead?.next_followup)} className="admin-input max-w-sm"/></FormField>
        </FormSection>

        <FormSection title="Requirement" description="Capture the project need in enough detail for the next conversation.">
            <FormField label="Project requirement"><textarea name="description" rows={7} defaultValue={initialLead?.description} className="admin-input h-auto resize-y py-3" placeholder="Business context, requested scope, constraints and next steps…"/></FormField>
        </FormSection>

        {error ? <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">{error}</p> : null}
        <div className="flex items-center justify-end gap-2 border-t border-[var(--crm-border)] pt-5"><button type="button" onClick={() => router.back()} className="crm-button-secondary"><ArrowLeft className="h-3.5 w-3.5"/> Cancel</button><button disabled={submitting} className="crm-button-primary min-w-28">{submitting ? <Loader2 className="h-3.5 w-3.5 animate-spin"/> : <Save className="h-3.5 w-3.5"/>}{submitting ? "Saving…" : editing ? "Save changes" : "Create lead"}</button></div>
    </form>;
}

function FormSection({title, description, children}: {title: string; description: string; children: React.ReactNode}) {
    return <section className="crm-card p-5 sm:p-6"><div className="mb-5 border-b border-[var(--crm-border)] pb-4"><h2 className="text-sm font-semibold">{title}</h2><p className="mt-1 text-[11px] text-[var(--crm-muted)]">{description}</p></div>{children}</section>;
}
