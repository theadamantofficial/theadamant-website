"use client";

import {useCallback, useEffect, useMemo, useState} from "react";
import {DataError, EmptyState, PageHeader, SearchInput, Skeleton, UserAvatar} from "@/components/admin/admin-ui";
import type {CustomerDirectoryItem} from "@/features/crm/types";
import {crmFetch} from "@/features/crm/api";
import {formatCrmDate, formatInr} from "@/features/crm/format";

export function CustomersScreen() {
    const [customers, setCustomers] = useState<CustomerDirectoryItem[]>([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const load = useCallback(async () => { setLoading(true); setError(""); try { setCustomers((await crmFetch<{customers: CustomerDirectoryItem[]}>("/api/admin/customers")).customers); } catch (loadError) { setError(loadError instanceof Error ? loadError.message : "Customers could not be loaded."); } finally { setLoading(false); } }, []);
    useEffect(() => { void load(); }, [load]);
    const filtered = useMemo(() => { const query = search.trim().toLowerCase(); return query ? customers.filter((item) => [item.customer_name, item.email, item.phone, item.company_name].some((value) => value?.toLowerCase().includes(query))) : customers; }, [customers, search]);

    return <div className="space-y-5"><PageHeader title="Customers" description="A lightweight contact directory built from CRM opportunities."/>{error ? <DataError message={error} onRetry={() => void load()}/> : null}<section className="crm-card overflow-hidden"><div className="flex items-center justify-between gap-4 border-b border-[var(--crm-border)] p-4"><div><h2 className="text-sm font-semibold">Customer directory</h2><p className="mt-0.5 text-[11px] text-[var(--crm-muted)]">{customers.length} unique contacts</p></div><div className="w-full max-w-xs"><SearchInput value={search} onChange={setSearch} placeholder="Search customers…"/></div></div>{loading ? <div className="space-y-4 p-5">{Array.from({length: 7}).map((_, index) => <Skeleton key={index} className="h-11 w-full"/>)}</div> : filtered.length ? <div className="overflow-x-auto"><table className="w-full min-w-[820px] text-left"><thead><tr className="border-b border-[var(--crm-border)] bg-[var(--crm-subtle)] text-[10px] uppercase tracking-[.09em] text-[var(--crm-muted)]"><th className="px-5 py-2.5 font-medium">Customer</th><th className="px-3 py-2.5 font-medium">Phone</th><th className="px-3 py-2.5 font-medium">Email</th><th className="px-3 py-2.5 font-medium">Company</th><th className="px-3 py-2.5 font-medium">Opportunities</th><th className="px-3 py-2.5 font-medium">Won value</th><th className="px-5 py-2.5 font-medium">Last interaction</th></tr></thead><tbody className="divide-y divide-[var(--crm-border)]">{filtered.map((customer) => <tr key={customer.customer_key} className="text-xs transition hover:bg-[var(--crm-subtle)]"><td className="px-5 py-3"><span className="flex items-center gap-2.5"><UserAvatar size="sm" name={customer.customer_name}/><span className="font-semibold">{customer.customer_name}</span></span></td><td className="px-3 py-3 text-[var(--crm-muted)]">{customer.phone || "—"}</td><td className="px-3 py-3 text-[var(--crm-muted)]">{customer.email || "—"}</td><td className="px-3 py-3">{customer.company_name || "—"}</td><td className="px-3 py-3 font-semibold">{customer.total_opportunities}</td><td className="px-3 py-3 font-semibold">{formatInr(customer.won_value)}</td><td className="px-5 py-3 text-[var(--crm-muted)]">{formatCrmDate(customer.last_interaction, true)}</td></tr>)}</tbody></table></div> : <EmptyState title="No customers found" description={search ? "Try a different customer search." : "Customer records will be created automatically from leads."}/>}</section></div>;
}
