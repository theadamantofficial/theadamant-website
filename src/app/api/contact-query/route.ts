import {NextRequest, NextResponse} from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getContactQueryWebhookUrl() {
    const rawUrl = process.env.CONTACT_QUERY_WEBHOOK_URL?.trim();

    if (!rawUrl) {
        return "";
    }

    return rawUrl.replace(/^['"]|['"]$/g, "");
}

export async function POST(request: NextRequest) {
    const webhookUrl = getContactQueryWebhookUrl();

    if (!webhookUrl) {
        return NextResponse.json({success: false, error: "Webhook not configured."}, {status: 503});
    }

    let payload: {
        name?: string;
        email?: string;
        inquiryType?: string;
        message?: string;
        submittedAt?: string;
    };

    try {
        payload = await request.json();
    } catch {
        return NextResponse.json({success: false, error: "Invalid query payload."}, {status: 400});
    }

    const name = payload.name?.trim() || "";
    const email = payload.email?.trim() || "";
    const inquiryType = payload.inquiryType?.trim() || "";
    const message = payload.message?.trim() || "";
    const submittedAt = payload.submittedAt?.trim() || new Date().toISOString();

    if (!name || !email || !inquiryType || !message) {
        return NextResponse.json({success: false, error: "Missing required fields."}, {status: 400});
    }

    try {
        await fetch(webhookUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                content: [
                    "**New website query received**",
                    `Name: ${name}`,
                    `Email: ${email}`,
                    `Purpose: ${inquiryType}`,
                    `Submitted: ${submittedAt}`,
                    "",
                    message,
                ].join("\n"),
            }),
        });

        return NextResponse.json({success: true});
    } catch (error) {
        console.error("Failed to notify contact query webhook.", error);
        return NextResponse.json({success: false, error: "Webhook delivery failed."}, {status: 502});
    }
}
