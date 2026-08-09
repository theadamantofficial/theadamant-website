import {NextRequest, NextResponse} from "next/server";
import {formatSeoChatTranscript, getSeoChatWebhookUrl, normalizeSeoChatLead, SeoChatMessage} from "@/lib/seo-chat";
import {capturePublicCrmLead} from "@/lib/crm/public-lead-ingestion";

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
    const transcript = formatSeoChatTranscript(messages);
    const sessionReference = payload.sessionId?.trim() || `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    const crmCapturePromise = capturePublicCrmLead({
        externalReference: `seo_chat:${sessionReference}`,
        customerName: lead.name || "SEO chat visitor",
        email: lead.email,
        phone: lead.phone,
        companyName: lead.company,
        serviceRequired: "SEO",
        leadSource: "website",
        priority: "medium",
        description: [lead.issue, lead.websiteUrl ? `Website: ${lead.websiteUrl}` : "", "", transcript].filter(Boolean).join("\n").slice(0, 10000),
        originMetadata: {
            channel: "seo_ai_chat",
            session_id: sessionReference,
            reason: payload.reason || "dialog_closed",
            page_path: payload.pagePath || "unknown",
            website_url: lead.websiteUrl || null,
            submitted_at: new Date().toISOString(),
        },
    }).catch((error) => {
        console.error("SEO chat CRM capture failed unexpectedly.", error);
        return {captured: false, configured: true} as const;
    });

    if (!webhookUrl) {
        const crmCapture = await crmCapturePromise;
        return NextResponse.json({success: false, configured: false, crmCaptured: crmCapture.captured});
    }

    try {
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

        const crmCapture = await crmCapturePromise;
        return NextResponse.json({success: true, configured: true, crmCaptured: crmCapture.captured});
    } catch (error) {
        await crmCapturePromise;
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
