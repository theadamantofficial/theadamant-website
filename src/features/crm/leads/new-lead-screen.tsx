"use client";

import {PageHeader} from "@/components/admin/admin-ui";
import {LeadForm} from "@/features/crm/leads/lead-form";

export function NewLeadScreen() {
    return <div className="mx-auto max-w-4xl space-y-6"><PageHeader eyebrow="Leads" title="Add lead" description="Create a new prospect or sales opportunity."/><LeadForm/></div>;
}
