export const CLIENT_ERROR_SOURCES = ["browser-error", "unhandled-rejection", "react-boundary"] as const;
export type ClientErrorSource = typeof CLIENT_ERROR_SOURCES[number];
export type ErrorSource = ClientErrorSource | "server";

export interface CrashReport {
    source: ErrorSource;
    message: string;
    stack: string;
    path: string;
    digest: string;
}

/** Never include URL queries/fragments, email addresses, or common credentials. */
export function redactDiagnostic(value: string, maxLength: number): string {
    return value.slice(0, 12_000)
        .replace(/https?:\/\/[^\s<>"'`]+/gi, (raw) => {
            try {
                const url = new URL(raw);
                if (/\/api(?:\/v\d+)?\/webhooks\//.test(url.pathname)) return "[webhook redacted]";
                return `${url.origin}${url.pathname}`;
            } catch { return "[URL redacted]"; }
        })
        .replace(/\bBearer\s+\S+/gi, "Bearer [redacted]")
        .replace(/(\/[^\s<>"'`?]*)\?[^\s<>"'`]+/g, "$1")
        .replace(/((?:access[_-]?token|refresh[_-]?token|token|api[_-]?key|password|authorization|secret)["']?\s*[=:]\s*)["']?[^\s,"';]+/gi, "$1[redacted]")
        .replace(/\bAIza[\w-]+\b/g, "[key redacted]")
        .replace(/\beyJ[\w-]+\.[\w-]+\.[\w-]+\b/g, "[token redacted]")
        .replace(/[\w.+-]+@[\w.-]+\.[a-z]{2,}/gi, "[email redacted]")
        .replace(/\u0000/g, "")
        .slice(0, maxLength);
}

export function diagnosticPath(value: string): string {
    try {
        const url = new URL(value, "https://theadamant.com");
        return redactDiagnostic(url.pathname, 300);
    } catch { return "/"; }
}

export function createCrashReport(error: unknown, source: ErrorSource, path: string): CrashReport {
    const instance = error instanceof Error ? error : null;
    const digest = instance && "digest" in instance && typeof instance.digest === "string" ? instance.digest : "";
    return {
        source,
        message: redactDiagnostic(instance?.message || (typeof error === "string" ? error : "Unknown error"), 600),
        stack: redactDiagnostic(instance?.stack || "", 2400),
        path: diagnosticPath(path),
        digest: redactDiagnostic(digest, 100),
    };
}

export function parseClientCrashReport(value: unknown): CrashReport | null {
    if (!value || typeof value !== "object") return null;
    const fields = value as Record<string, unknown>;
    if (!CLIENT_ERROR_SOURCES.includes(fields.source as ClientErrorSource)
        || typeof fields.message !== "string" || !fields.message.trim()
        || typeof fields.path !== "string") return null;
    return {
        source: fields.source as ClientErrorSource,
        message: redactDiagnostic(fields.message, 600),
        stack: redactDiagnostic(typeof fields.stack === "string" ? fields.stack : "", 2400),
        path: diagnosticPath(fields.path),
        digest: redactDiagnostic(typeof fields.digest === "string" ? fields.digest : "", 100),
    };
}
