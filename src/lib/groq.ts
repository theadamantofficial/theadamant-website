const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

export interface GroqChatMessage {
    role: "system" | "user" | "assistant";
    content: string;
}

interface GroqChatOptions {
    model?: string;
    messages: GroqChatMessage[];
    temperature?: number;
    maxTokens?: number;
}

interface GroqChatResponse {
    choices?: Array<{
        message?: {
            content?: string | null;
        };
    }>;
    error?: {
        message?: string;
    };
}

const DEFAULT_GROQ_CHAT_MODEL = "llama-3.3-70b-versatile";

export function getGroqApiKey() {
    return process.env.GROQ_API_KEY?.trim() || "";
}

export function getGroqChatModel() {
    return process.env.GROQ_CHAT_MODEL?.trim() || DEFAULT_GROQ_CHAT_MODEL;
}

export function getGroqBlogCoverModel() {
    return process.env.GROQ_BLOG_COVER_MODEL?.trim() || getGroqChatModel();
}

export async function requestGroqChatCompletion({
    model = getGroqChatModel(),
    messages,
    temperature = 0.4,
    maxTokens = 700,
}: GroqChatOptions) {
    const apiKey = getGroqApiKey();

    if (!apiKey) {
        throw new Error("GROQ_API_KEY is not configured.");
    }

    const response = await fetch(GROQ_API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model,
            messages,
            temperature,
            max_tokens: maxTokens,
        }),
        cache: "no-store",
    });

    const payload = await safeJson<GroqChatResponse>(response);

    if (!response.ok) {
        throw new Error(payload.error?.message || "Groq request failed.");
    }

    const content = payload.choices?.[0]?.message?.content?.trim();

    if (!content) {
        throw new Error("Groq returned an empty response.");
    }

    return content;
}

export function extractJsonObject<T>(value: string) {
    const trimmed = value.trim();
    const direct = tryParseJson<T>(trimmed);

    if (direct) {
        return direct;
    }

    const fencedMatch = trimmed.match(/```(?:json)?\s*([\s\S]+?)```/i);
    if (fencedMatch) {
        const fenced = tryParseJson<T>(fencedMatch[1]);

        if (fenced) {
            return fenced;
        }
    }

    const start = trimmed.indexOf("{");
    const end = trimmed.lastIndexOf("}");

    if (start !== -1 && end !== -1 && end > start) {
        return tryParseJson<T>(trimmed.slice(start, end + 1));
    }

    return null;
}

function tryParseJson<T>(value: string) {
    try {
        return JSON.parse(value) as T;
    } catch {
        return null;
    }
}

async function safeJson<T>(response: Response) {
    const raw = await response.text();

    if (!raw) {
        return {} as T;
    }

    try {
        return JSON.parse(raw) as T;
    } catch {
        return {error: {message: raw}} as T;
    }
}
