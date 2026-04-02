import {NextRequest, NextResponse} from "next/server";
import {extractAuditResult} from "@/lib/website-audit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const N8N_AUDIT_WEBHOOK_URL = process.env.N8N_AUDIT_WEBHOOK_URL ?? "https://n8n-production-4e87.up.railway.app/webhook/audit";
const FALLBACK_ERROR_MESSAGE = "We could not start the audit right now.";
const ERROR_DETAIL_LIMIT = 240;

interface AuditRequestBody {
    url?: string;
    email?: string;
}

export async function POST(request: NextRequest) {
    let payload: AuditRequestBody;

    try {
        payload = await request.json();
    } catch {
        return NextResponse.json({error: "Invalid request body."}, {status: 400});
    }

    const normalizedUrl = normalizeWebsiteUrl(payload.url);
    const normalizedEmail = normalizeEmail(payload.email);

    if (!normalizedUrl) {
        return NextResponse.json({error: "Enter a valid website URL."}, {status: 400});
    }

    if (!normalizedEmail) {
        return NextResponse.json({error: "Enter a valid email address."}, {status: 400});
    }

    try {
        const webhookResponse = await fetch(N8N_AUDIT_WEBHOOK_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json, text/plain;q=0.9, */*;q=0.8",
            },
            body: JSON.stringify({
                url: normalizedUrl,
                email: normalizedEmail,
            }),
            cache: "no-store",
        });

        const webhookPayload = await parseWebhookResponse(webhookResponse);

        if (!webhookResponse.ok) {
            return NextResponse.json(
                {
                    error: extractErrorMessage(webhookPayload) ?? FALLBACK_ERROR_MESSAGE,
                },
                {status: normalizeErrorStatus(webhookResponse.status)},
            );
        }

        return NextResponse.json({
            message: "Report sent to your email",
            result: extractAuditResult(webhookPayload, normalizedUrl),
        });
    } catch (error) {
        return NextResponse.json(
            {
                error: error instanceof Error ? error.message : FALLBACK_ERROR_MESSAGE,
            },
            {status: 502},
        );
    }
}

function normalizeWebsiteUrl(input?: string) {
    if (!input) {
        return null;
    }

    const trimmed = input.trim();
    if (!trimmed) {
        return null;
    }

    const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;

    try {
        const parsed = new URL(withProtocol);

        if (!["http:", "https:"].includes(parsed.protocol)) {
            return null;
        }

        return parsed.toString();
    } catch {
        return null;
    }
}

function normalizeEmail(input?: string) {
    if (!input) {
        return null;
    }

    const trimmed = input.trim().toLowerCase();
    if (!trimmed) {
        return null;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(trimmed) ? trimmed : null;
}

async function parseWebhookResponse(response: Response): Promise<unknown> {
    const contentType = response.headers.get("content-type") ?? "";

    if (contentType.includes("application/json")) {
        try {
            return await response.json();
        } catch {
            return null;
        }
    }

    const text = await response.text();
    if (!text) {
        return null;
    }

    try {
        return JSON.parse(text);
    } catch {
        return text;
    }
}

function extractErrorMessage(payload: unknown) {
    if (typeof payload === "string" && payload.trim()) {
        return payload.trim().slice(0, ERROR_DETAIL_LIMIT);
    }

    if (!isRecord(payload)) {
        return null;
    }

    for (const key of ["error", "message", "detail", "details"]) {
        const value = payload[key];

        if (typeof value === "string" && value.trim()) {
            return value.trim().slice(0, ERROR_DETAIL_LIMIT);
        }
    }

    return null;
}

function normalizeErrorStatus(status: number) {
    if (status >= 500) {
        return 502;
    }

    return status || 502;
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}
