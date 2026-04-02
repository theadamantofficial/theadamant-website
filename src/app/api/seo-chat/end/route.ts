import {NextRequest, NextResponse} from "next/server";
import {formatSeoChatTranscript, getSeoChatWebhookUrl, normalizeSeoChatLead, SeoChatMessage} from "@/lib/seo-chat";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface SeoChatEndRequestBody {
    sessionId?: string;
    reason?: string;
    pagePath?: string;
    lead?: Partial<{
        name: string;
        email: string;
        phone: string;
        company: string;
        websiteUrl: string;
        issue: string;
    }>;
    messages?: SeoChatMessage[];
}

export async function POST(request: NextRequest) {
    let payload: SeoChatEndRequestBody;

    try {
        payload = await request.json();
    } catch {
        return NextResponse.json({error: "Invalid request body."}, {status: 400});
    }

    const webhookUrl = getSeoChatWebhookUrl();
    const lead = normalizeSeoChatLead(payload.lead || {});
    const messages = Array.isArray(payload.messages) ? payload.messages : [];

    if (!webhookUrl) {
        return NextResponse.json({success: false, configured: false});
    }

    try {
        const transcript = formatSeoChatTranscript(messages);
        const content = truncateDiscordMessage([
            "**SEO AI chat ended**",
            `Session: ${payload.sessionId || "unknown"}`,
            `Reason: ${payload.reason || "dialog_closed"}`,
            `Page: ${payload.pagePath || "unknown"}`,
            `Name: ${lead.name || "unknown"}`,
            `Email: ${lead.email || "unknown"}`,
            `Phone: ${lead.phone || "unknown"}`,
            `Company: ${lead.company || "Not provided"}`,
            `Website: ${lead.websiteUrl || "Not provided"}`,
            `Issue: ${lead.issue || "Not provided"}`,
            "",
            transcript,
        ].join("\n"));

        await fetch(webhookUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({content}),
        });

        return NextResponse.json({success: true, configured: true});
    } catch (error) {
        console.error("Failed to send SEO chat webhook.", error);
        return NextResponse.json({success: false, configured: true}, {status: 502});
    }
}

function truncateDiscordMessage(value: string) {
    if (value.length <= 1900) {
        return value;
    }

    return `${value.slice(0, 1897)}...`;
}
