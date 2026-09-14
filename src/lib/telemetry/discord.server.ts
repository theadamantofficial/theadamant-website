import {diagnosticPath, redactDiagnostic, type CrashReport} from "./report";

const recentReports = new Map<string, number>();
let windowStart = 0;
let windowCount = 0;
const DEDUPLICATION_MS = 5 * 60_000;

export function getCrashWebhookUrl(): string {
    const value = process.env.DISCORD_CRASH_WEBHOOK_URL?.trim().replace(/^['"]|['"]$/g, "") || "";
    try {
        const url = new URL(value);
        if (url.protocol !== "https:" || !["discord.com", "discordapp.com"].includes(url.hostname)
            || !/^\/api(?:\/v\d+)?\/webhooks\/\d+\/[\w-]+\/?$/.test(url.pathname)) return "";
        url.search = "";
        url.searchParams.set("wait", "true");
        return url.toString();
    } catch { return ""; }
}

export function buildCrashWebhookPayload(report: CrashReport) {
    const release = process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 12) || "unknown";
    return {
        username: "Adamant Website Crashes",
        allowed_mentions: {parse: []},
        embeds: [{
            title: `Website error · ${report.source}`,
            color: 0xe05a47,
            description: redactDiagnostic(report.message, 600),
            fields: [
                {name: "Page / route", value: diagnosticPath(report.path), inline: true},
                {name: "Environment", value: process.env.VERCEL_ENV || process.env.NODE_ENV || "unknown", inline: true},
                {name: "Release", value: release, inline: true},
                ...(report.digest ? [{name: "Error reference", value: redactDiagnostic(report.digest, 100), inline: true}] : []),
                ...(report.stack ? [{name: "Stack trace", value: redactDiagnostic(report.stack, 1000)}] : []),
            ],
            timestamp: new Date().toISOString(),
            footer: {text: "Repeated errors are grouped for 5 minutes per server instance."},
        }],
    };
}

/** Await delivery so serverless hosts do not terminate the request before posting. */
export async function notifyDiscordCrash(report: CrashReport): Promise<"sent" | "disabled" | "suppressed" | "failed"> {
    if (process.env.NEXT_PUBLIC_TELEMETRY_ENABLED === "false") return "disabled";
    if (process.env.NODE_ENV !== "production" && process.env.NEXT_PUBLIC_TELEMETRY_ENABLED !== "true") return "disabled";
    const webhook = getCrashWebhookUrl();
    if (!webhook) return "disabled";
    const now = Date.now();
    for (const [key, timestamp] of recentReports) {
        if (now - timestamp >= DEDUPLICATION_MS) recentReports.delete(key);
    }
    if (now - windowStart >= 60_000) { windowStart = now; windowCount = 0; }
    const key = report.digest ? `digest:${report.digest}` : `${report.path}:${report.message}:${report.stack}`;
    if (recentReports.has(key) || windowCount >= 20) return "suppressed";
    recentReports.set(key, now);
    windowCount++;
    try {
        const response = await fetch(webhook, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(buildCrashWebhookPayload(report)),
            signal: AbortSignal.timeout(5000),
            cache: "no-store",
        });
        if (response.ok) return "sent";
        // Respect Discord rate limits; do not repeatedly retry an unavailable webhook.
        if (response.status !== 429) recentReports.delete(key);
        console.error("Discord crash notification failed", {status: response.status});
        return "failed";
    } catch {
        recentReports.delete(key);
        // Never log the webhook URL or the provider response (both can contain secrets).
        console.error("Discord crash notification could not be delivered");
        return "failed";
    }
}
