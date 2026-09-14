"use client";

import {useState, type FormEvent} from "react";
import {Check, EyeOff, LoaderCircle, Pencil, Plus, RefreshCw, Star, Trash2} from "lucide-react";
import type {AdminTestimonial} from "@/lib/testimonials";
import {useContentManager} from "@/features/crm/content/use-content-manager";
import {ContentEditor, ContentFeedback} from "@/features/crm/content/content-editor";

export function TestimonialsScreen() {
    const manager = useContentManager<AdminTestimonial>("/api/admin/testimonials", "testimonials", "testimonial");
    const [editor, setEditor] = useState<AdminTestimonial | "new" | null>(null);
    const [tab, setTab] = useState<AdminTestimonial["status"]>("pending");
    const editing = editor && editor !== "new" ? editor : null;
    const {items, loading, saving, error, notice, load, mutate} = manager;

    async function save(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const fields = new FormData(event.currentTarget);
        const status = String(fields.get("status")) as AdminTestimonial["status"];
        const saved = await mutate(editing ? "PATCH" : "POST", {
            ...(editing ? {id: editing.id} : {}), name: fields.get("name"), email: fields.get("email"),
            company: fields.get("company"), rating: Number(fields.get("rating")), message: fields.get("message"),
            consent: fields.get("consent") === "on", status,
        });
        if (saved) { setEditor(null); setTab(status); }
    }
    async function remove(item: AdminTestimonial) {
        if (!window.confirm(`Delete the testimonial from ${item.name}? This cannot be undone.`)) return;
        if (await mutate("DELETE", {id: item.id}) && editing?.id === item.id) setEditor(null);
    }
    const visibleItems = items.filter((item) => item.status === tab);
    return <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
            <div><h1 className="text-2xl font-semibold">Testimonials</h1><p className="mt-2 text-sm text-[var(--crm-muted)]">Add client feedback, edit details, and choose what appears on the homepage.</p></div>
            <div className="flex gap-2"><button type="button" disabled={loading || saving} className="crm-button-secondary" onClick={() => void load()}><RefreshCw className="h-4 w-4"/>Refresh</button><button type="button" disabled={saving || Boolean(editor)} className="crm-button-primary" onClick={() => setEditor("new")}><Plus className="h-4 w-4"/>Add testimonial</button></div>
        </div>
        <ContentFeedback error={error} notice={notice}/>
        {editor && <ContentEditor key={editing?.id || "new"} title={editing ? "Edit testimonial" : "Add testimonial"} disabled={saving} onClose={() => setEditor(null)}>
            <form onSubmit={save}><fieldset disabled={saving} className="space-y-5">
                <div className="grid gap-5 sm:grid-cols-2">
                    <label className="block text-sm font-medium">Client name<input name="name" required minLength={2} maxLength={80} defaultValue={editing?.name || ""} className="crm-control mt-2 w-full"/></label>
                    <label className="block text-sm font-medium">Company (optional)<input name="company" maxLength={100} defaultValue={editing?.company || ""} className="crm-control mt-2 w-full"/></label>
                    <label className="block text-sm font-medium">Email (private)<input name="email" type="email" required maxLength={254} defaultValue={editing?.email || ""} className="crm-control mt-2 w-full"/></label>
                    <label className="block text-sm font-medium">Rating<select name="rating" defaultValue={editing?.rating || 5} className="crm-control mt-2 w-full">{[5, 4, 3, 2, 1].map((rating) => <option key={rating} value={rating}>{rating} {rating === 1 ? "star" : "stars"}</option>)}</select></label>
                </div>
                <label className="block text-sm font-medium">Testimonial<textarea name="message" required minLength={20} maxLength={1500} rows={5} defaultValue={editing?.message || ""} className="crm-control mt-2 w-full resize-y"/></label>
                <label className="block text-sm font-medium">Visibility<select name="status" defaultValue={editing?.status || "pending"} className="crm-control mt-2 w-full"><option value="pending">Pending review</option><option value="approved">Approved — visible on homepage</option><option value="hidden">Hidden</option></select></label>
                <label className="flex items-start gap-3 text-sm leading-6"><input type="checkbox" name="consent" required defaultChecked={Boolean(editing)} className="mt-1 h-4 w-4 shrink-0"/>The client has agreed to publish their name, company, rating, and testimonial.</label>
                <div className="flex gap-2"><button type="submit" className="crm-button-primary">{saving && <LoaderCircle className="h-4 w-4 animate-spin"/>}{saving ? "Saving…" : "Save testimonial"}</button><button type="button" className="crm-button-secondary" onClick={() => setEditor(null)}>Cancel</button></div>
            </fieldset></form>
        </ContentEditor>}
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter testimonials">{(["pending", "approved", "hidden"] as const).map((status) => <button type="button" key={status} aria-pressed={tab === status} onClick={() => setTab(status)} className={tab === status ? "crm-button-primary" : "crm-button-secondary"}>{status.charAt(0).toUpperCase() + status.slice(1)} ({items.filter((item) => item.status === status).length})</button>)}</div>
        {loading ? <p role="status" className="flex items-center gap-2 text-sm text-[var(--crm-muted)]"><LoaderCircle className="h-4 w-4 animate-spin"/>Loading testimonials…</p>
            : !visibleItems.length ? <div className="rounded-xl border border-[var(--crm-border)] bg-[var(--crm-surface)] p-10 text-center text-sm text-[var(--crm-muted)]">No {tab} testimonials.</div>
                : <div className="grid gap-4 xl:grid-cols-2">{visibleItems.map((item) => <article key={item.id} className="min-w-0 rounded-xl border border-[var(--crm-border)] bg-[var(--crm-surface)] p-6">
                    <div className="flex items-start justify-between gap-4"><div className="min-w-0"><h2 className="break-words font-semibold">{item.name}</h2>{item.company && <p className="mt-1 break-words text-sm text-[var(--crm-muted)]">{item.company}</p>}<p className="mt-2 break-words text-xs text-[var(--crm-muted)]">{item.email} · {new Date(item.created_at).toLocaleDateString("en-IN")}</p></div><span className="flex shrink-0 items-center gap-1 text-sm text-amber-600 dark:text-amber-400"><Star className="h-4 w-4" fill="currentColor" aria-hidden="true"/>{item.rating}/5</span></div>
                    <blockquote className="mt-5 whitespace-pre-wrap break-words text-sm leading-7">{item.message}</blockquote>
                    <div className="mt-6 flex flex-wrap gap-2">
                        <button type="button" disabled={saving || Boolean(editor)} className="crm-button-secondary" onClick={() => setEditor(item)}><Pencil className="h-4 w-4"/>Edit</button>
                        {item.status !== "approved" && <button type="button" disabled={saving || Boolean(editor)} className="crm-button-primary" onClick={() => void mutate("PATCH", {id: item.id, status: "approved"})}><Check className="h-4 w-4"/>Approve & publish</button>}
                        {item.status !== "hidden" && <button type="button" disabled={saving || Boolean(editor)} className="crm-button-secondary" onClick={() => void mutate("PATCH", {id: item.id, status: "hidden"})}><EyeOff className="h-4 w-4"/>Hide</button>}
                        <button type="button" disabled={saving || Boolean(editor)} className="crm-button-secondary" onClick={() => void remove(item)}><Trash2 className="h-4 w-4"/>Delete</button>
                    </div>
                </article>)}</div>}
        <p className="text-xs text-[var(--crm-muted)]">Showing the latest 200 testimonials. Email addresses are visible only to admins.</p>
    </div>;
}
