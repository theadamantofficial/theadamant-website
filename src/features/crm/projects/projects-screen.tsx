"use client";

import {useState, type FormEvent, type ChangeEvent} from "react";
import Image from "next/image";
import {ArrowUpRight, EyeOff, LoaderCircle, Monitor, Pencil, Plus, RefreshCw, Trash2, Upload} from "lucide-react";
import {WORK_CATEGORIES} from "@/content/client-work";
import type {AdminProject} from "@/lib/projects";
import {useContentManager} from "@/features/crm/content/use-content-manager";
import {ContentEditor, ContentFeedback} from "@/features/crm/content/content-editor";

function ProjectForm({project, saving, onSave, onCancel, onError}: {
    project: AdminProject | null; saving: boolean;
    onSave: (payload: Record<string, unknown>) => Promise<boolean>;
    onCancel: () => void; onError: (message: string) => void;
}) {
    const [image, setImage] = useState(project?.image || "");
    const [uploading, setUploading] = useState(false);
    async function upload(event: ChangeEvent<HTMLInputElement>) {
        const file = event.currentTarget.files?.[0];
        event.currentTarget.value = "";
        if (!file) return;
        if (file.size > 4 * 1024 * 1024) { onError("Screenshot must be 4 MB or smaller."); return; }
        setUploading(true);
        onError("");
        try {
            const form = new FormData();
            form.set("file", file);
            const response = await fetch("/api/admin/projects/upload", {method: "POST", body: form});
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || "Screenshot could not be uploaded.");
            setImage(data.url);
        } catch (error) { onError(error instanceof Error ? error.message : "Please try again."); }
        finally { setUploading(false); }
    }
    async function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (uploading || saving) return;
        const fields = new FormData(event.currentTarget);
        const saved = await onSave({
            ...(project ? {id: project.id} : {}), name: fields.get("name"), category: fields.get("category"),
            label: fields.get("label"), description: fields.get("description"), href: fields.get("href"),
            image, imageAlt: fields.get("imageAlt"), theme: fields.get("theme"), status: fields.get("status"),
            sort_order: Number(fields.get("sort_order")),
            highlights: String(fields.get("highlights") || "").split("\n").map((item) => item.trim()).filter(Boolean),
        });
        if (saved) onCancel();
    }
    return <ContentEditor title={project ? "Edit project" : "Add project"} disabled={saving || uploading} onClose={onCancel}>
        <form onSubmit={submit}><fieldset disabled={saving || uploading} className="space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
                <label className="block text-sm font-medium">Project name<input name="name" required minLength={2} maxLength={100} defaultValue={project?.name || ""} className="crm-control mt-2 w-full"/></label>
                <label className="block text-sm font-medium">Category<select name="category" defaultValue={project?.category || "Websites"} className="crm-control mt-2 w-full">{WORK_CATEGORIES.map((category) => <option key={category}>{category}</option>)}</select></label>
                <label className="block text-sm font-medium">Project label<input name="label" required minLength={2} maxLength={80} defaultValue={project?.label || "Client project"} placeholder="Client project / In-house product" className="crm-control mt-2 w-full"/></label>
                <label className="block text-sm font-medium">Live project link (optional)<input name="href" type="url" pattern="https://.*" maxLength={2000} defaultValue={project?.href || ""} placeholder="https://example.com" className="crm-control mt-2 w-full"/></label>
            </div>
            <label className="block text-sm font-medium">Description<textarea name="description" required minLength={20} maxLength={1500} rows={4} defaultValue={project?.description || ""} className="crm-control mt-2 w-full resize-y"/></label>
            <div className="rounded-xl border border-[var(--crm-border)] p-4">
                <p className="text-sm font-medium">Project screenshot (optional)</p>
                <label className="mt-3 inline-flex cursor-pointer items-center gap-2 rounded-md text-sm text-[var(--crm-muted)] focus-within:ring-2 focus-within:ring-[var(--crm-border)]"><Upload className="h-4 w-4"/>{uploading ? "Uploading…" : "Upload JPG, PNG, WebP, or AVIF (up to 4 MB)"}<input type="file" accept="image/jpeg,image/png,image/webp,image/avif" onChange={(event) => void upload(event)} className="sr-only"/></label>
                {uploading && <p role="status" className="mt-3 flex items-center gap-2 text-sm"><LoaderCircle className="h-4 w-4 animate-spin"/>Uploading screenshot…</p>}
                <label className="mt-4 block text-sm font-medium">Or enter an image URL<input value={image} onChange={(event) => setImage(event.target.value)} maxLength={2000} placeholder="https://… or /images/work/…" className="crm-control mt-2 w-full"/></label>
                <label className="mt-4 block text-sm font-medium">Screenshot description<input name="imageAlt" required={Boolean(image)} maxLength={200} defaultValue={project?.imageAlt || ""} placeholder="Describe what the screenshot shows" className="crm-control mt-2 w-full"/></label>
                {image && <button type="button" className="crm-button-secondary mt-3" onClick={() => setImage("")}>Remove screenshot</button>}
                <p className="mt-3 text-xs leading-5 text-[var(--crm-muted)]">Without an image, the homepage uses a branded project cover.</p>
            </div>
            <label className="block text-sm font-medium">Highlights (one per line)<textarea name="highlights" rows={3} maxLength={600} defaultValue={project?.highlights.join("\n") || ""} placeholder={"Responsive website\nOnline booking"} className="crm-control mt-2 w-full resize-y"/><span className="mt-1 block text-xs text-[var(--crm-muted)]">Up to 8 highlights, 60 characters each.</span></label>
            <div className="grid gap-5 sm:grid-cols-3">
                <label className="block text-sm font-medium">Visibility<select name="status" defaultValue={project?.status || "draft"} className="crm-control mt-2 w-full"><option value="draft">Draft</option><option value="published">Published</option><option value="hidden">Hidden</option></select></label>
                <label className="block text-sm font-medium">Display order<input name="sort_order" type="number" required min={0} max={9999} step={1} defaultValue={project?.sort_order || 0} className="crm-control mt-2 w-full"/><span className="mt-1 block text-xs text-[var(--crm-muted)]">Lower numbers appear first.</span></label>
                <label className="block text-sm font-medium">Cover theme<select name="theme" defaultValue={project?.theme || "teal"} className="crm-control mt-2 w-full"><option value="teal">Teal</option><option value="clay">Clay</option></select></label>
            </div>
            <div className="flex gap-2"><button type="submit" className="crm-button-primary">{saving && <LoaderCircle className="h-4 w-4 animate-spin"/>}{saving ? "Saving…" : "Save project"}</button><button type="button" className="crm-button-secondary" onClick={onCancel}>Cancel</button></div>
        </fieldset></form>
    </ContentEditor>;
}

export function ProjectsScreen() {
    const {items, loading, saving, error, notice, load, mutate, setError} = useContentManager<AdminProject>("/api/admin/projects", "projects", "project");
    const [editor, setEditor] = useState<AdminProject | "new" | null>(null);
    const [tab, setTab] = useState<"all" | AdminProject["status"]>("all");
    const editing = editor && editor !== "new" ? editor : null;
    const projects = items.filter((item) => tab === "all" || item.status === tab).sort((a, b) => a.sort_order - b.sort_order);
    async function remove(project: AdminProject) {
        if (window.confirm(`Delete ${project.name}? This cannot be undone.`)) await mutate("DELETE", {id: project.id});
    }
    return <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4"><div><h1 className="text-2xl font-semibold">Our projects</h1><p className="mt-2 text-sm text-[var(--crm-muted)]">Manage the projects, screenshots, and links shown in the homepage’s Our work section.</p></div><div className="flex gap-2"><button type="button" disabled={loading || saving || Boolean(editor)} className="crm-button-secondary" onClick={() => void load()}><RefreshCw className="h-4 w-4"/>Refresh</button><button type="button" disabled={saving || Boolean(editor)} className="crm-button-primary" onClick={() => setEditor("new")}><Plus className="h-4 w-4"/>Add project</button></div></div>
        <ContentFeedback error={error} notice={notice}/>
        {editor && <ProjectForm key={editing?.id || "new"} project={editing} saving={saving} onCancel={() => setEditor(null)} onError={setError} onSave={async (payload) => {
            const saved = await mutate(editing ? "PATCH" : "POST", payload);
            if (saved) setTab(payload.status as AdminProject["status"]);
            return saved;
        }}/>}
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter projects">{(["all", "draft", "published", "hidden"] as const).map((status) => <button key={status} type="button" aria-pressed={tab === status} onClick={() => setTab(status)} className={tab === status ? "crm-button-primary" : "crm-button-secondary"}>{status.charAt(0).toUpperCase() + status.slice(1)} ({items.filter((item) => status === "all" || item.status === status).length})</button>)}</div>
        {loading ? <p role="status" className="flex items-center gap-2 text-sm text-[var(--crm-muted)]"><LoaderCircle className="h-4 w-4 animate-spin"/>Loading projects…</p>
            : !projects.length ? <div className="rounded-xl border border-[var(--crm-border)] bg-[var(--crm-surface)] p-10 text-center text-sm text-[var(--crm-muted)]">No projects in this view. Add a project to get started.</div>
                : <div className="grid gap-4 xl:grid-cols-2">{projects.map((project) => <article key={project.id} className="min-w-0 overflow-hidden rounded-xl border border-[var(--crm-border)] bg-[var(--crm-surface)]">
                    {project.image ? <div className="relative aspect-[16/9] bg-[var(--crm-bg)]"><Image src={project.image} alt={project.imageAlt || project.name} fill unoptimized sizes="(max-width: 1279px) 90vw, 600px" className="object-cover object-top"/></div> : <div className={`flex h-36 items-center gap-3 p-6 text-white ${project.theme === "teal" ? "bg-[#0d363a]" : "bg-[#573a30]"}`}><Monitor className="h-7 w-7 shrink-0"/><p className="break-words text-xl font-semibold">{project.name}</p></div>}
                    <div className="p-6"><div className="flex flex-wrap items-start justify-between gap-2"><h2 className="break-words text-lg font-semibold">{project.name}</h2><span className="rounded-full border border-[var(--crm-border)] px-3 py-1 text-xs capitalize">{project.status}</span></div><p className="mt-2 text-xs text-[var(--crm-muted)]">{project.category} · {project.label} · Order: {project.sort_order}</p><p className="mt-4 whitespace-pre-wrap break-words text-sm leading-7">{project.description}</p>{project.href && <a href={project.href} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-1 text-sm hover:underline">Visit project<ArrowUpRight className="h-4 w-4"/></a>}
                        <div className="mt-6 flex flex-wrap gap-2"><button type="button" disabled={saving || Boolean(editor)} className="crm-button-secondary" onClick={() => setEditor(project)}><Pencil className="h-4 w-4"/>Edit</button>{project.status !== "published" && <button type="button" disabled={saving || Boolean(editor)} className="crm-button-primary" onClick={() => void mutate("PATCH", {id: project.id, status: "published"})}>Publish</button>}{project.status !== "hidden" && <button type="button" disabled={saving || Boolean(editor)} className="crm-button-secondary" onClick={() => void mutate("PATCH", {id: project.id, status: "hidden"})}><EyeOff className="h-4 w-4"/>Hide</button>}<button type="button" disabled={saving || Boolean(editor)} className="crm-button-secondary" onClick={() => void remove(project)}><Trash2 className="h-4 w-4"/>Delete</button></div>
                    </div>
                </article>)}</div>}
        <p className="text-xs text-[var(--crm-muted)]">Showing up to 200 projects. Only published projects appear on the homepage.</p>
    </div>;
}
