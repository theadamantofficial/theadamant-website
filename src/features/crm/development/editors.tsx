"use client";

import {FormEvent, ReactNode, useEffect, useRef, useState} from "react";
import {Loader2, Upload, X} from "lucide-react";
import {FormField} from "@/components/admin/admin-ui";
import {crmFetch} from "@/features/crm/api";
import {hasDeveloperCapability, hasQaCapability} from "@/features/crm/permissions";
import {PRIORITIES, ROLE_LABELS} from "@/features/crm/constants";
import {DevIssue, DevMember, DevProject, ProjectMember, QaSheet, PROJECT_STAGES, SEVERITIES, STAGE_LABELS} from "./types";

export type SaveRecord = (action: string, payload: Record<string, unknown>) => Promise<void>;
export function EditorDialog({title, children, onClose}: {title: string; children: ReactNode; onClose: () => void}) {
    const dialog = useRef<HTMLDialogElement>(null);
    useEffect(() => { const node = dialog.current; node?.showModal(); return () => node?.close(); }, []);
    return <dialog ref={dialog} onCancel={(event) => {event.preventDefault(); onClose();}} className="crm-app m-auto max-h-[90dvh] w-[calc(100%-2rem)] max-w-3xl overflow-y-auto rounded-xl border border-[var(--crm-border)] bg-[var(--crm-surface)] p-0 text-[var(--crm-text)] shadow-2xl backdrop:bg-black/50">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[var(--crm-border)] bg-[var(--crm-surface)] px-6 py-4"><h2 className="text-base font-semibold">{title}</h2><button type="button" className="crm-icon-button" aria-label="Close editor" onClick={onClose}><X className="h-4 w-4"/></button></div>
        <div className="p-6">{children}</div>
    </dialog>;
}
function SaveFooter({busy, error, label = "Save changes"}: {busy: boolean; error: string; label?: string}) {
    return <div className="space-y-3 border-t border-[var(--crm-border)] pt-4">{error ? <p role="alert" className="text-sm text-rose-600">{error}</p> : null}<div className="flex items-center justify-between gap-4"><span className="text-[11px] text-[var(--crm-muted)]">Saved securely to your internal workspace</span><button disabled={busy} className="crm-button-primary">{busy ? <Loader2 className="h-4 w-4 animate-spin"/> : null}{busy ? "Saving…" : label}</button></div></div>;
}
function useSave(onSave: SaveRecord, action: string) {
    const [busy,setBusy] = useState(false);
    const [error,setError] = useState("");
    const submit = async (event: FormEvent, payload: Record<string,unknown>) => {
        event.preventDefault(); if (busy) return; setBusy(true); setError("");
        try { await onSave(action,payload); } catch (e) { setError(e instanceof Error ? e.message : "Could not save changes."); } finally { setBusy(false); }
    };
    return {busy,error,submit};
}

export function ProjectEditor({project, members, assignments, onSave}: {project?: DevProject; members: DevMember[]; assignments: ProjectMember[]; onSave: SaveRecord}) {
    const [selected,setSelected] = useState<ProjectMember[]>(assignments);
    const {busy,error,submit} = useSave(onSave,"project");
    return <form className="space-y-5" onSubmit={(event) => {
        const form = new FormData(event.currentTarget);
        void submit(event,{...(project ? {id:project.id,updated_at:project.updated_at} : {}),name:form.get("name"),description:form.get("description"),status:form.get("status"),priority:form.get("priority"),target_date:form.get("target_date"),repository_url:form.get("repository_url"),members:selected});
    }}>
        <fieldset disabled={busy} className="space-y-5">
            <FormField label="Project name" required><input name="name" required maxLength={160} defaultValue={project?.name} placeholder="e.g. Customer portal v2" className="crm-control w-full" autoFocus/></FormField>
            <FormField label="Scope and milestones"><textarea name="description" maxLength={12000} rows={3} defaultValue={project?.description} placeholder="What are we building, and what does success look like?" className="crm-control w-full"/></FormField>
            <div className="grid gap-4 sm:grid-cols-3"><FormField label="Stage"><select name="status" defaultValue={project?.status || "backlog"} className="crm-control w-full">{PROJECT_STAGES.map(s => <option key={s} value={s}>{STAGE_LABELS[s]}</option>)}</select></FormField><FormField label="Priority"><select name="priority" defaultValue={project?.priority || "medium"} className="crm-control w-full">{PRIORITIES.map(p => <option key={p}>{p}</option>)}</select></FormField><FormField label="Target date"><input name="target_date" type="date" defaultValue={project?.target_date || ""} className="crm-control w-full"/></FormField></div>
            <FormField label="Repository" hint="Link to the project's Bitbucket, GitHub, or GitLab repository."><input name="repository_url" type="url" pattern="https://.*" maxLength={2000} defaultValue={project?.repository_url} placeholder="https://bitbucket.org/workspace/repository" className="crm-control w-full"/></FormField>
            <section><h3 className="mb-1 text-sm font-semibold">Project team</h3><p className="mb-3 text-xs text-[var(--crm-muted)]">Assign development, testing, or both. QA access applies only to assigned projects.</p><div className="max-h-64 divide-y divide-[var(--crm-border)] overflow-y-auto rounded-lg border border-[var(--crm-border)]">
                {members.filter(m => m.active).map(member => {
                    const assigned = selected.find(m => m.user_id === member.id);
                    return <div key={member.id} className="flex items-center justify-between gap-4 p-3"><div className="min-w-0"><p className="truncate text-xs font-medium">{member.full_name || member.email}</p><p className="text-[10px] text-[var(--crm-muted)]">{ROLE_LABELS[member.role]}</p></div><select aria-label={`Responsibility for ${member.full_name || member.email}`} value={assigned?.responsibility || ""} className="crm-control w-40" onChange={event => setSelected(current => [...current.filter(m => m.user_id !== member.id),...(event.target.value ? [{user_id:member.id,responsibility:event.target.value as ProjectMember["responsibility"]}] : [])])}><option value="">Not assigned</option>{hasDeveloperCapability(member.role) ? <option value="developer">Developer</option> : null}{hasQaCapability(member.role) ? <option value="qa">QA</option> : null}{hasDeveloperCapability(member.role) && hasQaCapability(member.role) ? <option value="developer_qa">Developer + QA</option> : null}</select></div>;
                })}
                {!members.some(m => m.active) ? <p className="p-4 text-xs text-[var(--crm-muted)]">Assign development roles in Team to add project members.</p> : null}
            </div></section>
        </fieldset><SaveFooter busy={busy} error={error} label={project ? "Save project" : "Create project"}/>
    </form>;
}

export function SheetEditor({sheet,projectId,onSave}: {sheet?: QaSheet; projectId: string; onSave: SaveRecord}) {
    const {busy,error,submit} = useSave(onSave,"sheet");
    return <form className="space-y-5" onSubmit={event => {
        const form = new FormData(event.currentTarget);
        void submit(event,{...(sheet ? {id:sheet.id,updated_at:sheet.updated_at} : {}),project_id:projectId,title:form.get("title"),environment:form.get("environment"),build:form.get("build"),status:form.get("status")});
    }}><fieldset disabled={busy} className="space-y-4"><FormField label="QA sheet name" required><input name="title" required maxLength={160} defaultValue={sheet?.title} placeholder="e.g. Checkout · regression round 1" className="crm-control w-full" autoFocus/></FormField><FormField label="Testing environment"><input name="environment" maxLength={2000} defaultValue={sheet?.environment} placeholder="Staging · Chrome 128 · macOS / Android" className="crm-control w-full"/></FormField><FormField label="Build / version"><input name="build" maxLength={200} defaultValue={sheet?.build} placeholder="v2.4.0 / commit reference" className="crm-control w-full"/></FormField><FormField label="Testing status" hint="Completed means the testing round is finished; individual issues keep their own verification status."><select name="status" defaultValue={sheet?.status || "draft"} className="crm-control w-full"><option value="draft">Draft</option><option value="testing">Testing</option><option value="completed">Completed</option></select></FormField></fieldset><SaveFooter busy={busy} error={error} label={sheet ? "Save QA sheet" : "Create QA sheet"}/></form>;
}

export function EvidenceImage({path,alt}: {path: string; alt: string}) {
    const [failed,setFailed] = useState(false);
    const url = `/api/admin/development/media?path=${encodeURIComponent(path)}`;
    if (failed) return <p className="text-xs text-rose-600">Screenshot unavailable. Refresh to retry.</p>;
    return <a href={url} target="_blank" rel="noreferrer" className="block overflow-hidden rounded-lg border border-[var(--crm-border)] bg-[var(--crm-subtle)]">
        {/* Private images must pass through the authenticated endpoint, without the public image optimizer. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={url} alt={alt} className="max-h-60 w-full object-contain" loading="lazy" onError={() => setFailed(true)}/>
    </a>;
}
function EvidenceUpload({projectId,label,value,onChange,onBusy}: {projectId: string; label: string; value: string; onChange: (path: string) => void; onBusy: (busy: boolean) => void}) {
    const [busy,setBusy] = useState(false);
    const [error,setError] = useState("");
    return <div className="space-y-2">{value ? <EvidenceImage key={value} path={value} alt={`${label} screenshot`}/> : null}<label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-[var(--crm-border)] p-4 text-xs text-[var(--crm-muted)]">{busy ? <Loader2 className="h-4 w-4 animate-spin"/> : <Upload className="h-4 w-4"/>}{busy ? "Uploading…" : `${value ? "Replace" : "Add"} ${label.toLowerCase()} screenshot`}<input type="file" accept="image/png,image/jpeg,image/webp" disabled={busy} className="sr-only" onChange={async event => {
        const file = event.target.files?.[0]; event.target.value=""; if (!file) return;
        if (file.size > 8 * 1024 * 1024) {setError("Choose an image up to 8 MB."); return;}
        setBusy(true); onBusy(true); setError("");
        try {const form = new FormData(); form.set("project_id",projectId); form.set("file",file); const result = await crmFetch<{path:string}>("/api/admin/development/media",{method:"POST",body:form}); onChange(result.path);}
        catch (e) {setError(e instanceof Error ? e.message : "Upload failed.");}
        finally {setBusy(false); onBusy(false);}
    }}/></label><p className="text-[10px] text-[var(--crm-muted)]">PNG, JPEG or WebP · up to 8 MB · project members only</p>{error ? <p role="alert" className="text-xs text-rose-600">{error}</p> : null}</div>;
}

export function IssueEditor({issue,projectId,sheet,members,onSave}: {issue?: DevIssue; projectId: string; sheet?: QaSheet; members: DevMember[]; onSave: SaveRecord}) {
    const {busy,error,submit} = useSave(onSave,"issue");
    const [actual,setActual] = useState(issue?.actual_image || "");
    const [expected,setExpected] = useState(issue?.expected_image || "");
    const [actualBusy,setActualBusy] = useState(false);
    const [expectedBusy,setExpectedBusy] = useState(false);
    const [imageError,setImageError] = useState("");
    return <form className="space-y-5" onSubmit={event => {
        event.preventDefault(); if (actualBusy || expectedBusy) return;
        if (sheet && (!actual || !expected)) {setImageError("Add an actual and an expected screenshot before saving this QA issue.");return;}
        const form = new FormData(event.currentTarget);
        void submit(event,{...(issue ? {id:issue.id,updated_at:issue.updated_at} : {}),project_id:projectId,sheet_id:sheet?.id || null,title:form.get("title"),kind:form.get("kind"),priority:form.get("priority"),severity:form.get("severity"),assigned_to:form.get("assigned_to") || null,actual_result:form.get("actual_result"),expected_result:form.get("expected_result"),steps:form.get("steps"),environment:form.get("environment"),actual_image:actual || null,expected_image:expected || null});
    }}><fieldset disabled={busy} className="space-y-5">
        {sheet ? <p className="rounded-lg bg-[#0d5c63]/10 px-3 py-2 text-xs text-[#0d5c63]">QA sheet · {sheet.title}</p> : null}
        <FormField label="Issue / work item" required><input name="title" required maxLength={200} defaultValue={issue?.title} className="crm-control w-full" placeholder="Describe the issue in one sentence" autoFocus/></FormField>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4"><FormField label="Type"><select name="kind" defaultValue={issue?.kind || (sheet ? "bug" : "task")} className="crm-control w-full">{["bug","task","feature"].map(k => <option key={k}>{k}</option>)}</select></FormField><FormField label="Severity"><select name="severity" defaultValue={issue?.severity || "minor"} className="crm-control w-full">{SEVERITIES.map(k => <option key={k}>{k}</option>)}</select></FormField><FormField label="Priority"><select name="priority" defaultValue={issue?.priority || "medium"} className="crm-control w-full">{PRIORITIES.map(k => <option key={k}>{k}</option>)}</select></FormField><FormField label="Developer"><select name="assigned_to" defaultValue={issue?.assigned_to || ""} className="crm-control w-full"><option value="">Unassigned</option>{members.map(m => <option key={m.id} value={m.id}>{m.full_name || m.email}</option>)}</select></FormField></div>
        <div className="grid gap-5 sm:grid-cols-2"><section className="space-y-3 rounded-xl border border-[var(--crm-border)] p-4"><FormField label="Actual result · what happens now" required={Boolean(sheet)}><textarea name="actual_result" required={Boolean(sheet)} maxLength={12000} rows={5} defaultValue={issue?.actual_result} placeholder="What do you see currently?" className="crm-control w-full"/></FormField>{sheet ? <EvidenceUpload projectId={projectId} label="Actual" value={actual} onChange={setActual} onBusy={setActualBusy}/> : null}</section><section className="space-y-3 rounded-xl border border-[var(--crm-border)] p-4"><FormField label="Expected result · what should happen" required={Boolean(sheet)}><textarea name="expected_result" required={Boolean(sheet)} maxLength={12000} rows={5} defaultValue={issue?.expected_result} placeholder="Describe the correct behavior or acceptance criteria." className="crm-control w-full"/></FormField>{sheet ? <EvidenceUpload projectId={projectId} label="Expected" value={expected} onChange={setExpected} onBusy={setExpectedBusy}/> : null}</section></div>
        <FormField label="Steps to reproduce / implementation notes"><textarea name="steps" rows={3} maxLength={12000} defaultValue={issue?.steps} placeholder="1. Open…&#10;2. Click…&#10;3. Observe…" className="crm-control w-full"/></FormField><FormField label="Environment / affected version"><input name="environment" maxLength={2000} defaultValue={issue?.environment || sheet?.environment} placeholder="Browser, device, OS, build" className="crm-control w-full"/></FormField>
    </fieldset><SaveFooter busy={busy || actualBusy || expectedBusy} error={error || imageError} label={issue ? "Save issue" : "Create issue"}/></form>;
}
