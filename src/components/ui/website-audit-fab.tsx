"use client";

import emailjs from "@emailjs/browser";
import {AnimatePresence, motion} from "motion/react";
import Link from "next/link";
import {useEffect, useMemo, useState} from "react";
import toast from "react-hot-toast";
import {
    ArrowRight,
    Gauge,
    Globe,
    LoaderCircle,
    Mail,
    Search,
    Sparkles,
    WandSparkles,
    X,
} from "lucide-react";
import {getLocalizedPath, SiteLocale} from "@/lib/site-locale";

type ScoreKey = "performance" | "seo" | "ux";

interface AuditIssue {
    id: string;
    title: string;
    detail: string;
}

interface AuditReport {
    url: string;
    analyzedAt: string;
    scores: {
        performance: number;
        seo: number;
        ux: number;
        accessibility: number;
        bestPractices: number;
    };
    metrics: {
        largestContentfulPaint: string;
        cumulativeLayoutShift: string;
        totalBlockingTime: string;
        speedIndex: string;
    };
    performanceIssues: AuditIssue[];
    seoIssues: AuditIssue[];
    uxIssues: AuditIssue[];
    narrative: {
        headline: string;
        summary: string;
        performanceTakeaway: string;
        seoTakeaway: string;
        uxTakeaway: string;
        nextSteps: string[];
        ctaLabel: string;
    };
    aiEnhanced: boolean;
}

const loadingMessages = [
    "Running PageSpeed and technical checks...",
    "Turning Lighthouse output into a usable audit...",
    "Preparing the fixes that matter most...",
    "Packaging the audit summary for email delivery...",
];

const EMAILJS_SERVICE_ID = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || "default_service";
const EMAILJS_PUBLIC_KEY = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;
const EMAILJS_AUDIT_TEMPLATE_ID = process.env.NEXT_PUBLIC_EMAILJS_AUDIT_TEMPLATE_ID || "template_1c1pps9";

export function WebsiteAuditFab({locale}: { locale: SiteLocale }) {
    const [isOpen, setIsOpen] = useState(false);
    const [visitorName, setVisitorName] = useState("");
    const [visitorEmail, setVisitorEmail] = useState("");
    const [websiteUrl, setWebsiteUrl] = useState("");
    const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
    const [errorMessage, setErrorMessage] = useState("");
    const [report, setReport] = useState<AuditReport | null>(null);
    const [loadingIndex, setLoadingIndex] = useState(0);
    const [deliveryStatus, setDeliveryStatus] = useState<"idle" | "sending" | "sent" | "failed">("idle");
    const [deliveryMessage, setDeliveryMessage] = useState("");

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        return () => {
            document.body.style.overflow = previousOverflow;
        };
    }, [isOpen]);

    useEffect(() => {
        if (status !== "loading") {
            return;
        }

        const interval = window.setInterval(() => {
            setLoadingIndex((current) => (current + 1) % loadingMessages.length);
        }, 1200);

        return () => window.clearInterval(interval);
    }, [status]);

    const scoreCards = useMemo(() => {
        if (!report) {
            return [] as Array<{ key: ScoreKey; label: string; value: number }>;
        }

        return [
            {key: "performance", label: "Performance", value: report.scores.performance},
            {key: "seo", label: "SEO", value: report.scores.seo},
            {key: "ux", label: "UX Health", value: report.scores.ux},
        ];
    }, [report]);

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (!visitorEmail.trim()) {
            setErrorMessage("Enter your email address to unlock the audit.");
            setStatus("error");
            return;
        }

        if (!websiteUrl.trim()) {
            setErrorMessage("Enter a website URL to generate the audit.");
            setStatus("error");
            return;
        }

        if (!EMAILJS_PUBLIC_KEY || !EMAILJS_AUDIT_TEMPLATE_ID) {
            setErrorMessage("Audit email delivery is not configured yet. Add the EmailJS audit template and public key.");
            setStatus("error");
            return;
        }

        setStatus("loading");
        setErrorMessage("");
        setLoadingIndex(0);
        setDeliveryStatus("idle");
        setDeliveryMessage("");

        const startedAt = Date.now();

        try {
            const response = await fetch("/api/website-audit", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({url: websiteUrl}),
            });

            const payload = await response.json();
            const remainingDelay = Math.max(0, 2200 - (Date.now() - startedAt));

            if (remainingDelay > 0) {
                await new Promise((resolve) => window.setTimeout(resolve, remainingDelay));
            }

            if (!response.ok) {
                throw new Error(payload?.error ?? "Audit failed.");
            }

            const normalizedUrl = payload?.normalizedUrl ?? websiteUrl;
            const nextReport = payload?.report ?? null;

            if (!nextReport) {
                throw new Error("Audit report was empty.");
            }

            setWebsiteUrl(normalizedUrl);
            setReport(nextReport);
            setDeliveryStatus("sending");

            try {
                await sendAuditEmail({
                    email: visitorEmail,
                    name: visitorName,
                    report: nextReport,
                    website: normalizedUrl,
                });
                setDeliveryStatus("sent");
                setDeliveryMessage(`Audit summary sent to ${visitorEmail}.`);
                toast.success(`Audit sent to ${visitorEmail}`);
            } catch (error) {
                console.error("Audit EmailJS delivery failed", error);
                setDeliveryStatus("failed");
                setDeliveryMessage("The audit is ready here, but the email copy could not be sent.");
                toast.error("Audit email could not be sent.");
            }

            setStatus("done");
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : "Audit failed.");
            setStatus("error");
        }
    }

    function resetAudit() {
        setStatus("idle");
        setErrorMessage("");
        setReport(null);
        setDeliveryStatus("idle");
        setDeliveryMessage("");
    }

    return (
        <>
            <motion.button
                type="button"
                className="audit-fab"
                initial={{opacity: 0, y: 24}}
                animate={{opacity: 1, y: 0}}
                transition={{duration: 0.55, ease: [0.22, 1, 0.36, 1]}}
                whileHover={{y: -4, scale: 1.01}}
                whileTap={{scale: 0.98}}
                onClick={() => setIsOpen(true)}
            >
                <span className="audit-fab-pulse"/>
                <Gauge className="h-4.5 w-4.5"/>
                <span className="hidden sm:inline">Free website audit</span>
                <span className="sm:hidden">Audit</span>
            </motion.button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <motion.button
                            type="button"
                            aria-label="Close website audit"
                            className="fixed inset-0 z-[75] bg-black/45 backdrop-blur-[3px]"
                            initial={{opacity: 0}}
                            animate={{opacity: 1}}
                            exit={{opacity: 0}}
                            onClick={() => setIsOpen(false)}
                        />

                        <motion.aside
                            className="audit-sheet"
                            initial={{opacity: 0, y: 28, scale: 0.98}}
                            animate={{opacity: 1, y: 0, scale: 1}}
                            exit={{opacity: 0, y: 24, scale: 0.98}}
                            transition={{duration: 0.32, ease: [0.22, 1, 0.36, 1]}}
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="website-audit-title"
                        >
                            <div className="flex h-full flex-col overflow-hidden">
                                <div className="flex items-start justify-between border-b border-black/8 px-5 py-5 dark:border-white/8 sm:px-6">
                                    <div className="max-w-sm">
                                        <p className="section-kicker !px-3 !py-1.5">
                                            <Sparkles className="h-3.5 w-3.5"/>
                                            Free audit
                                        </p>
                                        <h2 id="website-audit-title" className="mt-4 text-2xl font-semibold text-foreground">
                                            Enter your email and website to unlock a fast audit.
                                        </h2>
                                        <p className="mt-2 text-sm leading-6 text-foreground/70">
                                            Performance, SEO, and UX signals pulled into one practical report you can act on and send to your inbox.
                                        </p>
                                    </div>

                                    <button
                                        type="button"
                                        className="theme-toggle h-10 w-10"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        <X className="h-4.5 w-4.5"/>
                                    </button>
                                </div>

                                <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6">
                                    {(status === "idle" || status === "error") && (
                                        <div className="space-y-5">
                                            <form className="space-y-4" onSubmit={handleSubmit}>
                                                <div className="grid gap-3 sm:grid-cols-2">
                                                    <div>
                                                        <label className="block text-sm font-medium text-foreground" htmlFor="audit-name">
                                                            Name
                                                        </label>
                                                        <input
                                                            id="audit-name"
                                                            type="text"
                                                            placeholder="Your name"
                                                            value={visitorName}
                                                            onChange={(event) => setVisitorName(event.target.value)}
                                                            className="mt-2 h-13 w-full rounded-full border border-black/10 bg-white/82 px-5 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10 dark:border-white/10 dark:bg-white/[0.05]"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-foreground" htmlFor="audit-email">
                                                            Email
                                                        </label>
                                                        <input
                                                            id="audit-email"
                                                            type="email"
                                                            placeholder="you@company.com"
                                                            value={visitorEmail}
                                                            onChange={(event) => setVisitorEmail(event.target.value)}
                                                            className="mt-2 h-13 w-full rounded-full border border-black/10 bg-white/82 px-5 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10 dark:border-white/10 dark:bg-white/[0.05]"
                                                            required
                                                        />
                                                    </div>
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-foreground" htmlFor="audit-url">
                                                        Enter your website
                                                    </label>
                                                </div>
                                                <div className="flex flex-col gap-3 sm:flex-row">
                                                    <input
                                                        id="audit-url"
                                                        type="url"
                                                        placeholder="yourwebsite.com"
                                                        value={websiteUrl}
                                                        onChange={(event) => setWebsiteUrl(event.target.value)}
                                                        className="h-13 flex-1 rounded-full border border-black/10 bg-white/82 px-5 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10 dark:border-white/10 dark:bg-white/[0.05]"
                                                    />
                                                    <button type="submit" className="button-primary h-13 px-6">
                                                        Analyze
                                                        <ArrowRight className="h-4 w-4"/>
                                                    </button>
                                                </div>
                                            </form>

                                            {status === "error" && (
                                                <div className="rounded-[1.2rem] border border-destructive/20 bg-destructive/8 px-4 py-3 text-sm text-destructive">
                                                    {errorMessage}
                                                </div>
                                            )}

                                            <div className="grid gap-3 sm:grid-cols-3">
                                                <div className="audit-score-card">
                                                    <Gauge className="h-5 w-5 text-primary"/>
                                                    <p className="mt-3 text-sm font-semibold text-foreground">Performance score</p>
                                                    <p className="mt-2 text-sm leading-6 text-foreground/68">
                                                        Catch speed bottlenecks, render delays, and weak Core Web Vitals.
                                                    </p>
                                                </div>
                                                <div className="audit-score-card">
                                                    <Search className="h-5 w-5 text-accent"/>
                                                    <p className="mt-3 text-sm font-semibold text-foreground">SEO issues</p>
                                                    <p className="mt-2 text-sm leading-6 text-foreground/68">
                                                        Surface structural, metadata, and crawlability gaps that weaken rankings.
                                                    </p>
                                                </div>
                                                <div className="audit-score-card">
                                                    <WandSparkles className="h-5 w-5 text-primary"/>
                                                    <p className="mt-3 text-sm font-semibold text-foreground">UX friction</p>
                                                    <p className="mt-2 text-sm leading-6 text-foreground/68">
                                                        Flag the trust, clarity, and accessibility issues holding conversions back.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {status === "loading" && (
                                        <div className="flex h-full min-h-[24rem] flex-col items-center justify-center text-center">
                                            <div className="flex h-16 w-16 items-center justify-center rounded-full border border-primary/15 bg-primary/10 text-primary">
                                                <LoaderCircle className="h-7 w-7 animate-spin"/>
                                            </div>
                                            <h3 className="mt-6 text-2xl font-semibold text-foreground">
                                                Auditing your website
                                            </h3>
                                            <p className="mt-3 max-w-sm text-sm leading-6 text-foreground/70">
                                                {loadingMessages[loadingIndex]}
                                            </p>
                                            <div className="mt-7 grid w-full max-w-md gap-3">
                                                {[
                                                    "Checking Lighthouse performance signals",
                                                    "Reviewing SEO and page structure issues",
                                                    "Building a report you can turn into action",
                                                ].map((step) => (
                                                    <div
                                                        key={step}
                                                        className="audit-issue-card flex items-center gap-3 text-left"
                                                    >
                                                        <span className="h-2.5 w-2.5 rounded-full bg-accent"/>
                                                        <span className="text-sm text-foreground/72">{step}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {status === "done" && report && (
                                        <div className="space-y-5">
                                            <div className="rounded-[1.6rem] border border-black/10 bg-white/80 p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.05]">
                                                <div className="flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.18em] text-foreground/60">
                                                    <span className="feature-chip !rounded-full !px-3 !py-1">
                                                        <Globe className="h-3.5 w-3.5"/>
                                                        {report.url.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                                                    </span>
                                                    {deliveryStatus === "sent" && (
                                                        <span className="feature-chip !rounded-full !px-3 !py-1">
                                                            <Mail className="h-3.5 w-3.5"/>
                                                            Sent to {visitorEmail}
                                                        </span>
                                                    )}
                                                    {report.aiEnhanced && (
                                                        <span className="feature-chip !rounded-full !px-3 !py-1">
                                                            <WandSparkles className="h-3.5 w-3.5"/>
                                                            AI-enhanced summary
                                                        </span>
                                                    )}
                                                </div>
                                                <h3 className="mt-4 text-2xl font-semibold text-foreground">
                                                    {report.narrative.headline}
                                                </h3>
                                                <p className="mt-3 text-sm leading-6 text-foreground/72">
                                                    {report.narrative.summary}
                                                </p>
                                                {deliveryMessage && (
                                                    <div className={`mt-4 rounded-[1.15rem] px-4 py-3 text-sm ${
                                                        deliveryStatus === "failed"
                                                            ? "border border-amber-500/25 bg-amber-500/10 text-amber-700 dark:text-amber-300"
                                                            : "border border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                                                    }`}>
                                                        {deliveryMessage}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="grid gap-3 sm:grid-cols-3">
                                                {scoreCards.map((card) => (
                                                    <div key={card.key} className="audit-score-card">
                                                        <div className="flex items-end justify-between gap-3">
                                                            <p className="text-sm font-semibold text-foreground">{card.label}</p>
                                                            <span className="text-3xl font-semibold text-foreground">{card.value}</span>
                                                        </div>
                                                        <div className="mt-4 h-2 rounded-full bg-black/6 dark:bg-white/8">
                                                            <div
                                                                className={`h-full rounded-full ${scoreBarClassName(card.value)}`}
                                                                style={{width: `${card.value}%`}}
                                                            />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="grid gap-3 sm:grid-cols-2">
                                                <div className="audit-score-card">
                                                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground/55">
                                                        Key metrics
                                                    </p>
                                                    <div className="mt-4 grid gap-3 text-sm">
                                                        <MetricRow label="Largest Contentful Paint" value={report.metrics.largestContentfulPaint}/>
                                                        <MetricRow label="Total Blocking Time" value={report.metrics.totalBlockingTime}/>
                                                        <MetricRow label="Speed Index" value={report.metrics.speedIndex}/>
                                                        <MetricRow label="Cumulative Layout Shift" value={report.metrics.cumulativeLayoutShift}/>
                                                    </div>
                                                </div>

                                                <div className="audit-score-card">
                                                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground/55">
                                                        Smart takeaways
                                                    </p>
                                                    <div className="mt-4 space-y-3 text-sm leading-6 text-foreground/72">
                                                        <p><span className="font-semibold text-foreground">Performance:</span> {report.narrative.performanceTakeaway}</p>
                                                        <p><span className="font-semibold text-foreground">SEO:</span> {report.narrative.seoTakeaway}</p>
                                                        <p><span className="font-semibold text-foreground">UX:</span> {report.narrative.uxTakeaway}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <IssueGroup
                                                title="Performance issues"
                                                items={report.performanceIssues}
                                                emptyState="No major performance issues were flagged in the top findings."
                                            />

                                            <IssueGroup
                                                title="SEO issues"
                                                items={report.seoIssues}
                                                emptyState="No major SEO issues were flagged in the top findings."
                                            />

                                            <IssueGroup
                                                title="UX issues"
                                                items={report.uxIssues}
                                                emptyState="No major UX issues were flagged in the top findings."
                                            />

                                            <div className="rounded-[1.5rem] border border-black/10 bg-[linear-gradient(180deg,rgba(13,92,99,0.08),rgba(214,106,69,0.08))] p-5 dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(88,183,179,0.08),rgba(238,141,108,0.08))]">
                                                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground/55">
                                                    Next steps
                                                </p>
                                                <div className="mt-4 space-y-3">
                                                    {report.narrative.nextSteps.map((step) => (
                                                        <div key={step} className="flex gap-3 text-sm leading-6 text-foreground/75">
                                                            <span className="mt-2 h-2 w-2 rounded-full bg-accent"/>
                                                            <span>{step}</span>
                                                        </div>
                                                    ))}
                                                </div>

                                                <div className="mt-5 flex flex-wrap gap-3">
                                                    <Link
                                                        href={getLocalizedPath(locale, "contact")}
                                                        className="button-primary"
                                                        onClick={() => setIsOpen(false)}
                                                    >
                                                        {report.narrative.ctaLabel} → Book free call
                                                        <ArrowRight className="h-4 w-4"/>
                                                    </Link>
                                                    <button type="button" className="button-secondary" onClick={resetAudit}>
                                                        Run another audit
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}

async function sendAuditEmail({
    name,
    email,
    website,
    report,
}: {
    name: string;
    email: string;
    website: string;
    report: AuditReport;
}) {
    if (!EMAILJS_PUBLIC_KEY) {
        throw new Error("EmailJS public key is missing.");
    }

    await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_AUDIT_TEMPLATE_ID,
        {
            name: name.trim() || "Website visitor",
            email,
            website,
            time: new Date(report.analyzedAt).toLocaleString(),
            performance_score: String(report.scores.performance),
            seo_issues: summarizeIssues(report.seoIssues, "No major SEO issues were flagged."),
            ux_issues: summarizeIssues(report.uxIssues, "No major UX issues were flagged."),
            additional_notes: buildAdditionalNotes(report),
        },
        {
            publicKey: EMAILJS_PUBLIC_KEY,
        },
    );
}

function summarizeIssues(items: AuditIssue[], fallback: string) {
    if (items.length === 0) {
        return fallback;
    }

    return items
        .slice(0, 3)
        .map((item) => item.title)
        .join(", ");
}

function buildAdditionalNotes(report: AuditReport) {
    const nextSteps = report.narrative.nextSteps.slice(0, 3).join(" | ");
    return `${report.narrative.summary} Next steps: ${nextSteps}`;
}

function MetricRow({label, value}: { label: string; value: string }) {
    return (
        <div className="flex items-center justify-between gap-4 border-b border-black/8 pb-2 last:border-b-0 last:pb-0 dark:border-white/8">
            <span className="text-foreground/65">{label}</span>
            <span className="font-semibold text-foreground">{value}</span>
        </div>
    );
}

function IssueGroup({
    title,
    items,
    emptyState,
}: {
    title: string;
    items: AuditIssue[];
    emptyState: string;
}) {
    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-foreground">{title}</h3>
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground/50">
                    {items.length} flagged
                </span>
            </div>
            {items.length > 0 ? (
                <div className="grid gap-3">
                    {items.map((item) => (
                        <div key={item.id} className="audit-issue-card">
                            <p className="text-sm font-semibold text-foreground">{item.title}</p>
                            <p className="mt-2 text-sm leading-6 text-foreground/68">{item.detail}</p>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="audit-issue-card text-sm leading-6 text-foreground/65">
                    {emptyState}
                </div>
            )}
        </div>
    );
}

function scoreBarClassName(value: number) {
    if (value >= 90) {
        return "bg-emerald-500";
    }

    if (value >= 70) {
        return "bg-amber-500";
    }

    return "bg-rose-500";
}
