import {JWT} from "google-auth-library";
import {getCrmServiceClient} from "@/lib/crm/server-client";
import {requestOpenAIJson} from "@/lib/openai";

const SEARCH_CONSOLE_SCOPE = "https://www.googleapis.com/auth/webmasters.readonly";
const MAX_QUERIES = 100;
const TARGET_PAGES = [
    "/",
    "/website-development",
    "/website-development-noida",
    "/website-development-india",
    "/app-development-noida",
    "/digital-marketing-services",
];

type SearchConsoleRow = {
    keys?: string[];
    clicks?: number;
    impressions?: number;
    ctr?: number;
    position?: number;
};

export interface SeoRecommendation {
    keyword: string;
    pagePath: string;
    opportunity: "high" | "medium" | "low";
    reason: string;
    suggestedTitle: string;
    suggestedDescription: string;
    suggestedHeading: string;
    suggestedCopy: string;
}

function getSearchConsoleConfig() {
    const siteUrl = process.env.GOOGLE_SEARCH_CONSOLE_SITE_URL?.trim() || "https://theadamant.com/";
    let credentials: {client_email?: string; private_key?: string} = {};
    try {
        credentials = JSON.parse(process.env.GOOGLE_SEARCH_CONSOLE_SERVICE_ACCOUNT_JSON || "{}") as typeof credentials;
    } catch {
        throw new Error("GOOGLE_SEARCH_CONSOLE_SERVICE_ACCOUNT_JSON must be valid JSON.");
    }
    const email = credentials.client_email;
    const privateKey = credentials.private_key?.replace(/\\n/g, "\n");
    if (!email || !privateKey) throw new Error("Google Search Console service-account credentials are not configured.");
    return {siteUrl, email, privateKey};
}

async function loadSearchConsoleQueries() {
    const config = getSearchConsoleConfig();
    const auth = new JWT({email: config.email, key: config.privateKey, scopes: [SEARCH_CONSOLE_SCOPE]});
    const token = await auth.getAccessToken();
    const accessToken = typeof token === "string" ? token : token?.token;
    if (!accessToken) throw new Error("Google Search Console authentication returned no access token.");
    const end = new Date();
    end.setUTCDate(end.getUTCDate() - 3);
    const start = new Date(end);
    start.setUTCDate(start.getUTCDate() - 28);
    const response = await fetch(
        `https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(config.siteUrl)}/searchAnalytics/query`,
        {
            method: "POST",
            headers: {Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json"},
            body: JSON.stringify({
                startDate: start.toISOString().slice(0, 10),
                endDate: end.toISOString().slice(0, 10),
                dimensions: ["query", "page"],
                rowLimit: MAX_QUERIES,
                dataState: "final",
            }),
            cache: "no-store",
            signal: AbortSignal.timeout(20_000),
        },
    );
    if (!response.ok) throw new Error(`Google Search Console request failed with status ${response.status}.`);
    const payload = await response.json() as {rows?: SearchConsoleRow[]};
    return (payload.rows || []).map((row) => ({
        query: row.keys?.[0] || "",
        page: row.keys?.[1] || "/",
        clicks: row.clicks || 0,
        impressions: row.impressions || 0,
        ctr: row.ctr || 0,
        position: row.position || 0,
    })).filter((row) => row.query);
}

export async function generateSeoRecommendations() {
    const queries = await loadSearchConsoleQueries();
    const result = await requestOpenAIJson<{recommendations?: SeoRecommendation[]}>({
        messages: [
            {
                role: "system",
                content: [
                    "You are an SEO editor for Adamant Technologies, an Indian digital product and growth studio.",
                    "Use only the supplied Google Search Console queries; do not invent search volume or claim trends you cannot verify.",
                    "Return at most 8 recommendations. Prefer existing pages and natural semantic improvements.",
                    "Never recommend keyword stuffing, misleading claims, doorway pages, competitor trademark targeting, or changing brand facts.",
                    "Each recommendation must include keyword, pagePath, opportunity, reason, suggestedTitle, suggestedDescription, suggestedHeading, and suggestedCopy.",
                    "pagePath must be one of the supplied target pages.",
                ].join(" "),
            },
            {
                role: "user",
                content: JSON.stringify({targetPages: TARGET_PAGES, searchConsoleQueries: queries}),
            },
        ],
    });
    const recommendations = (result.recommendations || []).filter((item) => (
        TARGET_PAGES.includes(item.pagePath)
        && item.keyword?.trim()
        && item.suggestedTitle?.trim()
        && item.suggestedDescription?.trim()
        && item.suggestedHeading?.trim()
        && item.suggestedCopy?.trim()
        && ["high", "medium", "low"].includes(item.opportunity)
    )).slice(0, 8);
    if (!recommendations.length) throw new Error("OpenAI returned no valid SEO recommendations.");
    return {recommendations, queryCount: queries.length};
}

export async function saveSeoRecommendations(recommendations: SeoRecommendation[], queryCount: number) {
    const client = getCrmServiceClient();
    const {error} = await client.from("seo_keyword_recommendations").insert(
        recommendations.map((recommendation) => ({
            keyword: recommendation.keyword.trim(),
            page_path: recommendation.pagePath,
            opportunity: recommendation.opportunity,
            reason: recommendation.reason.trim(),
            suggested_title: recommendation.suggestedTitle.trim(),
            suggested_description: recommendation.suggestedDescription.trim(),
            suggested_heading: recommendation.suggestedHeading.trim(),
            suggested_copy: recommendation.suggestedCopy.trim(),
            source: "google_search_console",
            query_count: queryCount,
            status: "pending",
        })),
    );
    if (error) throw new Error(`SEO recommendations could not be saved: ${error.message}`);
}
