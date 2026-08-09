"use client";

import {ReactNode} from "react";
import Link from "next/link";
import {Inbox, Search, X} from "lucide-react";
import {LEAD_STATUS_LABELS} from "@/features/crm/constants";
import type {LeadStatus, Priority} from "@/features/crm/types";

export function PageHeader({eyebrow, title, description, actions}: {eyebrow?: string; title: string; description?: string; actions?: ReactNode}) {
    return <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div>{eyebrow ? <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[.16em] text-[var(--crm-muted)]">{eyebrow}</p> : null}<h1 className="font-[var(--font-display)] text-2xl font-semibold tracking-[-.025em] text-[var(--crm-text)] sm:text-[1.75rem]">{title}</h1>{description ? <p className="mt-1.5 text-sm text-[var(--crm-muted)]">{description}</p> : null}</div>{actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}</div>;
}

export function MetricCard({label, value, context, icon}: {label: string; value: string; context: string; icon: ReactNode}) {
    return <div className="crm-card p-4"><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-medium text-[var(--crm-muted)]">{label}</p><p className="mt-2 font-[var(--font-display)] text-2xl font-semibold tracking-[-.03em] text-[var(--crm-text)]">{value}</p></div><span className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--crm-border)] bg-[var(--crm-subtle)] text-[var(--crm-muted)]">{icon}</span></div><p className="mt-3 text-[11px] text-[var(--crm-muted)]">{context}</p></div>;
}

export function StatusBadge({status}: {status: LeadStatus}) {
    return <span className={`crm-status crm-status-${status}`}>{LEAD_STATUS_LABELS[status]}</span>;
}

export function PriorityBadge({priority}: {priority: Priority}) {
    return <span className={`crm-priority crm-priority-${priority}`}>{priority.charAt(0).toUpperCase() + priority.slice(1)}</span>;
}

export function UserAvatar({name, imageUrl, size = "md"}: {name: string; imageUrl?: string | null; size?: "sm" | "md" | "lg"}) {
    const className = size === "sm" ? "h-7 w-7 text-[9px]" : size === "lg" ? "h-11 w-11 text-sm" : "h-8 w-8 text-[10px]";
    const initials = name.split(/[\s@._-]+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "A";
    return imageUrl ? <span role="img" aria-label={`${name} avatar`} className={`${className} block rounded-full bg-cover bg-center bg-no-repeat`} style={{backgroundImage: `url(${JSON.stringify(imageUrl)})`}}/> : <span className={`${className} inline-flex shrink-0 items-center justify-center rounded-full bg-[#dcebea] font-bold text-[#0d5c63]`}>{initials}</span>;
}

export function SearchInput({value, onChange, placeholder = "Search…"}: {value: string; onChange: (value: string) => void; placeholder?: string}) {
    return <label className="relative block"><span className="sr-only">{placeholder}</span><Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--crm-muted)]"/><input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="crm-control w-full pl-9"/></label>;
}

export function EmptyState({title, description, actionHref, actionLabel}: {title: string; description: string; actionHref?: string; actionLabel?: string}) {
    return <div className="flex min-h-64 flex-col items-center justify-center px-6 py-10 text-center"><span className="flex h-11 w-11 items-center justify-center rounded-xl border border-[var(--crm-border)] bg-[var(--crm-subtle)] text-[var(--crm-muted)]"><Inbox className="h-5 w-5"/></span><h3 className="mt-4 text-sm font-semibold text-[var(--crm-text)]">{title}</h3><p className="mt-1 max-w-sm text-xs leading-5 text-[var(--crm-muted)]">{description}</p>{actionHref && actionLabel ? <Link href={actionHref} className="crm-button-primary mt-5">{actionLabel}</Link> : null}</div>;
}

export function Skeleton({className = "h-4 w-full"}: {className?: string}) {
    return <div className={`animate-pulse rounded-md bg-[var(--crm-skeleton)] ${className}`}/>;
}

export function FormField({label, hint, required, children}: {label: string; hint?: string; required?: boolean; children: ReactNode}) {
    return <label className="block"><span className="mb-1.5 block text-xs font-medium text-[var(--crm-text)]">{label}{required ? <span className="ml-0.5 text-red-500">*</span> : null}</span>{children}{hint ? <span className="mt-1.5 block text-[11px] leading-4 text-[var(--crm-muted)]">{hint}</span> : null}</label>;
}

export function Modal({title, description, onClose, children}: {title: string; description?: string; onClose: () => void; children: ReactNode}) {
    return <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/35 p-4 backdrop-blur-[2px]" role="dialog" aria-modal="true" aria-label={title}><button aria-label="Close modal" onClick={onClose} className="absolute inset-0"/><section className="relative z-10 max-h-[calc(100vh-2rem)] w-full max-w-lg overflow-y-auto rounded-xl border border-[var(--crm-border)] bg-[var(--crm-surface)] p-5 shadow-2xl sm:p-6"><div className="mb-5 flex items-start justify-between gap-4"><div><h2 className="font-[var(--font-display)] text-xl font-semibold text-[var(--crm-text)]">{title}</h2>{description ? <p className="mt-1 text-xs leading-5 text-[var(--crm-muted)]">{description}</p> : null}</div><button aria-label="Close" onClick={onClose} className="crm-icon-button"><X className="h-4 w-4"/></button></div>{children}</section></div>;
}

export function DataError({message, onRetry}: {message: string; onRetry: () => void}) {
    return <div className="flex items-center justify-between gap-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700"><span>{message}</span><button onClick={onRetry} className="font-semibold">Retry</button></div>;
}
