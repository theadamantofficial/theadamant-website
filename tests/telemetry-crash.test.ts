import {afterEach, beforeEach, describe, expect, it, vi} from "vitest";
import {NextRequest} from "next/server";
import {createCrashReport, diagnosticPath, parseClientCrashReport, redactDiagnostic} from "@/lib/telemetry/report";

const sample = {source: "browser-error", message: "Studio failed to render", stack: "Error at https://theadamant.com/_next/static/studio.js?token=private:12:4", path: "/#services", digest: ""};

describe("crash diagnostics", () => {
    it("strips queries, credentials, email addresses, and Discord webhook tokens", () => {
        const diagnostic = redactDiagnostic('Failed https://user:password@example.com/file.js?email=person@example.com#token Bearer private-token {"access_token": "private-access"} apiKey=private-key person@example.com https://discord.com/api/webhooks/123/private-webhook', 2400);
        expect(diagnostic).toContain("https://example.com/file.js");
        for (const secret of ["user:password", "private-token", "private-access", "private-key", "person@example.com", "private-webhook"]) {
            expect(diagnostic).not.toContain(secret);
        }
        expect(redactDiagnostic("GET /api/example?name=private-name", 600)).not.toContain("private-name");
        expect(diagnosticPath("/services?email=person@example.com#services")).toBe("/services");
    });

    it("rejects client claims to be a trusted server report and malformed fields", () => {
        expect(parseClientCrashReport({...sample, source: "server"})).toBeNull();
        expect(parseClientCrashReport({...sample, message: {secret: "private"}})).toBeNull();
        expect(parseClientCrashReport(null)).toBeNull();
        expect(parseClientCrashReport({...sample, message: "x".repeat(10_000)})?.message).toHaveLength(600);
    });

    it("preserves Next.js error references without serializing arbitrary rejection objects", () => {
        const error = Object.assign(new Error("Render failed"), {digest: "reference-123"});
        expect(createCrashReport(error, "server", "/blog?token=private")).toMatchObject({digest: "reference-123", path: "/blog"});
        expect(createCrashReport({password: "private"}, "unhandled-rejection", "/").message).toBe("Unknown error");
    });
});

describe("crash notification endpoint", () => {
    beforeEach(() => {
        vi.resetModules();
        vi.stubEnv("NEXT_PUBLIC_TELEMETRY_ENABLED", "true");
        vi.stubEnv("DISCORD_CRASH_WEBHOOK_URL", "https://discord.com/api/webhooks/123456/test-webhook-token");
        vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("{}", {status: 200})));
    });
    afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); vi.restoreAllMocks(); });

    function request(body: unknown, origin = "https://theadamant.com") {
        return new NextRequest("https://theadamant.com/api/telemetry/crash", {
            method: "POST",
            headers: {origin, "Content-Type": "application/json"},
            body: JSON.stringify(body),
        });
    }

    it("delivers a sanitized Discord embed and suppresses duplicate errors", async () => {
        const {POST} = await import("@/app/api/telemetry/crash/route");
        const response = await POST(request(sample));
        expect(response.status).toBe(202);
        expect(await response.json()).toMatchObject({notification: "sent"});
        const [url, options] = vi.mocked(fetch).mock.calls[0];
        expect(String(url)).toContain("wait=true");
        const payload = JSON.parse(String(options?.body));
        expect(payload.allowed_mentions).toEqual({parse: []});
        expect(JSON.stringify(payload)).not.toContain("token=private");
        expect((await POST(request(sample))).status).toBe(202);
        expect(fetch).toHaveBeenCalledTimes(1);
    });

    it("rejects foreign origins, invalid JSON, and oversized streamed bodies without posting", async () => {
        const {POST} = await import("@/app/api/telemetry/crash/route");
        expect((await POST(request(sample, "https://another-site.com"))).status).toBe(403);
        expect((await POST(request({...sample, source: "server"}))).status).toBe(400);
        expect((await POST(request({...sample, message: "x".repeat(20_000)}))).status).toBe(413);
        const malformed = new NextRequest("https://theadamant.com/api/telemetry/crash", {
            method: "POST", headers: {origin: "https://theadamant.com", "Content-Type": "application/json"}, body: "{",
        });
        expect((await POST(malformed)).status).toBe(400);
        expect(fetch).not.toHaveBeenCalled();
    });

    it("limits clients and caps unique Discord alerts per server instance", async () => {
        const {POST} = await import("@/app/api/telemetry/crash/route");
        for (let index = 0; index < 10; index++) await POST(request({...sample, message: `Error ${index}`}));
        expect((await POST(request({...sample, message: "Another error"}))).status).toBe(429);
        expect(fetch).toHaveBeenCalledTimes(10);
        const {notifyDiscordCrash} = await import("@/lib/telemetry/discord.server");
        for (let index = 10; index < 30; index++) await notifyDiscordCrash(createCrashReport(`Error ${index}`, "server", "/"));
        expect(fetch).toHaveBeenCalledTimes(20);
    });

    it("handles Discord failure without logging the webhook token", async () => {
        const log = vi.spyOn(console, "error").mockImplementation(() => {});
        vi.mocked(fetch).mockRejectedValue(new Error("Request failed https://discord.com/api/webhooks/123456/test-webhook-token"));
        const {POST} = await import("@/app/api/telemetry/crash/route");
        expect((await POST(request(sample))).status).toBe(502);
        expect(JSON.stringify(log.mock.calls)).not.toContain("test-webhook-token");
    });

    it("does not post when disabled or the webhook is absent or outside Discord", async () => {
        const {POST} = await import("@/app/api/telemetry/crash/route");
        for (const webhook of ["", "https://example.com/api/webhooks/123456/token"]) {
            vi.stubEnv("DISCORD_CRASH_WEBHOOK_URL", webhook);
            expect(await (await POST(request(sample))).json()).toMatchObject({notification: "disabled"});
        }
        vi.stubEnv("DISCORD_CRASH_WEBHOOK_URL", "https://discord.com/api/webhooks/123456/test-webhook-token");
        vi.stubEnv("NEXT_PUBLIC_TELEMETRY_ENABLED", "false");
        expect(await (await POST(request(sample))).json()).toMatchObject({notification: "disabled"});
        expect(fetch).not.toHaveBeenCalled();
    });
});
