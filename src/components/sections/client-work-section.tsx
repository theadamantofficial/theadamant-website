"use client";

import {useEffect, useState} from "react";
import Image from "next/image";
import Link from "next/link";
import {ArrowRight, ArrowUpRight, ExternalLink, ImageOff, Layers3, LoaderCircle, Monitor, Smartphone} from "lucide-react";
import {Reveal} from "@/components/ui/reveal";
import {type ClientWorkProject, type WorkCategory} from "@/content/client-work";
import {getLocalizedPath, type SiteLocale} from "@/lib/site-locale";

function ProjectPreview({project}: {project: ClientWorkProject}) {
    const isTeal = project.theme === "teal";
    const [imageFailed, setImageFailed] = useState(false);
    useEffect(() => setImageFailed(false), [project.image]);
    const Icon = project.category === "Mobile apps" ? Smartphone : Monitor;
    return <div className={`relative overflow-hidden rounded-[1.5rem] border border-black/10 p-4 sm:p-6 ${isTeal ? "bg-[#d6e7e1]" : "bg-[#ede0d2]"}`}>
        <div aria-hidden="true" className={`pointer-events-none absolute inset-0 ${isTeal ? "bg-[radial-gradient(circle_at_100%_0%,rgba(13,92,99,0.18),transparent_65%)]" : "bg-[radial-gradient(circle_at_100%_0%,rgba(181,88,53,0.16),transparent_65%)]"}`}/>
        <div className="relative overflow-hidden rounded-xl border border-black/10 bg-[#fffaf2] shadow-[0_20px_40px_-25px_rgba(0,0,0,0.5)] transition-transform duration-300 group-hover:-translate-y-1 motion-reduce:transform-none">
            <div aria-hidden="true" className="flex h-10 items-center gap-1.5 border-b border-black/8 px-3 sm:px-4">
                <span className="h-2 w-2 rounded-full bg-[#dd8676]"/><span className="h-2 w-2 rounded-full bg-[#dcb972]"/><span className="h-2 w-2 rounded-full bg-[#85b49c]"/>
                <span className="ml-3 min-w-0 flex-1 truncate rounded-md bg-black/5 px-3 py-1 text-center text-[10px] text-[#1d2a28]/65">{project.href ? new URL(project.href).hostname : project.name}</span>
                <Icon className="ml-2 h-3.5 w-3.5 text-[#1d2a28]/50"/>
            </div>
            {project.image && !imageFailed ? <div className="relative aspect-[16/10] bg-white">
                <Image src={project.image} alt={project.imageAlt || `${project.name} website screenshot`} fill unoptimized={project.image.startsWith("https://")} sizes="(max-width: 767px) 85vw, 480px" className="object-cover object-top" onError={() => setImageFailed(true)}/>
            </div> : <div className="flex aspect-[16/10] flex-col items-center justify-center gap-3 bg-[#f6f0e5] px-6 text-center text-[#1d2a28]/65">
                <ImageOff className="h-8 w-8" aria-hidden="true"/>
                <p className="text-sm font-medium">Website preview {imageFailed ? "unavailable" : "coming soon"}</p>
                {project.href && <p className="text-xs">Open the project to explore the live website.</p>}
            </div>}
        </div>
    </div>;
}

function ProjectCard({project}: {project: ClientWorkProject}) {
    return <article className="group glass-panel min-w-0 rounded-[2rem] p-4 sm:p-5">
        {project.href ? <a href={project.href} target="_blank" rel="noopener noreferrer" aria-label={`Visit ${project.name} (opens in a new tab)`} className="block rounded-[1.5rem] outline-offset-4 focus-visible:outline-2 focus-visible:outline-primary"><ProjectPreview project={project}/></a> : <ProjectPreview project={project}/>}
        <div className="px-2 pb-2 pt-6 sm:px-3">
            <div className="flex flex-wrap items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-foreground/60"><span>{project.category}</span><span aria-hidden="true">·</span><span>{project.label}</span></div>
            <div className="mt-3 flex items-center justify-between gap-4"><h3 className="break-words text-2xl font-semibold tracking-tight">{project.name}</h3>{project.href && <a href={project.href} target="_blank" rel="noopener noreferrer" aria-label={`Visit ${project.name} (opens in a new tab)`} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-foreground/15 transition hover:bg-primary hover:text-white"><ArrowUpRight className="h-5 w-5" aria-hidden="true"/></a>}</div>
            <p className="mt-3 text-sm leading-7 text-foreground/70">{project.description}</p>
            <ul className="mt-5 flex flex-wrap gap-2" aria-label="Project highlights">{project.highlights.map((highlight) => <li key={highlight} className="rounded-full border border-foreground/10 bg-background/50 px-3 py-1.5 text-xs text-foreground/70">{highlight}</li>)}</ul>
            {project.href && <a href={project.href} target="_blank" rel="noopener noreferrer" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline hover:underline-offset-4">Visit project <ExternalLink className="h-3.5 w-3.5" aria-hidden="true"/></a>}
        </div>
    </article>;
}

export default function ClientWorkSection({locale}: {locale: SiteLocale}) {
    const [category, setCategory] = useState<WorkCategory | "All work">("All work");
    const [items, setItems] = useState<ClientWorkProject[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState(false);
    useEffect(() => {
        const controller = new AbortController();
        async function load() {
            try {
                const response = await fetch("/api/projects", {signal: controller.signal, cache: "no-store"});
                const data = await response.json();
                if (!response.ok) throw new Error(data.error);
                setItems(data.projects);
            } catch {
                if (!controller.signal.aborted) setLoadError(true);
            } finally {
                if (!controller.signal.aborted) setLoading(false);
            }
        }
        void load();
        return () => controller.abort();
    }, []);
    const categories = [...new Set(items.map((project) => project.category))];
    const projects = items.filter((project) => category === "All work" || project.category === category);

    return <section id="work" className="section-shell scroll-mt-28 py-20 sm:py-24" aria-labelledby="client-work-heading">
        <Reveal>
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                <div className="max-w-2xl"><p className="section-kicker"><Layers3 className="h-4 w-4" aria-hidden="true"/> Our work</p><h2 id="client-work-heading" className="section-title">Ideas turned into<br/><span className="text-primary">digital experiences.</span></h2><p className="section-copy">Explore our websites and digital products. A closer look at the work we bring from first idea to launch.</p></div>
                <Link href={getLocalizedPath(locale, "contact")} className="button-secondary w-fit">Let’s build your project <ArrowUpRight className="h-4 w-4" aria-hidden="true"/></Link>
            </div>
        </Reveal>
        {categories.length > 1 && <div role="group" aria-label="Filter projects by category" className="mt-8 flex flex-wrap gap-2">{(["All work", ...categories] as const).map((item) => <button key={item} type="button" aria-pressed={category === item} onClick={() => setCategory(item)} className={`rounded-full border px-4 py-2.5 text-sm font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${category === item ? "border-primary bg-primary text-white" : "border-foreground/15 bg-background/50 text-foreground/70 hover:border-primary/40 hover:text-primary"}`}>{item}</button>)}</div>}
        <p className="sr-only" role="status">Showing {projects.length} {projects.length === 1 ? "project" : "projects"}{category !== "All work" ? ` in ${category}` : ""}.</p>
        {loading ? <p role="status" className="mt-8 flex items-center gap-2 text-sm text-foreground/65"><LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true"/>Loading projects…</p>
            : projects.length ? <div className="mt-8 grid gap-6 md:grid-cols-2">{projects.map((project) => <ProjectCard key={project.id} project={project}/>)}</div>
                : <div className="glass-panel mt-8 p-8 text-sm leading-7 text-foreground/65">{loadError ? "We couldn’t load our projects right now. Contact us to see examples of our work." : "More project stories are on the way. Contact us for examples relevant to your idea."}</div>}
        <Reveal className="mt-8 flex flex-col gap-5 rounded-[1.5rem] border border-primary/15 bg-primary/5 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
            <div><h3 className="text-lg font-semibold tracking-tight">Have something in mind?</h3><p className="mt-2 text-sm leading-6 text-foreground/65">A website, an app, or a fresh product experience. Tell us what you’re planning.</p></div>
            <Link href={getLocalizedPath(locale, "contact")} className="button-primary w-fit shrink-0">Start a conversation <ArrowRight className="h-4 w-4" aria-hidden="true"/></Link>
        </Reveal>
    </section>;
}
