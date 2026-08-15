import type {ReactNode} from "react";
import Link from "next/link";
import {ArrowLeft, FileCheck2, Mail} from "lucide-react";
import {Navbar} from "@/components/layouts/navbar";
import Footer from "@/components/layouts/footer";
import {DEFAULT_SITE_LOCALE} from "@/lib/site-locale";
import {getSiteCopy} from "@/lib/site-copy";

const copy = getSiteCopy(DEFAULT_SITE_LOCALE);

export type LegalSection = {
    id: string;
    title: string;
    content: ReactNode;
};

export default function LegalPage({
    eyebrow,
    title,
    description,
    lastUpdated,
    sections,
}: {
    eyebrow: string;
    title: string;
    description: string;
    lastUpdated: string;
    sections: LegalSection[];
}) {
    return (
        <main className="relative min-h-screen overflow-x-clip">
            <Navbar copy={copy.navbar} locale={DEFAULT_SITE_LOCALE}/>

            <section className="section-shell pb-12 pt-32 sm:pt-36">
                <div className="ambient-orb ambient-orb-left" aria-hidden="true"/>
                <div className="ambient-orb ambient-orb-right" aria-hidden="true"/>

                <Link
                    href="/"
                    className="relative z-10 inline-flex items-center gap-2 text-sm font-semibold text-foreground/65 transition hover:text-foreground"
                >
                    <ArrowLeft className="h-4 w-4"/>
                    Back to Adamant
                </Link>

                <div className="relative z-10 mt-8 max-w-4xl">
                    <p className="section-kicker">
                        <FileCheck2 className="h-4 w-4"/>
                        {eyebrow}
                    </p>
                    <h1 className="mt-6 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                        {title}
                    </h1>
                    <p className="mt-6 max-w-3xl text-base leading-8 text-foreground/72 sm:text-lg">
                        {description}
                    </p>
                    <p className="mt-5 text-sm font-medium text-foreground/55">
                        Last updated: {lastUpdated}
                    </p>
                </div>
            </section>

            <section className="section-shell pb-24">
                <div className="grid items-start gap-8 lg:grid-cols-[17rem_minmax(0,1fr)]">
                    <aside className="glass-panel p-5 lg:sticky lg:top-28" aria-label="On this page">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-foreground/50">
                            On this page
                        </p>
                        <nav className="mt-4" aria-label={`${title} sections`}>
                            <ol className="space-y-1">
                                {sections.map((section, index) => (
                                    <li key={section.id}>
                                        <a
                                            href={`#${section.id}`}
                                            className="flex gap-3 rounded-xl px-3 py-2.5 text-sm leading-5 text-foreground/68 transition hover:bg-black/[0.04] hover:text-foreground dark:hover:bg-white/[0.06]"
                                        >
                                            <span className="font-semibold text-primary">{String(index + 1).padStart(2, "0")}</span>
                                            <span>{section.title}</span>
                                        </a>
                                    </li>
                                ))}
                            </ol>
                        </nav>
                    </aside>

                    <article className="glass-panel px-6 py-8 sm:px-9 sm:py-10">
                        <div className="divide-y divide-black/10 dark:divide-white/10">
                            {sections.map((section, index) => (
                                <section
                                    key={section.id}
                                    id={section.id}
                                    className="scroll-mt-28 py-8 first:pt-0 last:pb-0"
                                    aria-labelledby={`${section.id}-heading`}
                                >
                                    <div className="flex items-start gap-4">
                                        <span className="mt-1 text-xs font-semibold tracking-[0.18em] text-primary">
                                            {String(index + 1).padStart(2, "0")}
                                        </span>
                                        <div className="min-w-0 flex-1">
                                            <h2
                                                id={`${section.id}-heading`}
                                                className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl"
                                            >
                                                {section.title}
                                            </h2>
                                            <div className="legal-copy mt-5 space-y-4 text-sm leading-7 text-foreground/72 sm:text-base sm:leading-8">
                                                {section.content}
                                            </div>
                                        </div>
                                    </div>
                                </section>
                            ))}
                        </div>

                        <div className="mt-10 rounded-[1.5rem] border border-primary/15 bg-primary/[0.07] p-5 sm:p-6">
                            <div className="flex items-start gap-3">
                                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                                    <Mail className="h-4 w-4"/>
                                </span>
                                <div>
                                    <h2 className="text-lg font-semibold text-foreground">Questions about this document?</h2>
                                    <p className="mt-2 text-sm leading-7 text-foreground/68">
                                        Contact JSSS Adamant Technologies Private Limited at{" "}
                                        <a className="font-semibold text-primary underline underline-offset-4" href="mailto:admin@theadamant.com">
                                            admin@theadamant.com
                                        </a>.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </article>
                </div>
            </section>

            <Footer copy={copy.footer} locale={DEFAULT_SITE_LOCALE}/>
        </main>
    );
}
