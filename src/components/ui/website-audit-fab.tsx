"use client";

import {AnimatePresence, motion} from "motion/react";
import Link from "next/link";
import {Fragment, useEffect, useState, type CSSProperties, type ReactNode} from "react";
import {
    ArrowRight,
    CheckCircle2,
    Gauge,
    Globe,
    Mail,
    Sparkles,
    TriangleAlert,
    X,
} from "lucide-react";
import {LoadingState} from "@/components/ui/branded-loading";
import {loadEmailJs} from "@/lib/load-emailjs";
import {getLocalizedPath, SiteLocale} from "@/lib/site-locale";
import {OpenSeoChatButton} from "@/components/ui/open-seo-chat-button";
import {
    type AuditResult,
    extractMetricFromReportText,
    formatAuditReport,
    normalizeAuditScore,
} from "@/lib/website-audit";
import {OPEN_WEBSITE_AUDIT_EVENT} from "@/lib/website-audit-events";

type AuditStatus = "idle" | "loading" | "success" | "error";

interface AuditApiResponse {
    error?: string;
    message?: string;
    result?: AuditResult;
}

type NotificationStatus = "idle" | "sent" | "failed";

const LOADING_MESSAGE = "Analyzing your website...";
const SUCCESS_MESSAGE = "Report sent to your email";
const GENERIC_ERROR_MESSAGE = "We could not start the audit right now. Please try again.";
const DEFAULT_EMAILJS_AUDIT_TEMPLATE_ID = "template_1c1pps9";
const EMAILJS_SERVICE_ID = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || "default_service";
const EMAILJS_PUBLIC_KEY = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;
const EMAILJS_AUDIT_TEMPLATE_ID = process.env.NEXT_PUBLIC_EMAILJS_AUDIT_TEMPLATE_ID
    || DEFAULT_EMAILJS_AUDIT_TEMPLATE_ID;
const AUDIT_NOTIFICATION_EMAIL = process.env.NEXT_PUBLIC_AUDIT_NOTIFICATION_EMAIL || "admin@theadamant.com";

export function WebsiteAuditFab({locale}: { locale: SiteLocale }) {
    const [isOpen, setIsOpen] = useState(false);
    const [websiteUrl, setWebsiteUrl] = useState("");
    const [visitorEmail, setVisitorEmail] = useState("");
    const [status, setStatus] = useState<AuditStatus>("idle");
    const [notificationStatus, setNotificationStatus] = useState<NotificationStatus>("idle");
    const [errorMessage, setErrorMessage] = useState("");
    const [result, setResult] = useState<AuditResult | null>(null);

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
        const handleOpen = () => setIsOpen(true);

        window.addEventListener(OPEN_WEBSITE_AUDIT_EVENT, handleOpen);
        return () => window.removeEventListener(OPEN_WEBSITE_AUDIT_EVENT, handleOpen);
    }, []);

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const normalizedUrl = normalizeWebsiteUrl(websiteUrl);
        if (!normalizedUrl) {
            setStatus("error");
            setErrorMessage("Enter a valid website URL.");
            return;
        }

        const normalizedEmail = normalizeEmail(visitorEmail);
        if (!normalizedEmail) {
            setStatus("error");
            setErrorMessage("Enter a valid email address.");
            return;
        }

        setStatus("loading");
        setErrorMessage("");
        setResult(null);
        setNotificationStatus("idle");

        try {
            const response = await fetch("/api/website-audit", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    url: normalizedUrl,
                    email: normalizedEmail,
                }),
            });

            const payload = await parseApiResponse(response);

            if (!response.ok) {
                throw new Error(payload?.error ?? GENERIC_ERROR_MESSAGE);
            }

            setWebsiteUrl(normalizedUrl);
            setVisitorEmail(normalizedEmail);
            const nextResult = payload?.result ?? {url: normalizedUrl};
            setResult(nextResult);

            try {
                await sendAuditEmail({
                    email: normalizedEmail,
                    result: nextResult,
                });
                setNotificationStatus("sent");
            } catch (notificationError) {
                console.error("Audit EmailJS delivery failed", notificationError);
                setNotificationStatus("failed");
            }

            setStatus("success");
        } catch (error) {
            setStatus("error");
            setErrorMessage(error instanceof Error ? error.message : GENERIC_ERROR_MESSAGE);
        }
    }

    function resetAudit() {
        setStatus("idle");
        setErrorMessage("");
        setResult(null);
        setNotificationStatus("idle");
    }

    const reportText = formatAuditReport(result?.report);
    const displayScore = result?.score ?? extractMetricFromReportText(reportText, "performance");
    const seoScore = result?.seoScore ?? extractMetricFromReportText(reportText, "seo");
    const issues = result?.issues ?? [];
    const improvements = result?.improvements ?? [];

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
                                            Website audit
                                        </p>
                                        <h2 id="website-audit-title" className="mt-4 text-2xl font-semibold text-foreground">
                                            Send your URL and email to trigger the audit workflow.
                                        </h2>
                                        <p className="mt-2 text-sm leading-6 text-foreground/70">
                                            We will run the automation, email the report, and show any returned summary here.
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
                                    {status === "loading" ? (
                                        <div className="flex h-full min-h-[24rem] items-center justify-center">
                                            <LoadingState
                                                size="md"
                                                title={LOADING_MESSAGE}
                                                description="This can take a moment while the workflow runs, scores the site, and prepares your audit summary."
                                            />
                                        </div>
                                    ) : (
                                        <div className="space-y-5">
                                            <form className="space-y-4" onSubmit={handleSubmit}>
                                                <div>
                                                    <label className="block text-sm font-medium text-foreground" htmlFor="audit-url">
                                                        Website URL
                                                    </label>
                                                    <input
                                                        id="audit-url"
                                                        type="url"
                                                        inputMode="url"
                                                        placeholder="https://yourwebsite.com"
                                                        value={websiteUrl}
                                                        onChange={(event) => setWebsiteUrl(event.target.value)}
                                                        className="mt-2 h-13 w-full rounded-full border border-black/10 bg-white/82 px-5 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10 dark:border-white/10 dark:bg-white/[0.05]"
                                                        required
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-foreground" htmlFor="audit-email">
                                                        Email
                                                    </label>
                                                    <input
                                                        id="audit-email"
                                                        type="email"
                                                        inputMode="email"
                                                        placeholder="you@company.com"
                                                        value={visitorEmail}
                                                        onChange={(event) => setVisitorEmail(event.target.value)}
                                                        className="mt-2 h-13 w-full rounded-full border border-black/10 bg-white/82 px-5 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10 dark:border-white/10 dark:bg-white/[0.05]"
                                                        required
                                                    />
                                                </div>

                                                <button type="submit" className="button-primary h-13 w-full px-6">
                                                    Audit My Website
                                                    <ArrowRight className="h-4 w-4"/>
                                                </button>
                                                <OpenSeoChatButton
                                                    className="h-13 w-full px-6"
                                                    detail={{
                                                        websiteUrl,
                                                        issue: "I need quick help improving SEO and conversions.",
                                                    }}
                                                >
                                                    Quick solve with SEO AI
                                                </OpenSeoChatButton>
                                            </form>

                                            {status === "error" && (
                                                <div
                                                    aria-live="polite"
                                                    className="rounded-[1.2rem] border border-destructive/20 bg-destructive/8 px-4 py-3 text-sm text-destructive"
                                                >
                                                    {errorMessage}
                                                </div>
                                            )}

                                            {status === "success" && (
                                                <div
                                                    aria-live="polite"
                                                    className="flex items-center gap-3 rounded-[1.2rem] border border-emerald-500/25 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-300"
                                                >
                                                    <CheckCircle2 className="h-5 w-5"/>
                                                    <span>{SUCCESS_MESSAGE}</span>
                                                </div>
                                            )}

                                            {notificationStatus === "failed" && (
                                                <div
                                                    aria-live="polite"
                                                    className="rounded-[1.2rem] border border-amber-500/25 bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-300"
                                                >
                                                    The audit completed, but the EmailJS notification could not be sent.
                                                </div>
                                            )}

                                            <div className="grid gap-3 sm:grid-cols-3">
                                                <div className="audit-score-card">
                                                    <Globe className="h-5 w-5 text-primary"/>
                                                    <p className="mt-3 text-sm font-semibold text-foreground">URL + email intake</p>
                                                    <p className="mt-2 text-sm leading-6 text-foreground/68">
                                                        Collect a valid website and destination email before triggering the workflow.
                                                    </p>
                                                </div>
                                                <div className="audit-score-card">
                                                    <Gauge className="h-5 w-5 text-accent"/>
                                                    <p className="mt-3 text-sm font-semibold text-foreground">Automated analysis</p>
                                                    <p className="mt-2 text-sm leading-6 text-foreground/68">
                                                        Fire the audit request and wait for the generated report to finish processing.
                                                    </p>
                                                </div>
                                                <div className="audit-score-card">
                                                    <Mail className="h-5 w-5 text-primary"/>
                                                    <p className="mt-3 text-sm font-semibold text-foreground">Email delivery</p>
                                                    <p className="mt-2 text-sm leading-6 text-foreground/68">
                                                        Confirm the workflow was accepted and show any summary returned from the API.
                                                    </p>
                                                </div>
                                            </div>

                                            {result && (
                                                <div className="space-y-4">
                                                    <div className="rounded-[1.6rem] border border-black/10 bg-white/80 p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.05]">
                                                        <div className="flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.18em] text-foreground/60">
                                                            <span className="feature-chip !rounded-full !px-3 !py-1">
                                                                <Globe className="h-3.5 w-3.5"/>
                                                                {stripProtocol(result.url)}
                                                            </span>
                                                            {displayScore !== undefined && (
                                                                <span className="feature-chip !rounded-full !px-3 !py-1">
                                                                    <Gauge className="h-3.5 w-3.5"/>
                                                                    Score {String(displayScore)}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <h3 className="mt-4 text-2xl font-semibold text-foreground">
                                                            Audit response
                                                        </h3>
                                                        <p className="mt-3 text-sm leading-6 text-foreground/72">
                                                            Your request has been forwarded to the automation workflow. Any returned response is shown below.
                                                        </p>
                                                    </div>

                                                    <div className="grid gap-3">
                                                        <ResultCard
                                                            icon={<Globe className="h-5 w-5 text-primary"/>}
                                                            label="URL"
                                                            value={result.url}
                                                        />

                                                        <div className="grid gap-3 min-[540px]:grid-cols-2">
                                                            <ScoreMeterCard
                                                                label="Performance"
                                                                score={displayScore}
                                                                accent="var(--color-accent)"
                                                                helper="Load speed and runtime efficiency"
                                                            />
                                                            <ScoreMeterCard
                                                                label="SEO"
                                                                score={seoScore}
                                                                accent="var(--color-primary)"
                                                                helper={result.seoScoreSource === "estimated"
                                                                    ? "Estimated from the returned audit summary"
                                                                    : "Search visibility and technical SEO"}
                                                            />
                                                        </div>
                                                    </div>

                                                    {(issues.length > 0 || improvements.length > 0) && (
                                                        <div className="grid gap-3 min-[540px]:grid-cols-2">
                                                            <InsightListCard
                                                                icon={<TriangleAlert className="h-5 w-5 text-accent"/>}
                                                                title="Top issues"
                                                                emptyLabel="The audit summary did not include a structured issue list."
                                                                items={issues}
                                                            />
                                                            <InsightListCard
                                                                icon={<CheckCircle2 className="h-5 w-5 text-primary"/>}
                                                                title="Recommended fixes"
                                                                emptyLabel="The audit summary did not include explicit recommendations."
                                                                items={improvements}
                                                            />
                                                        </div>
                                                    )}

                                                    <div className="audit-issue-card">
                                                        <div className="flex items-center gap-3">
                                                            <TriangleAlert className="h-5 w-5 text-primary"/>
                                                            <p className="text-sm font-semibold text-foreground">Report</p>
                                                        </div>
                                                        <div className="mt-3 break-words text-sm leading-6 text-foreground/72">
                                                            {reportText ? renderFormattedReport(reportText) : "The webhook did not return a report body in the response."}
                                                        </div>
                                                    </div>

                                                    <div className="flex flex-wrap gap-3">
                                                        <button type="button" className="button-secondary" onClick={resetAudit}>
                                                            Run another audit
                                                        </button>
                                                        <OpenSeoChatButton
                                                            detail={{
                                                                websiteUrl: result.url,
                                                                issue: issues[0] || improvements[0] || "Help me fix the issues from this audit.",
                                                            }}
                                                        >
                                                            Ask SEO AI to fix this
                                                        </OpenSeoChatButton>
                                                        <Link
                                                            href={getLocalizedPath(locale, "contact")}
                                                            className="button-primary"
                                                            onClick={() => setIsOpen(false)}
                                                        >
                                                            Talk to us about fixes
                                                            <ArrowRight className="h-4 w-4"/>
                                                        </Link>
                                                    </div>
                                                </div>
                                            )}
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

async function parseApiResponse(response: Response) {
    try {
        return await response.json() as AuditApiResponse;
    } catch {
        return null;
    }
}

async function sendAuditEmail({
    email,
    result,
}: {
    email: string;
    result: AuditResult;
}) {
    if (!EMAILJS_PUBLIC_KEY) {
        throw new Error("EmailJS public key is not configured.");
    }

    if (!EMAILJS_AUDIT_TEMPLATE_ID) {
        throw new Error("EmailJS template id is not configured.");
    }

    const emailjs = await loadEmailJs();
    const reportText = formatAuditReport(result.report) ?? "No report body was returned.";
    const score = result.score ?? extractMetricFromReportText(reportText, "performance") ?? "Not returned";
    const seoIssues = result.issues?.join("\n") || "Audit request completed via n8n workflow.";

    await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_AUDIT_TEMPLATE_ID,
        {
            name: buildAuditRecipientName(email),
            email,
            to_email: email,
            lead_email: email,
            submitted_email: email,
            reply_to: AUDIT_NOTIFICATION_EMAIL,
            website: result.url,
            time: new Date().toLocaleString(),
            performance_score: String(score),
            performance_report: buildAuditNotificationNotes(reportText),
            seo_issues: buildAuditNotificationNotes(seoIssues),
            ux_issues: "Review the generated report in additional notes.",
            additional_notes: buildAuditNotificationNotes(reportText),
        },
        {
            publicKey: EMAILJS_PUBLIC_KEY,
        },
    );
}

function normalizeWebsiteUrl(input: string) {
    const trimmed = input.trim();
    if (!trimmed) {
        return null;
    }

    const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;

    try {
        const parsed = new URL(withProtocol);

        if (!["http:", "https:"].includes(parsed.protocol)) {
            return null;
        }

        return parsed.toString();
    } catch {
        return null;
    }
}

function normalizeEmail(input: string) {
    const trimmed = input.trim().toLowerCase();
    if (!trimmed) {
        return null;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(trimmed) ? trimmed : null;
}

function stripProtocol(url: string) {
    return url.replace(/^https?:\/\//, "").replace(/\/$/, "");
}

function buildAuditNotificationNotes(reportText: string) {
    return reportText.length > 1800 ? `${reportText.slice(0, 1800)}...` : reportText;
}

function buildAuditRecipientName(email: string) {
    const localPart = email.split("@")[0] ?? "there";
    const cleaned = localPart.replace(/[._-]+/g, " ").trim();

    if (!cleaned) {
        return "there";
    }

    return cleaned.replace(/\b\w/g, (character) => character.toUpperCase());
}

function renderFormattedReport(reportText: string): ReactNode {
    const blocks = reportText
        .split(/\n\s*\n/)
        .map((block) => block.trim())
        .filter(Boolean);

    return (
        <div className="space-y-4">
            {blocks.map((block, index) => renderReportBlock(block, index))}
        </div>
    );
}

function renderReportBlock(block: string, index: number): ReactNode {
    const lines = block
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean);

    if (lines.length === 1 && /^\*\*.+\*\*$/.test(lines[0])) {
        return (
            <h4 key={index} className="text-base font-semibold text-foreground">
                {renderInlineFormatting(lines[0].replace(/^\*\*|\*\*$/g, ""))}
            </h4>
        );
    }

    if (lines.every((line) => /^\d+\.\s+/.test(line))) {
        return (
            <ol key={index} className="list-decimal space-y-3 pl-5">
                {lines.map((line) => (
                    <li key={line}>{renderInlineFormatting(line.replace(/^\d+\.\s+/, ""))}</li>
                ))}
            </ol>
        );
    }

    if (lines.every((line) => /^[-*]\s+/.test(line))) {
        return (
            <ul key={index} className="list-disc space-y-2 pl-5">
                {lines.map((line) => (
                    <li key={line}>{renderInlineFormatting(line.replace(/^[-*]\s+/, ""))}</li>
                ))}
            </ul>
        );
    }

    return (
        <div key={index} className="space-y-2">
            {lines.map((line) => (
                <p key={line}>{renderInlineFormatting(line)}</p>
            ))}
        </div>
    );
}

function renderInlineFormatting(text: string): ReactNode {
    const segments = text.split(/(\*\*.*?\*\*)/g).filter(Boolean);

    return segments.map((segment, index) => {
        if (/^\*\*.*\*\*$/.test(segment)) {
            return (
                <strong key={`${segment}-${index}`} className="font-semibold text-foreground">
                    {segment.slice(2, -2)}
                </strong>
            );
        }

        return <Fragment key={`${segment}-${index}`}>{segment}</Fragment>;
    });
}

function ResultCard({
    icon,
    label,
    value,
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
}) {
    return (
        <div className="audit-score-card">
            {icon}
            <p className="mt-3 text-sm font-semibold text-foreground">{label}</p>
            <p className="mt-2 break-words text-sm leading-6 text-foreground/68">{value}</p>
        </div>
    );
}

function ScoreMeterCard({
    label,
    score,
    accent,
    helper,
}: {
    label: string;
    score?: number | string;
    accent: string;
    helper: string;
}) {
    const normalizedScore = normalizeAuditScore(score);
    const meterStyle = {
        background: normalizedScore === null
            ? "linear-gradient(135deg, rgba(13,92,99,0.16), rgba(214,106,69,0.12))"
            : `conic-gradient(${accent} ${normalizedScore}%, rgba(125,125,125,0.14) ${normalizedScore}% 100%)`,
    } satisfies CSSProperties;

    return (
        <div className="audit-score-card">
            <div className="flex flex-col gap-4 min-[420px]:flex-row min-[420px]:items-start min-[420px]:justify-between">
                <div>
                    <p className="text-sm font-semibold text-foreground">{label}</p>
                    <p className="mt-2 text-xs leading-5 text-foreground/60">{helper}</p>
                </div>
                <div className="audit-meter-ring self-start min-[420px]:self-auto" style={meterStyle}>
                    <div className="audit-meter-core">
                        <span className="text-2xl font-semibold text-foreground">
                            {normalizedScore ?? "--"}
                        </span>
                        <span className="text-[0.65rem] uppercase tracking-[0.16em] text-foreground/54">
                            {normalizedScore === null ? "Pending" : "Score"}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}

function InsightListCard({
    icon,
    title,
    emptyLabel,
    items,
}: {
    icon: ReactNode;
    title: string;
    emptyLabel: string;
    items: string[];
}) {
    return (
        <div className="audit-issue-card">
            <div className="flex items-center gap-3">
                {icon}
                <p className="text-sm font-semibold text-foreground">{title}</p>
            </div>
            {items.length > 0 ? (
                <ul className="mt-4 space-y-3 text-sm leading-6 text-foreground/72">
                    {items.map((item) => (
                        <li key={item} className="rounded-2xl border border-black/8 bg-white/70 px-4 py-3 dark:border-white/10 dark:bg-white/[0.03]">
                            {item}
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="mt-3 text-sm leading-6 text-foreground/68">{emptyLabel}</p>
            )}
        </div>
    );
}
