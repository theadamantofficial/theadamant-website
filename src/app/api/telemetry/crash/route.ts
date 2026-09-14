import {NextRequest, NextResponse} from "next/server";
import {parseClientCrashReport} from "@/lib/telemetry/report";
import {notifyDiscordCrash} from "@/lib/telemetry/discord.server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const MAX_BODY_BYTES = 16_384;
const clientWindows = new Map<string, {start: number; count: number}>();

function acceptClient(request: NextRequest): boolean {
    const now = Date.now();
    for (const [key, value] of clientWindows) {
        if (now - value.start >= 60_000) clientWindows.delete(key);
    }
    const client = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const current = clientWindows.get(client) || {start: now, count: 0};
    if (current.count >= 10 || (clientWindows.size >= 1000 && !clientWindows.has(client))) return false;
    current.count++;
    clientWindows.set(client, current);
    return true;
}

export async function POST(request: NextRequest) {
    const origin = request.headers.get("origin");
    const allowedOrigins = new Set([new URL(request.url).origin]);
    try { allowedOrigins.add(new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://theadamant.com").origin); } catch {}
    if (!origin || !allowedOrigins.has(origin)) return NextResponse.json({error: "Invalid origin"}, {status: 403});
    if (!request.headers.get("content-type")?.startsWith("application/json")) {
        return NextResponse.json({error: "JSON required"}, {status: 415});
    }
    if (!acceptClient(request)) return NextResponse.json({error: "Too many reports"}, {status: 429});
    if (Number(request.headers.get("content-length")) > MAX_BODY_BYTES) {
        return NextResponse.json({error: "Report too large"}, {status: 413});
    }
    let payload: unknown;
    try {
        const reader = request.body?.getReader();
        if (!reader) return NextResponse.json({error: "Missing report"}, {status: 400});
        const decoder = new TextDecoder();
        let size = 0, body = "";
        while (true) {
            const {value, done} = await reader.read();
            if (done) break;
            size += value.byteLength;
            if (size > MAX_BODY_BYTES) {
                await reader.cancel();
                return NextResponse.json({error: "Report too large"}, {status: 413});
            }
            body += decoder.decode(value, {stream: true});
        }
        body += decoder.decode();
        payload = JSON.parse(body);
    } catch { return NextResponse.json({error: "Invalid report"}, {status: 400}); }
    const report = parseClientCrashReport(payload);
    if (!report) return NextResponse.json({error: "Invalid report"}, {status: 400});
    const result = await notifyDiscordCrash(report);
    if (result === "failed") return NextResponse.json({error: "Delivery failed"}, {status: 502});
    return NextResponse.json({accepted: true, notification: result}, {status: 202});
}
