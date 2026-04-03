import {NextRequest, NextResponse} from "next/server";
import {requestGroqChatCompletion} from "@/lib/groq";
import {fetchSeoRuntimeSnapshot} from "@/lib/seo-runtime-snapshot";
import {
    buildSeoChatSystemPrompt,
    formatSeoChatAssistantReply,
    normalizeSeoChatLead,
    reviewSeoChatTurn,
    SeoChatMessage,
    validateSeoChatLead,
} from "@/lib/seo-chat";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface SeoChatRequestBody {
    lead?: Partial<{
        name: string;
        email: string;
        phone: string;
        company: string;
        websiteUrl: string;
        issue: string;
    }>;
    messages?: SeoChatMessage[];
    pagePath?: string;
}

export async function POST(request: NextRequest) {
    let payload: SeoChatRequestBody;

    try {
        payload = await request.json();
    } catch {
        return NextResponse.json({error: "Invalid request body."}, {status: 400});
    }

    const lead = normalizeSeoChatLead(payload.lead || {});
    const validationError = validateSeoChatLead(lead);

    if (validationError) {
        return NextResponse.json({error: validationError}, {status: 400});
    }

    const messages = Array.isArray(payload.messages) ? payload.messages.slice(-12) : [];
    const snapshot = lead.websiteUrl ? await fetchSeoRuntimeSnapshot(lead.websiteUrl) : null;
    const systemPrompt = buildSeoChatSystemPrompt(lead, snapshot, payload.pagePath);
    const userMessages = messages
        .filter((message) => (message.role === "assistant" || message.role === "user") && message.content?.trim())
        .map((message) => ({
            role: message.role,
            content: message.content.trim(),
        }));

    const guardrailResult = reviewSeoChatTurn(lead, messages);

    if (!guardrailResult.allowed) {
        return NextResponse.json({
            message: guardrailResult.response,
            snapshot,
        });
    }

    if (userMessages.length === 0) {
        userMessages.push({
            role: "user",
            content: `Start the conversation and help with this issue: ${lead.issue}`,
        });
    }

    try {
        const reply = await requestGroqChatCompletion({
            maxTokens: 700,
            temperature: 0.35,
            messages: [
                {
                    role: "system",
                    content: systemPrompt,
                },
                ...userMessages,
            ],
        });

        return NextResponse.json({
            message: formatSeoChatAssistantReply(reply),
            snapshot,
        });
    } catch (error) {
        return NextResponse.json(
            {
                error: error instanceof Error ? error.message : "SEO chat is unavailable right now.",
            },
            {status: 502},
        );
    }
}
