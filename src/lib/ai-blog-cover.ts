import type {InternalBlogPost} from "@/lib/internal-blog";

interface BlogCoverDesign {
    eyebrow: string;
    titleLines: string[];
    accentLabel: string;
    gradientFrom: string;
    gradientTo: string;
    accent: string;
    panel: string;
    ink: string;
}

const DEFAULT_DESIGNS = [
    {
        gradientFrom: "#0f5e66",
        gradientTo: "#16363d",
        accent: "#ee8d6c",
        panel: "rgba(255,255,255,0.12)",
        ink: "#f7f3eb",
    },
    {
        gradientFrom: "#5b3b7c",
        gradientTo: "#1a1f36",
        accent: "#f3c76b",
        panel: "rgba(255,255,255,0.10)",
        ink: "#fbf7ef",
    },
    {
        gradientFrom: "#533a2f",
        gradientTo: "#18252d",
        accent: "#7fc7b7",
        panel: "rgba(255,255,255,0.10)",
        ink: "#fff8ef",
    },
];

export function buildFallbackBlogCoverDataUrl(post: Pick<InternalBlogPost, "title" | "excerpt" | "tags" | "slug">) {
    const svg = renderBlogCoverSvg(post, buildFallbackDesign(post.title, post.tags, post.slug));
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function buildFallbackDesign(title: string, tags: string[], slug: string): BlogCoverDesign {
    const palette = DEFAULT_DESIGNS[Math.abs(hashCode(`${title}|${slug}`)) % DEFAULT_DESIGNS.length];
    const lines = splitTitleIntoLines(title);

    return {
        eyebrow: buildEyebrow(tags),
        titleLines: lines,
        accentLabel: tags[0] || "SEO ARTICLE",
        ...palette,
    };
}

function renderBlogCoverSvg(
    post: Pick<InternalBlogPost, "title" | "excerpt" | "tags" | "slug">,
    design: BlogCoverDesign,
) {
    const tagChips = (post.tags.length > 0 ? post.tags : ["SEO", "UX", "Performance"])
        .slice(0, 3)
        .map((tag, index) => {
            const x = 84 + index * 194;
            return `
                <g transform="translate(${x},520)">
                    <rect width="168" height="42" rx="21" fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.18)"/>
                    <text x="84" y="27" text-anchor="middle" font-size="18" font-family="Arial, sans-serif" fill="${escapeAttribute(design.ink)}">${escapeXml(tag.toUpperCase())}</text>
                </g>
            `;
        })
        .join("");

    const titleLines = design.titleLines
        .map((line, index) => `
            <text x="84" y="${214 + index * 84}" font-size="${index === 0 ? 58 : 54}" font-weight="700" font-family="Arial, sans-serif" fill="${escapeAttribute(design.ink)}">${escapeXml(line)}</text>
        `)
        .join("");

    return [
        '<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630" role="img" aria-labelledby="title desc">',
        `<title id="title">${escapeXml(post.title)}</title>`,
        `<desc id="desc">${escapeXml(post.excerpt || post.title)}</desc>`,
        "<defs>",
        `<linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="${escapeAttribute(design.gradientFrom)}"/><stop offset="100%" stop-color="${escapeAttribute(design.gradientTo)}"/></linearGradient>`,
        `<radialGradient id="glow" cx="18%" cy="18%" r="80%"><stop offset="0%" stop-color="${escapeAttribute(design.accent)}" stop-opacity="0.55"/><stop offset="100%" stop-color="${escapeAttribute(design.accent)}" stop-opacity="0"/></radialGradient>`,
        "</defs>",
        '<rect width="1200" height="630" fill="url(#bg)"/>',
        '<circle cx="220" cy="110" r="260" fill="url(#glow)"/>',
        '<circle cx="1020" cy="520" r="220" fill="rgba(255,255,255,0.08)"/>',
        '<circle cx="920" cy="148" r="108" fill="rgba(255,255,255,0.06)"/>',
        `<rect x="62" y="56" width="1076" height="518" rx="36" fill="${escapeAttribute(design.panel)}" stroke="rgba(255,255,255,0.14)"/>`,
        `<text x="84" y="112" font-size="22" letter-spacing="4" font-family="Arial, sans-serif" font-weight="700" fill="${escapeAttribute(design.ink)}">${escapeXml(design.eyebrow.toUpperCase())}</text>`,
        titleLines,
        `<text x="84" y="460" font-size="26" font-family="Arial, sans-serif" fill="${escapeAttribute(design.ink)}" opacity="0.88">${escapeXml(trimCopy(post.excerpt || "Sharper SEO, UX, and conversion insights.", 92))}</text>`,
        `<g transform="translate(936,84)">
            <rect width="182" height="58" rx="29" fill="${escapeAttribute(design.accent)}"/>
            <text x="91" y="36" text-anchor="middle" font-size="20" font-family="Arial, sans-serif" font-weight="700" fill="#16191b">${escapeXml(design.accentLabel.toUpperCase())}</text>
        </g>`,
        `<text x="84" y="490" font-size="18" font-family="Arial, sans-serif" fill="${escapeAttribute(design.ink)}" opacity="0.72">Adamant</text>`,
        tagChips,
        '<path d="M862 458c82 20 152 57 210 114" stroke="rgba(255,255,255,0.16)" stroke-width="2" fill="none"/>',
        '<path d="M924 80c74 34 136 92 184 174" stroke="rgba(255,255,255,0.12)" stroke-width="2" fill="none"/>',
        "</svg>",
    ].join("");
}

function splitTitleIntoLines(title: string) {
    const words = title
        .replace(/[&/]+/g, " ")
        .split(/\s+/)
        .map((word) => word.trim())
        .filter(Boolean);

    if (words.length <= 4) {
        return [title.trim()];
    }

    const lines: string[] = [];
    let currentLine = "";

    for (const word of words) {
        const nextLine = currentLine ? `${currentLine} ${word}` : word;

        if (nextLine.length > 22 && currentLine) {
            lines.push(currentLine);
            currentLine = word;
        } else {
            currentLine = nextLine;
        }

        if (lines.length === 2) {
            break;
        }
    }

    const remainingWords = words.slice(lines.join(" ").split(/\s+/).filter(Boolean).length);
    const lastLine = [currentLine, remainingWords.join(" ")].join(" ").trim();

    if (lastLine) {
        lines.push(lastLine);
    }

    return lines.filter(Boolean).slice(0, 3);
}

function buildEyebrow(tags: string[]) {
    if (tags[0]) {
        return tags[0];
    }

    return "Adamant";
}

function trimCopy(value: string, maxLength: number) {
    if (value.length <= maxLength) {
        return value;
    }

    return `${value.slice(0, maxLength - 3).trim()}...`;
}

function escapeXml(value: string) {
    return value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");
}

function escapeAttribute(value: string) {
    return value.replace(/"/g, "&quot;");
}

function hashCode(value: string) {
    let hash = 0;

    for (let index = 0; index < value.length; index += 1) {
        hash = ((hash << 5) - hash) + value.charCodeAt(index);
        hash |= 0;
    }

    return hash;
}
