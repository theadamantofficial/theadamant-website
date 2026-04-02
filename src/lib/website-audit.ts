export interface AuditResult {
    url: string;
    score?: number | string;
    seoScore?: number | string;
    seoScoreSource?: "reported" | "estimated";
    mobileScore?: number | string;
    browserScore?: number | string;
    report?: unknown;
    issues?: string[];
    improvements?: string[];
    summary?: string;
}

type JsonRecord = Record<string, unknown>;
type AuditMetric = "performance" | "seo" | "mobile" | "browser";

export function extractAuditResult(payload: unknown, fallbackUrl: string): AuditResult {
    const candidates = collectCandidates(payload);
    const url = findStringValue(candidates, ["url", "website", "websiteUrl", "auditedUrl"]) ?? fallbackUrl;
    const report = findReportValue(payload, candidates);
    const reportText = formatAuditReport(report);
    const score = findMetricScore(candidates, "performance", reportText);
    const reportedSeoScore = findMetricScore(candidates, "seo", reportText);
    const mobileScore = findMetricScore(candidates, "mobile", reportText);
    const browserScore = findMetricScore(candidates, "browser", reportText);
    const issues = extractIssueList(candidates, reportText, "problems");
    const improvements = extractIssueList(candidates, reportText, "improvements");
    const summary = extractSummary(reportText);
    const seoScore = reportedSeoScore ?? estimateSeoScore(reportText, score, issues);

    return {
        url,
        ...(score !== undefined ? {score} : {}),
        ...(seoScore !== undefined ? {seoScore} : {}),
        ...(seoScore !== undefined ? {seoScoreSource: reportedSeoScore !== undefined ? "reported" : "estimated"} : {}),
        ...(mobileScore !== undefined ? {mobileScore} : {}),
        ...(browserScore !== undefined ? {browserScore} : {}),
        ...(report !== undefined ? {report} : {}),
        ...(issues.length > 0 ? {issues} : {}),
        ...(improvements.length > 0 ? {improvements} : {}),
        ...(summary ? {summary} : {}),
    };
}

export function formatAuditReport(report: unknown): string | null {
    if (typeof report === "string") {
        return report.trim() || null;
    }

    if (typeof report === "number") {
        return String(report);
    }

    if (Array.isArray(report)) {
        const formattedItems = report
            .map((item) => formatAuditReport(item))
            .filter((item): item is string => Boolean(item));

        return formattedItems.join("\n\n") || null;
    }

    if (isRecord(report)) {
        for (const key of ["summary", "content", "text", "analysis", "details"]) {
            const value = report[key];
            const formattedValue = formatAuditReport(value);

            if (formattedValue) {
                return formattedValue;
            }
        }

        return JSON.stringify(report, null, 2);
    }

    return null;
}

export function extractMetricFromReportText(reportText: string | null, metric: AuditMetric) {
    if (!reportText) {
        return undefined;
    }

    const patternsByMetric: Record<AuditMetric, RegExp[]> = {
        performance: [
            /\bperformance score of\s+(\d{1,3})\b/i,
            /\bperformance[:\s]+(\d{1,3})\b/i,
            /\bpagespeed score[:\s]+(\d{1,3})\b/i,
        ],
        seo: [
            /\bseo score of\s+(\d{1,3})\b/i,
            /\bseo[:\s]+(\d{1,3})\b/i,
            /\bsearch visibility score[:\s]+(\d{1,3})\b/i,
        ],
        mobile: [
            /\bmobile score of\s+(\d{1,3})\b/i,
            /\bmobile responsiveness score[:\s]+(\d{1,3})\b/i,
            /\bmobile[:\s]+(\d{1,3})\b/i,
        ],
        browser: [
            /\bbrowser compatibility score[:\s]+(\d{1,3})\b/i,
            /\bcompatibility score[:\s]+(\d{1,3})\b/i,
            /\bbrowser[:\s]+(\d{1,3})\b/i,
        ],
    };

    for (const pattern of patternsByMetric[metric]) {
        const match = reportText.match(pattern);
        if (!match) {
            continue;
        }

        const parsedScore = Number.parseInt(match[1], 10);
        if (!Number.isNaN(parsedScore)) {
            return parsedScore;
        }
    }

    return undefined;
}

export function normalizeAuditScore(score?: number | string | null) {
    if (typeof score === "number" && Number.isFinite(score)) {
        return clampScore(score);
    }

    if (typeof score === "string") {
        const parsed = Number.parseInt(score, 10);
        if (!Number.isNaN(parsed)) {
            return clampScore(parsed);
        }
    }

    return null;
}

function collectCandidates(payload: unknown) {
    const candidates: JsonRecord[] = [];

    if (isRecord(payload)) {
        candidates.push(payload);
    }

    for (const key of ["data", "result", "body", "audit", "metrics"]) {
        if (!isRecord(payload)) {
            continue;
        }

        const nestedValue = payload[key];

        if (isRecord(nestedValue)) {
            candidates.push(nestedValue);
        }
    }

    return candidates;
}

function findStringValue(candidates: JsonRecord[], keys: string[]) {
    for (const candidate of candidates) {
        for (const key of keys) {
            const value = candidate[key];

            if (typeof value === "string" && value.trim()) {
                return value.trim();
            }
        }
    }

    return undefined;
}

function findMetricScore(candidates: JsonRecord[], metric: AuditMetric, reportText: string | null) {
    const keysByMetric: Record<AuditMetric, string[]> = {
        performance: ["score", "performanceScore", "pageSpeedScore", "pagespeedScore", "performance"],
        seo: ["seoScore", "seo_score", "seo", "searchVisibilityScore"],
        mobile: ["mobileScore", "mobile_score", "mobileResponsivenessScore", "mobile"],
        browser: ["browserScore", "browser_score", "browserCompatibilityScore", "compatibilityScore"],
    };

    for (const candidate of candidates) {
        for (const key of keysByMetric[metric]) {
            const value = candidate[key];

            if (typeof value === "number" || typeof value === "string") {
                return value;
            }
        }
    }

    return extractMetricFromReportText(reportText, metric);
}

function findReportValue(payload: unknown, candidates: JsonRecord[]) {
    if (typeof payload === "string" && payload.trim()) {
        return payload.trim();
    }

    for (const candidate of candidates) {
        for (const key of ["report", "summary", "analysis", "details"]) {
            const value = candidate[key];

            if (value !== undefined && value !== null && value !== "") {
                return value;
            }
        }
    }

    return undefined;
}

function extractIssueList(
    candidates: JsonRecord[],
    reportText: string | null,
    section: "problems" | "improvements",
) {
    const keys = section === "problems"
        ? ["issues", "problemAreas", "problems", "findings", "risks", "painPoints"]
        : ["improvements", "recommendations", "opportunities", "fixes", "actions"];

    for (const candidate of candidates) {
        for (const key of keys) {
            const normalized = normalizeStringList(candidate[key]);
            if (normalized.length > 0) {
                return normalized;
            }
        }
    }

    return extractNumberedSection(reportText, section);
}

function normalizeStringList(value: unknown): string[] {
    if (Array.isArray(value)) {
        return value
            .map((item) => {
                if (typeof item === "string") {
                    return item.trim();
                }

                if (isRecord(item)) {
                    for (const key of ["title", "label", "issue", "problem", "recommendation", "text", "description"]) {
                        const nestedValue = item[key];
                        if (typeof nestedValue === "string" && nestedValue.trim()) {
                            return nestedValue.trim();
                        }
                    }
                }

                return "";
            })
            .filter(Boolean);
    }

    if (typeof value === "string" && value.trim()) {
        return value
            .split(/\n+/)
            .map((line) => line.replace(/^[-*\d.:\s]+/, "").trim())
            .filter(Boolean);
    }

    return [];
}

function extractNumberedSection(reportText: string | null, section: "problems" | "improvements") {
    if (!reportText) {
        return [];
    }

    const headingPattern = section === "problems"
        ? /(?:^|\n)\s*(?:\d+\s+)?problems?\s*:\s*\n?([\s\S]*?)(?=\n\s*(?:\d+\s+)?improvements?\s*:|\n\s*$|$)/i
        : /(?:^|\n)\s*(?:\d+\s+)?improvements?\s*:\s*\n?([\s\S]*?)$/i;
    const sectionMatch = reportText.match(headingPattern);

    if (!sectionMatch) {
        return [];
    }

    return sectionMatch[1]
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => /^(\d+\.|[-*])\s+/.test(line))
        .map((line) => line.replace(/^(\d+\.|[-*])\s+/, "").trim())
        .filter(Boolean)
        .slice(0, 6);
}

function extractSummary(reportText: string | null) {
    if (!reportText) {
        return null;
    }

    const normalizedText = reportText.trim();
    const [introBlock] = normalizedText.split(/\n\s*\n/);
    const summary = introBlock
        ?.replace(/^(summary|overview)\s*:\s*/i, "")
        .trim();

    return summary || null;
}

function estimateSeoScore(reportText: string | null, performanceScore?: number | string, issues: string[] = []) {
    const normalizedPerformance = normalizeAuditScore(performanceScore);
    const hasReport = Boolean(reportText);

    if (normalizedPerformance === null && !hasReport) {
        return undefined;
    }

    let nextScore = normalizedPerformance ?? 78;
    const normalizedText = reportText?.toLowerCase() ?? "";

    if (normalizedText.includes("well-organized") || normalizedText.includes("seo-ready") || normalizedText.includes("discoverable")) {
        nextScore += 4;
    }

    for (const issue of issues.map((item) => item.toLowerCase())) {
        if (issue.includes("load")) {
            nextScore -= 6;
        }

        if (issue.includes("mobile")) {
            nextScore -= 5;
        }

        if (issue.includes("browser") || issue.includes("compatibility")) {
            nextScore -= 5;
        }

        if (issue.includes("script") || issue.includes("code")) {
            nextScore -= 3;
        }
    }

    return clampScore(nextScore);
}

function clampScore(score: number) {
    return Math.min(100, Math.max(0, Math.round(score)));
}

function isRecord(value: unknown): value is JsonRecord {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}
