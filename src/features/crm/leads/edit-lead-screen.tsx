"use client";

import {useCallback, useEffect, useState} from "react";
import {DataError, PageHeader, Skeleton} from "@/components/admin/admin-ui";
import type {Lead} from "@/features/crm/types";
import {crmFetch} from "@/features/crm/api";
import {LeadForm} from "@/features/crm/leads/lead-form";

export function EditLeadScreen({leadId}: {leadId: string}) {
    const [lead, setLead] = useState<Lead | null>(null);
    const [error, setError] = useState("");
    const load = useCallback(async () => { try { setError(""); setLead((await crmFetch<{lead: Lead}>(`/api/admin/leads/${leadId}`)).lead); } catch (loadError) { setError(loadError instanceof Error ? loadError.message : "Lead could not be loaded."); } }, [leadId]);
    useEffect(() => { void load(); }, [load]);
    if (error) return <DataError message={error} onRetry={() => void load()}/>;
    if (!lead) return <div className="mx-auto max-w-4xl space-y-5"><Skeleton className="h-10 w-64"/><Skeleton className="h-96 w-full"/></div>;
    return <div className="mx-auto max-w-4xl space-y-6"><PageHeader eyebrow="Leads" title={`Edit ${lead.customer_name}`} description="Update contact, opportunity and follow-up information."/><LeadForm initialLead={lead}/></div>;
}
