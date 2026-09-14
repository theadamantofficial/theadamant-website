"use client";

import {useEffect, useRef, type ReactNode} from "react";
import {X} from "lucide-react";

export function ContentEditor({title, onClose, disabled, children}: {title: string; onClose: () => void; disabled: boolean; children: ReactNode}) {
    const ref = useRef<HTMLDivElement>(null);
    useEffect(() => { ref.current?.querySelector<HTMLInputElement>("input")?.focus(); }, []);
    return <div ref={ref} className="rounded-xl border border-[var(--crm-border)] bg-[var(--crm-surface)] p-5 sm:p-6">
        <div className="mb-5 flex items-center justify-between gap-4"><h2 className="text-lg font-semibold">{title}</h2><button type="button" disabled={disabled} aria-label="Close editor" className="crm-icon-button" onClick={onClose}><X className="h-4 w-4"/></button></div>
        {children}
    </div>;
}

export function ContentFeedback({error, notice}: {error: string; notice: string}) {
    return <>{error && <p role="alert" className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-700 dark:text-red-300">{error}</p>}{notice && <p role="status" className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-700 dark:text-emerald-300">{notice}</p>}</>;
}
