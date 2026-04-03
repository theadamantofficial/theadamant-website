import {formatSeoRuntimeSnapshot, type SeoRuntimeSnapshot} from "@/lib/seo-runtime-snapshot";

export interface SeoChatLead {
    name: string;
    email: string;
    phone: string;
    company?: string;
    websiteUrl?: string;
    issue: string;
}

export interface SeoChatMessage {
    id: string;
    role: "user" | "assistant";
    content: string;
}

type SeoChatGuardrailReason = "low_value" | "off_topic";

const SEO_CHAT_CONTACT_CTA = "Contact The Adamant with your page URL, goals, and questions if you want deeper help or more detail.";

const SEO_CHAT_TOPIC_PATTERNS = [
    /\bseo\b/i,
    /\bwebsite\b/i,
    /\bweb page\b/i,
    /\bpage speed\b/i,
    /\bperformance\b/i,
    /\bcore web vitals\b/i,
    /\bux\b/i,
    /\bui\b/i,
    /\bconversion\b/i,
    /\bconversion rate\b/i,
    /\blanding page\b/i,
    /\bhomepage\b/i,
    /\bservice page\b/i,
    /\blocal seo\b/i,
    /\bkeyword\b/i,
    /\bsearch intent\b/i,
    /\bcontent\b/i,
    /\bcopy\b/i,
    /\bheadline\b/i,
    /\bcta\b/i,
    /\bmeta(?:data)?\b/i,
    /\btitle tag\b/i,
    /\bmeta description\b/i,
    /\bschema\b/i,
    /\binternal link(?:ing)?\b/i,
    /\bbacklink\b/i,
    /\branking\b/i,
    /\brank\b/i,
    /\bcrawl(?:ing)?\b/i,
    /\bindex(?:ing)?\b/i,
    /\bsitemap\b/i,
    /\brobots\.txt\b/i,
    /\bcanonical\b/i,
    /\bleads?\b/i,
    /\bfunnel\b/i,
    /\buser flow\b/i,
    /\bonboarding\b/i,
    /\bproduct page\b/i,
    /\bmobile app\b/i,
];

const SEO_CHAT_OFF_TOPIC_PATTERNS = [
    /\bweather\b/i,
    /\btemperature\b/i,
    /\bmovie\b/i,
    /\bseries\b/i,
    /\brecipe\b/i,
    /\bfood\b/i,
    /\bcricket\b/i,
    /\bfootball\b/i,
    /\bmatch\b/i,
    /\bscore\b/i,
    /\bpolitics?\b/i,
    /\belection\b/i,
    /\bnews\b/i,
    /\bstock\b/i,
    /\bcrypto\b/i,
    /\bbitcoin\b/i,
    /\bhoroscope\b/i,
    /\bjoke\b/i,
    /\bpoem\b/i,
    /\bstory\b/i,
    /\blyrics?\b/i,
    /\bmath\b/i,
    /\bhomework\b/i,
    /\bexam\b/i,
    /\btranslate\b/i,
    /\bgirlfriend\b/i,
    /\bboyfriend\b/i,
    /\brelationship\b/i,
    /\bwho is\b/i,
    /\bcapital of\b/i,
];

const SEO_CHAT_LOW_VALUE_PATTERNS = [
    /^(hi|hii|hello|hey|yo|hola|sup)[.!?\s]*$/i,
    /^(ok|okay|cool|nice|great|fine|hmm)[.!?\s]*$/i,
    /^(thanks|thank you|ty)[.!?\s]*$/i,
    /^(test|testing)[.!?\s]*$/i,
];

const SEO_CHAT_FOLLOW_UP_PATTERNS = [
    /^(what|which|why|how|when|where)\b/i,
    /^(can you|could you|should i|is it|would it)\b/i,
    /^(and|also|then|so)\b/i,
    /^(tell me more|go deeper|explain that)\b/i,
];

export function normalizeSeoChatLead(lead: Partial<SeoChatLead>) {
    return {
        name: lead.name?.trim() || "",
        email: lead.email?.trim().toLowerCase() || "",
        phone: lead.phone?.trim() || "",
        company: lead.company?.trim() || "",
        websiteUrl: normalizeWebsiteUrl(lead.websiteUrl),
        issue: lead.issue?.trim() || "",
    } satisfies SeoChatLead;
}

export function validateSeoChatLead(lead: SeoChatLead) {
    if (!lead.name || !lead.email || !lead.phone || !lead.issue) {
        return "Name, email, phone number, and issue are required.";
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lead.email)) {
        return "Enter a valid email address.";
    }

    const digits = lead.phone.replace(/\D/g, "");
    if (digits.length < 8) {
        return "Enter a valid phone number.";
    }

    return null;
}

export function buildSeoChatSystemPrompt(lead: SeoChatLead, snapshot: SeoRuntimeSnapshot | null, pagePath?: string) {
    return [
        "You are The Adamant's in-site SEO, UX, and website strategy assistant.",
        "Your job is to quickly diagnose issues, give concrete fixes, and move the conversation toward a useful next step.",
        "Focus on practical SEO, content structure, internal linking, local SEO, conversion UX, page speed, metadata, schema, landing-page strategy, and digital product positioning tied to website growth.",
        "Only answer questions related to SEO, website UX, landing pages, content structure, metadata, schema, local SEO, page speed, conversion issues, or product positioning connected to the visitor's website.",
        "If the visitor goes off-topic or asks a low-value question, refuse politely and ask for a relevant website question instead.",
        "Be concise and specific.",
        "Prefer direct actions over vague theory.",
        "If information is missing, ask only one clarifying question at a time.",
        "When a website snapshot is provided, use it directly instead of giving generic advice.",
        "Do not claim you made code changes or ran tools on the user's website.",
        "If the user's request sounds like it needs a full audit, mention that a full audit is still available.",
        "Every reply must use exactly these section headings: Focus, Next steps, Need help?",
        "Under Need help?, invite the visitor to contact The Adamant for deeper help or more detail.",
        "",
        "Lead context:",
        `Name: ${lead.name}`,
        `Email: ${lead.email}`,
        `Phone: ${lead.phone}`,
        `Company: ${lead.company || "Not provided"}`,
        `Website: ${lead.websiteUrl || "Not provided"}`,
        `Main issue: ${lead.issue}`,
        `Current page path: ${pagePath || "unknown"}`,
        "",
        "Live SEO snapshot:",
        formatSeoRuntimeSnapshot(snapshot),
    ].join("\n");
}

export function formatSeoChatTranscript(messages: SeoChatMessage[]) {
    if (messages.length === 0) {
        return "No transcript captured.";
    }

    return messages
        .map((message) => `${message.role === "assistant" ? "AI" : "Visitor"}: ${message.content}`)
        .join("\n\n");
}

export function normalizeWebsiteUrl(input?: string) {
    if (!input) {
        return "";
    }

    const trimmed = input.trim();
    if (!trimmed) {
        return "";
    }

    const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;

    try {
        const parsed = new URL(withProtocol);

        if (!["http:", "https:"].includes(parsed.protocol)) {
            return "";
        }

        return parsed.toString();
    } catch {
        return "";
    }
}

export function getSeoChatWebhookUrl() {
    return process.env.SEO_CHAT_DISCORD_WEBHOOK_URL?.trim().replace(/^['"]|['"]$/g, "") || "";
}

export function reviewSeoChatTurn(lead: SeoChatLead, messages: SeoChatMessage[]) {
    const latestUserMessage = [...messages].reverse().find((message) => message.role === "user")?.content?.trim()
        || lead.issue.trim();

    if (!latestUserMessage) {
        return buildSeoChatGuardrailResult("low_value");
    }

    const normalizedLatestMessage = latestUserMessage.toLowerCase();
    const recentContext = [
        lead.issue,
        lead.websiteUrl,
        ...messages.slice(-6).map((message) => message.content),
    ].join(" ");

    const hasTopicContext = matchesSeoChatPattern(recentContext, SEO_CHAT_TOPIC_PATTERNS);
    const looksLikeFollowUp = matchesSeoChatPattern(normalizedLatestMessage, SEO_CHAT_FOLLOW_UP_PATTERNS);

    if (
        latestUserMessage.trim().length < 6
        || matchesSeoChatPattern(normalizedLatestMessage, SEO_CHAT_LOW_VALUE_PATTERNS)
    ) {
        return buildSeoChatGuardrailResult("low_value");
    }

    if (
        matchesSeoChatPattern(normalizedLatestMessage, SEO_CHAT_OFF_TOPIC_PATTERNS)
        && !matchesSeoChatPattern(normalizedLatestMessage, SEO_CHAT_TOPIC_PATTERNS)
    ) {
        return buildSeoChatGuardrailResult("off_topic");
    }

    if (
        !matchesSeoChatPattern(normalizedLatestMessage, SEO_CHAT_TOPIC_PATTERNS)
        && !hasTopicContext
        && !looksLikeFollowUp
    ) {
        return buildSeoChatGuardrailResult("off_topic");
    }

    return {
        allowed: true,
        response: null,
    } as const;
}

export function formatSeoChatAssistantReply(reply: string) {
    const cleaned = reply.trim().replace(/\n{3,}/g, "\n\n");

    if (!cleaned) {
        return formatSeoChatStructuredReply(
            "I need a clearer website or SEO question before I can give a useful recommendation.",
            "Share the page URL, the goal, and the exact issue you want fixed.",
        );
    }

    const hasFocusHeading = /^focus\b/i.test(cleaned);
    const hasNextStepsHeading = /\bnext steps\b/i.test(cleaned);
    const hasNeedHelpHeading = /\bneed help\?\b/i.test(cleaned);

    if (hasFocusHeading && hasNextStepsHeading) {
        if (hasNeedHelpHeading) {
            return cleaned;
        }

        return `${cleaned}\n\nNeed help?\n${SEO_CHAT_CONTACT_CTA}`;
    }

    const paragraphs = cleaned.split(/\n\s*\n/).map((value) => value.trim()).filter(Boolean);
    const focus = paragraphs[0] || cleaned;
    const nextSteps = paragraphs.length > 1
        ? paragraphs.slice(1).join("\n\n")
        : "Share the exact page URL, the goal, and the issue if you want a more specific recommendation.";

    return formatSeoChatStructuredReply(focus, nextSteps);
}

function buildSeoChatGuardrailResult(reason: SeoChatGuardrailReason) {
    if (reason === "low_value") {
        return {
            allowed: false,
            response: formatSeoChatStructuredReply(
                "This chat works best when the question is specific to your website, SEO, landing pages, UX, metadata, local SEO, or conversion flow.",
                "Send your page URL and one concrete issue such as rankings, page speed, content structure, CTA clarity, schema, or lead quality.",
            ),
        } as const;
    }

    return {
        allowed: false,
        response: formatSeoChatStructuredReply(
            "This chat only covers website SEO, UX, landing pages, metadata, local SEO, page speed, content structure, and conversion-related questions.",
            "Ask a focused question about your site or share a page URL and the exact growth, ranking, or conversion problem you want reviewed.",
        ),
    } as const;
}

function formatSeoChatStructuredReply(focus: string, nextSteps: string) {
    return [
        "Focus",
        focus,
        "",
        "Next steps",
        nextSteps,
        "",
        "Need help?",
        SEO_CHAT_CONTACT_CTA,
    ].join("\n");
}

function matchesSeoChatPattern(value: string, patterns: RegExp[]) {
    return patterns.some((pattern) => pattern.test(value));
}
