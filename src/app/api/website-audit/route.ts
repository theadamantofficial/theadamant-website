import {NextRequest, NextResponse} from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ScoreKey = "performance" | "seo" | "ux" | "accessibility" | "bestPractices";
type AuditIssueCategory = "performance" | "seo" | "ux";

interface AuditIssue {
    id: string;
    title: string;
    detail: string;
    category: AuditIssueCategory;
}

interface AuditNarrative {
    headline: string;
    summary: string;
    performanceTakeaway: string;
    seoTakeaway: string;
    uxTakeaway: string;
    nextSteps: string[];
    ctaLabel: string;
}

interface AuditReport {
    url: string;
    analyzedAt: string;
    scores: Record<ScoreKey, number>;
    metrics: {
        largestContentfulPaint: string;
        cumulativeLayoutShift: string;
        totalBlockingTime: string;
        speedIndex: string;
    };
    performanceIssues: AuditIssue[];
    seoIssues: AuditIssue[];
    uxIssues: AuditIssue[];
    narrative: AuditNarrative;
    aiEnhanced: boolean;
}

interface PageSpeedAudit {
    title?: string;
    description?: string;
    displayValue?: string;
    score?: number | null;
    scoreDisplayMode?: string;
}

interface PageSpeedAuditRef {
    id: string;
}

interface PageSpeedCategory {
    score?: number | null;
    auditRefs?: PageSpeedAuditRef[];
}

interface PageSpeedPayload {
    lighthouseResult?: {
        categories?: {
            performance?: PageSpeedCategory;
            seo?: PageSpeedCategory;
            accessibility?: PageSpeedCategory;
            "best-practices"?: PageSpeedCategory;
        };
        audits?: Record<string, PageSpeedAudit>;
    };
}

const PAGE_SPEED_ENDPOINT = "https://www.googleapis.com/pagespeedonline/v5/runPagespeed";
const REQUESTED_CATEGORIES = ["performance", "seo", "accessibility", "best-practices"] as const;
const IGNORED_AUDIT_IDS = new Set([
    "lcp-breakdown-insight",
    "legacy-javascript-insight",
    "network-dependency-tree-insight",
    "valid-source-maps",
    "max-potential-fid",
]);

export async function POST(request: NextRequest) {
    let payload: { url?: string };

    try {
        payload = await request.json();
    } catch {
        return NextResponse.json({error: "Invalid request body."}, {status: 400});
    }

    const normalizedUrl = normalizeWebsiteUrl(payload.url);
    if (!normalizedUrl) {
        return NextResponse.json({error: "Enter a valid website URL to audit."}, {status: 400});
    }

    try {
        const pageSpeedResponse = await fetch(buildPageSpeedUrl(normalizedUrl), {
            headers: {
                Accept: "application/json",
            },
            cache: "no-store",
        });

        if (!pageSpeedResponse.ok) {
            const errorText = await pageSpeedResponse.text();
            const quotaExceeded = pageSpeedResponse.status === 429 || /quota/i.test(errorText);
            return NextResponse.json(
                {
                    error: quotaExceeded
                        ? "PageSpeed quota is unavailable right now. Add GOOGLE_PAGESPEED_API_KEY to use your own free Google quota."
                        : "Could not analyze that website right now.",
                    detail: errorText.slice(0, 240),
                },
                {status: quotaExceeded ? 429 : 502},
            );
        }

        const pageSpeedPayload = await pageSpeedResponse.json() as PageSpeedPayload;
        const report = buildAuditReport(normalizedUrl, pageSpeedPayload);
        const aiNarrative = await generateAiNarrative(report);

        if (aiNarrative) {
            report.narrative = aiNarrative;
            report.aiEnhanced = true;
        }

        return NextResponse.json({
            normalizedUrl,
            report,
        });
    } catch (error) {
        return NextResponse.json(
            {
                error: "The audit service hit an unexpected error.",
                detail: error instanceof Error ? error.message : "Unknown error",
            },
            {status: 500},
        );
    }
}

function buildPageSpeedUrl(url: string) {
    const requestUrl = new URL(PAGE_SPEED_ENDPOINT);
    requestUrl.searchParams.set("url", url);
    requestUrl.searchParams.set("strategy", "mobile");

    for (const category of REQUESTED_CATEGORIES) {
        requestUrl.searchParams.append("category", category);
    }

    if (process.env.GOOGLE_PAGESPEED_API_KEY) {
        requestUrl.searchParams.set("key", process.env.GOOGLE_PAGESPEED_API_KEY);
    }

    return requestUrl;
}

function normalizeWebsiteUrl(input?: string) {
    if (!input) {
        return null;
    }

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

function buildAuditReport(url: string, pageSpeedPayload: PageSpeedPayload): AuditReport {
    const lighthouse = pageSpeedPayload?.lighthouseResult ?? {};
    const categories = lighthouse?.categories ?? {};
    const audits = lighthouse?.audits ?? {};

    const scores = {
        performance: normalizeScore(categories?.performance?.score),
        seo: normalizeScore(categories?.seo?.score),
        accessibility: normalizeScore(categories?.accessibility?.score),
        bestPractices: normalizeScore(categories?.["best-practices"]?.score),
        ux: 0,
    };

    scores.ux = Math.round((scores.accessibility + scores.bestPractices) / 2);

    const performanceIssues = collectCategoryIssues({
        audits,
        auditRefs: categories?.performance?.auditRefs,
        category: "performance",
        maxItems: 4,
    });

    const seoIssues = collectCategoryIssues({
        audits,
        auditRefs: categories?.seo?.auditRefs,
        category: "seo",
        maxItems: 4,
    });

    const uxIssues = [
        ...collectCategoryIssues({
            audits,
            auditRefs: categories?.accessibility?.auditRefs,
            category: "ux",
            maxItems: 2,
        }),
        ...collectCategoryIssues({
            audits,
            auditRefs: categories?.["best-practices"]?.auditRefs,
            category: "ux",
            maxItems: 2,
        }),
    ].slice(0, 4);

    return {
        url,
        analyzedAt: new Date().toISOString(),
        scores,
        metrics: {
            largestContentfulPaint: metricDisplay(audits?.["largest-contentful-paint"]),
            cumulativeLayoutShift: metricDisplay(audits?.["cumulative-layout-shift"]),
            totalBlockingTime: metricDisplay(audits?.["total-blocking-time"]),
            speedIndex: metricDisplay(audits?.["speed-index"]),
        },
        performanceIssues,
        seoIssues,
        uxIssues,
        narrative: buildFallbackNarrative({
            scores,
            performanceIssues,
            seoIssues,
            uxIssues,
        }),
        aiEnhanced: false,
    };
}

function normalizeScore(score?: number | null) {
    if (typeof score !== "number" || Number.isNaN(score)) {
        return 0;
    }

    return Math.round(score * 100);
}

function metricDisplay(audit?: PageSpeedAudit) {
    return audit?.displayValue ?? "Not available";
}

function collectCategoryIssues({
    audits,
    auditRefs,
    category,
    maxItems,
}: {
    audits: Record<string, PageSpeedAudit>;
    auditRefs?: PageSpeedAuditRef[];
    category: AuditIssueCategory;
    maxItems: number;
}) {
    if (!Array.isArray(auditRefs)) {
        return [] as AuditIssue[];
    }

    return auditRefs
        .map((ref) => {
            if (IGNORED_AUDIT_IDS.has(ref.id)) {
                return null;
            }

            const audit = audits?.[ref.id];
            if (!audit || !isFailingAudit(audit)) {
                return null;
            }

            return {
                id: ref.id,
                title: sanitizeText(audit?.title ?? ref.id),
                detail: buildIssueDetail(audit),
                category,
            } satisfies AuditIssue;
        })
        .filter((issue): issue is AuditIssue => Boolean(issue))
        .slice(0, maxItems);
}

function isFailingAudit(audit: PageSpeedAudit) {
    const displayMode = audit?.scoreDisplayMode;
    const score = typeof audit?.score === "number" ? audit.score : null;

    if (displayMode === "notApplicable" || displayMode === "informative" || displayMode === "manual") {
        return false;
    }

    if (displayMode === "error") {
        return true;
    }

    if (score === null) {
        return false;
    }

    return score < 0.9;
}

function buildIssueDetail(audit: PageSpeedAudit) {
    const description = sanitizeText(audit?.description ?? "");
    const displayValue = sanitizeText(audit?.displayValue ?? "");

    if (displayValue && description) {
        return `${displayValue}. ${description}`;
    }

    return displayValue || description || "This area needs attention.";
}

function sanitizeText(text: string) {
    return text
        .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
        .replace(/\s+/g, " ")
        .trim();
}

function buildFallbackNarrative({
    scores,
    performanceIssues,
    seoIssues,
    uxIssues,
}: {
    scores: AuditReport["scores"];
    performanceIssues: AuditIssue[];
    seoIssues: AuditIssue[];
    uxIssues: AuditIssue[];
}): AuditNarrative {
    const weakestArea = [
        {label: "performance", score: scores.performance},
        {label: "SEO", score: scores.seo},
        {label: "UX", score: scores.ux},
    ].sort((left, right) => left.score - right.score)[0];

    return {
        headline: weakestArea.score >= 85
            ? "The site has a solid base, but there is still room to tighten conversion and search signals."
            : `The biggest lift right now is ${weakestArea.label}.`,
        summary: `This audit found practical issues that can affect load speed, search visibility, and trust on the page. Fixing the highest-impact items should make the site feel sharper and easier to rank.`,
        performanceTakeaway: performanceIssues[0]?.title
            ? `${performanceIssues[0].title} is one of the main reasons the page feels heavier than it should.`
            : "Performance can improve by tightening assets, scripts, and render-blocking work.",
        seoTakeaway: seoIssues[0]?.title
            ? `${seoIssues[0].title} is limiting how clearly search engines can understand the page.`
            : "SEO signals can be stronger with better metadata, structure, and content clarity.",
        uxTakeaway: uxIssues[0]?.title
            ? `${uxIssues[0].title} is creating friction in the user experience.`
            : "The page can feel more trustworthy and easier to use with clearer interaction patterns.",
        nextSteps: [
            performanceIssues[0]?.title ? `Fix ${performanceIssues[0].title.toLowerCase()}.` : "Reduce load-time friction above the fold.",
            seoIssues[0]?.title ? `Resolve ${seoIssues[0].title.toLowerCase()}.` : "Strengthen page structure and SEO signals.",
            uxIssues[0]?.title ? `Improve ${uxIssues[0].title.toLowerCase()}.` : "Tighten clarity and conversion paths for users.",
        ],
        ctaLabel: "Fix these issues",
    };
}

async function generateAiNarrative(report: AuditReport) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
        return null;
    }

    const model = process.env.OPENAI_AUDIT_MODEL ?? "gpt-4o-mini";
    const completionResponse = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model,
            response_format: {
                type: "json_object",
            },
            messages: [
                {
                    role: "system",
                    content: "You are a premium website auditor. Return valid JSON only.",
                },
                {
                    role: "user",
                    content: JSON.stringify({
                        task: "Convert this website audit into concise, client-facing insights.",
                        instructions: {
                            tone: "confident, clear, premium, actionable",
                            output: {
                                headline: "short sentence",
                                summary: "2 sentence summary",
                                performanceTakeaway: "1 sentence",
                                seoTakeaway: "1 sentence",
                                uxTakeaway: "1 sentence",
                                nextSteps: ["3 concise action steps"],
                                ctaLabel: "short CTA label",
                            },
                        },
                        audit: report,
                    }),
                },
            ],
        }),
    });

    if (!completionResponse.ok) {
        return null;
    }

    const payload = await completionResponse.json();
    const content = payload?.choices?.[0]?.message?.content;

    if (typeof content !== "string") {
        return null;
    }

    try {
        const parsed = JSON.parse(content);
        if (
            typeof parsed?.headline === "string"
            && typeof parsed?.summary === "string"
            && typeof parsed?.performanceTakeaway === "string"
            && typeof parsed?.seoTakeaway === "string"
            && typeof parsed?.uxTakeaway === "string"
            && Array.isArray(parsed?.nextSteps)
            && typeof parsed?.ctaLabel === "string"
        ) {
            return {
                headline: parsed.headline,
                summary: parsed.summary,
                performanceTakeaway: parsed.performanceTakeaway,
                seoTakeaway: parsed.seoTakeaway,
                uxTakeaway: parsed.uxTakeaway,
                nextSteps: parsed.nextSteps.slice(0, 3).map((step: unknown) => String(step)),
                ctaLabel: parsed.ctaLabel,
            } satisfies AuditNarrative;
        }
    } catch {
        return null;
    }

    return null;
}
