"use client";
import {useRouter} from "next/navigation";
import {Workflow, LockKeyhole} from "lucide-react";
import {useAdminActor} from "@/components/admin/admin-shell";
import {canAccessDevelopment, canAccessSales} from "@/features/crm/permissions";

export function PipelineSwitcher({value}: {value: "sales" | "development"}) {
    const actor = useAdminActor();
    const router = useRouter();
    return <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-[var(--crm-border)] pb-4">
        <label className="flex items-center gap-2 text-sm font-semibold"><Workflow className="h-4 w-4 text-[#0d5c63]"/><span className="sr-only">Pipeline workspace</span><select aria-label="Pipeline workspace" value={value} onChange={(event) => router.push(event.target.value === "sales" ? "/admin/pipeline" : "/admin/development")} className="crm-control min-w-52">
            <option value="sales" disabled={!canAccessSales(actor.role)}>Sales pipeline</option>
            <option value="development" disabled={!canAccessDevelopment(actor.role)}>Development pipeline</option>
        </select></label><span className="flex items-center gap-1.5 text-[11px] text-[var(--crm-muted)]"><LockKeyhole className="h-3 w-3"/> Internal workspace</span>
    </div>;
}
