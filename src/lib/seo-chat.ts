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
        "Focus on practical SEO, content structure, internal linking, local SEO, conversion UX, page speed, metadata, schema, and landing-page strategy.",
        "Be concise and specific.",
        "Prefer direct actions over vague theory.",
        "If information is missing, ask only one clarifying question at a time.",
        "When a website snapshot is provided, use it directly instead of giving generic advice.",
        "Do not claim you made code changes or ran tools on the user's website.",
        "If the user's request sounds like it needs a full audit, mention that a full audit is still available.",
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
