import {createCrashReport, type ClientErrorSource} from "./report";

const reported = new Set<string>();
let sentCount = 0;

export function telemetryEnabled(): boolean {
    return process.env.NEXT_PUBLIC_TELEMETRY_ENABLED === "true"
        || (process.env.NODE_ENV === "production" && process.env.NEXT_PUBLIC_TELEMETRY_ENABLED !== "false");
}

export function reportClientCrash(error: unknown, source: ClientErrorSource): void {
    if (typeof window === "undefined" || !telemetryEnabled() || sentCount >= 10) return;
    const report = createCrashReport(error, source, window.location.pathname);
    const key = `${report.message}:${report.stack}:${report.path}:${report.digest}`;
    if (reported.has(key)) return;
    reported.add(key);
    sentCount++;
    // Reporting failures must never generate another error or interrupt the page.
    void fetch("/api/telemetry/crash", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(report),
        keepalive: true,
    }).catch(() => {});
}
