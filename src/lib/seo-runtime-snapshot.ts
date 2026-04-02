export interface SeoRuntimeSnapshot {
    requestedUrl: string;
    finalUrl: string;
    status: number;
    title: string | null;
    description: string | null;
    canonical: string | null;
    h1: string[];
    h2: string[];
    ogTitle: string | null;
    ogDescription: string | null;
    robots: string | null;
    schemaCount: number;
    wordCount: number;
}

const MAX_HTML_LENGTH = 180_000;

export async function fetchSeoRuntimeSnapshot(url: string) {
    try {
        const response = await fetch(url, {
            headers: {
                "User-Agent": "TheAdamantSEOAI/1.0 (+https://theadamant.com)",
                Accept: "text/html,application/xhtml+xml",
            },
            signal: AbortSignal.timeout(6500),
            cache: "no-store",
            redirect: "follow",
        });

        const html = (await response.text()).slice(0, MAX_HTML_LENGTH);

        return {
            requestedUrl: url,
            finalUrl: response.url || url,
            status: response.status,
            title: extractTagContent(html, "title"),
            description: extractMetaContent(html, "description"),
            canonical: extractCanonical(html),
            h1: extractHeadingContents(html, "h1"),
            h2: extractHeadingContents(html, "h2"),
            ogTitle: extractMetaProperty(html, "og:title"),
            ogDescription: extractMetaProperty(html, "og:description"),
            robots: extractMetaContent(html, "robots"),
            schemaCount: (html.match(/application\/ld\+json/gi) || []).length,
            wordCount: countWords(stripHtml(html)),
        } satisfies SeoRuntimeSnapshot;
    } catch {
        return null;
    }
}

export function formatSeoRuntimeSnapshot(snapshot: SeoRuntimeSnapshot | null) {
    if (!snapshot) {
        return "No live website snapshot was available.";
    }

    return [
        `Requested URL: ${snapshot.requestedUrl}`,
        `Final URL: ${snapshot.finalUrl}`,
        `HTTP status: ${snapshot.status}`,
        `Title: ${snapshot.title || "missing"}`,
        `Meta description: ${snapshot.description || "missing"}`,
        `Canonical: ${snapshot.canonical || "missing"}`,
        `Robots: ${snapshot.robots || "missing"}`,
        `Open Graph title: ${snapshot.ogTitle || "missing"}`,
        `Open Graph description: ${snapshot.ogDescription || "missing"}`,
        `H1 count: ${snapshot.h1.length}`,
        `H1 values: ${snapshot.h1.join(" | ") || "missing"}`,
        `H2 count: ${snapshot.h2.length}`,
        `Top H2 values: ${snapshot.h2.slice(0, 6).join(" | ") || "missing"}`,
        `Schema script count: ${snapshot.schemaCount}`,
        `Approximate text word count: ${snapshot.wordCount}`,
    ].join("\n");
}

function extractTagContent(html: string, tagName: string) {
    const match = html.match(new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)<\\/${tagName}>`, "i"));
    return decodeHtml(match?.[1]?.trim() || null);
}

function extractMetaContent(html: string, name: string) {
    const match = html.match(new RegExp(`<meta[^>]+name=["']${escapeRegExp(name)}["'][^>]+content=["']([^"']+)["'][^>]*>`, "i"))
        || html.match(new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+name=["']${escapeRegExp(name)}["'][^>]*>`, "i"));

    return decodeHtml(match?.[1]?.trim() || null);
}

function extractMetaProperty(html: string, property: string) {
    const match = html.match(new RegExp(`<meta[^>]+property=["']${escapeRegExp(property)}["'][^>]+content=["']([^"']+)["'][^>]*>`, "i"))
        || html.match(new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+property=["']${escapeRegExp(property)}["'][^>]*>`, "i"));

    return decodeHtml(match?.[1]?.trim() || null);
}

function extractCanonical(html: string) {
    const match = html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["'][^>]*>/i)
        || html.match(/<link[^>]+href=["']([^"']+)["'][^>]+rel=["']canonical["'][^>]*>/i);

    return decodeHtml(match?.[1]?.trim() || null);
}

function extractHeadingContents(html: string, tagName: "h1" | "h2") {
    return Array.from(html.matchAll(new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)<\\/${tagName}>`, "gi")))
        .map((match) => decodeHtml(stripHtml(match[1]).trim()))
        .filter((value): value is string => Boolean(value))
        .slice(0, 8);
}

function stripHtml(html: string) {
    return html
        .replace(/<script[\s\S]*?<\/script>/gi, " ")
        .replace(/<style[\s\S]*?<\/style>/gi, " ")
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

function countWords(value: string) {
    if (!value) {
        return 0;
    }

    return value.split(/\s+/).filter(Boolean).length;
}

function decodeHtml(value: string | null) {
    if (!value) {
        return null;
    }

    return value
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'");
}

function escapeRegExp(value: string) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
