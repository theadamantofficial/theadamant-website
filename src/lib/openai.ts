const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

interface OpenAIMessage {
    role: "system" | "user";
    content: string;
}

interface OpenAIResponse {
    choices?: Array<{message?: {content?: string | null}}>;
    error?: {message?: string};
}

export function getOpenAIModel() {
    return process.env.OPENAI_SEO_MODEL?.trim() || process.env.OPENAI_AUDIT_MODEL?.trim() || "gpt-4o-mini";
}

export async function requestOpenAIJson<T>({
    messages,
    maxTokens = 1800,
}: {
    messages: OpenAIMessage[];
    maxTokens?: number;
}) {
    const apiKey = process.env.OPENAI_API_KEY?.trim();
    if (!apiKey) throw new Error("OPENAI_API_KEY is not configured.");

    const response = await fetch(OPENAI_API_URL, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            model: getOpenAIModel(),
            messages,
            temperature: 0.2,
            max_tokens: maxTokens,
            response_format: {type: "json_object"},
        }),
        cache: "no-store",
        signal: AbortSignal.timeout(30_000),
    });

    const payload = await response.json() as OpenAIResponse;
    if (!response.ok) throw new Error(payload.error?.message || "OpenAI request failed.");

    const content = payload.choices?.[0]?.message?.content?.trim();
    if (!content) throw new Error("OpenAI returned an empty response.");
    return JSON.parse(content) as T;
}
