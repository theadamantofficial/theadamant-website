import {MEDIUM_URL} from "@/lib/blog-config";

export interface MediumPost {
    title: string;
    link: string;
    guid: string;
    publishedAt: string;
    excerpt: string;
    categories: string[];
    thumbnailUrl: string | null;
}

const MEDIUM_FEED_URL = `${MEDIUM_URL}/feed`;

export async function fetchMediumPosts(limit = 6): Promise<MediumPost[]> {
    try {
        const response = await fetch(MEDIUM_FEED_URL, {
            headers: {
                Accept: "application/rss+xml, text/xml;q=0.9, application/xml;q=0.8",
            },
            next: {
                revalidate: 60 * 30,
            },
        });

        if (!response.ok) {
            return [];
        }

        const xml = await response.text();
        return parseMediumFeed(xml).slice(0, limit);
    } catch {
        return [];
    }
}

function parseMediumFeed(xml: string) {
    const itemBlocks = xml.match(/<item>([\s\S]*?)<\/item>/g) ?? [];

    return itemBlocks.map((item) => {
        const title = cleanText(extractTag(item, "title"));
        const link = cleanText(extractTag(item, "link"));
        const guid = cleanText(extractTag(item, "guid")) || link;
        const publishedAt = cleanText(extractTag(item, "pubDate"));
        const description = extractTag(item, "description");
        const content = extractTag(item, "content:encoded");
        const categories = extractAllTags(item, "category").map(cleanText).filter(Boolean);
        const html = content || description;

        return {
            title,
            link,
            guid,
            publishedAt,
            excerpt: buildExcerpt(html),
            categories,
            thumbnailUrl: extractImageUrl(html),
        } satisfies MediumPost;
    }).filter((post) => post.title && post.link);
}

function extractTag(block: string, tagName: string) {
    const escapedTag = tagName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const match = block.match(new RegExp(`<${escapedTag}(?: [^>]*)?>([\\s\\S]*?)<\\/${escapedTag}>`, "i"));
    return match?.[1] ?? "";
}

function extractAllTags(block: string, tagName: string) {
    const escapedTag = tagName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return [...block.matchAll(new RegExp(`<${escapedTag}(?: [^>]*)?>([\\s\\S]*?)<\\/${escapedTag}>`, "gi"))]
        .map((match) => match[1] ?? "");
}

function cleanText(value: string) {
    return decodeEntities(stripCdata(value).replace(/<!\[CDATA\[|\]\]>/g, "").trim());
}

function stripCdata(value: string) {
    return value.replace(/^<!\[CDATA\[/, "").replace(/\]\]>$/, "");
}

function stripHtml(value: string) {
    return decodeEntities(
        stripCdata(value)
            .replace(/<figure[\s\S]*?<\/figure>/gi, " ")
            .replace(/<[^>]+>/g, " ")
            .replace(/\s+/g, " ")
            .trim(),
    );
}

function buildExcerpt(html: string) {
    const text = stripHtml(html);
    if (text.length <= 180) {
        return text;
    }

    return `${text.slice(0, 177).trim()}...`;
}

function extractImageUrl(html: string) {
    const match = stripCdata(html).match(/<img[^>]+src="([^"]+)"/i);
    return match?.[1] ?? null;
}

function decodeEntities(value: string) {
    return value
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, "\"")
        .replace(/&#39;/g, "'")
        .replace(/&#x27;/g, "'");
}
