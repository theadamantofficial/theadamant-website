import {afterEach, beforeEach, describe, expect, it, vi} from "vitest";

describe("browser and Next.js error capture", () => {
    beforeEach(() => {
        vi.resetModules();
        vi.stubEnv("NEXT_PUBLIC_TELEMETRY_ENABLED", "true");
        vi.stubEnv("DISCORD_CRASH_WEBHOOK_URL", "https://discord.com/api/webhooks/123456/test-webhook-token");
        vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("{}", {status: 200})));
    });
    afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); vi.restoreAllMocks(); });

    it("installs listeners before hydration and groups the same browser/React error", async () => {
        const listeners = new Map<string, (event: Record<string, unknown>) => void>();
        vi.stubGlobal("window", {
            location: {pathname: "/services", search: "?token=private"},
            addEventListener: (name: string, listener: (event: Record<string, unknown>) => void) => listeners.set(name, listener),
        });
        await import("@/instrumentation-client");
        const error = new Error("Studio failed");
        listeners.get("error")?.({message: error.message, error});
        const {reportClientCrash} = await import("@/lib/telemetry/client");
        reportClientCrash(error, "react-boundary");
        listeners.get("unhandledrejection")?.({reason: new Error("Request failed")});
        expect(fetch).toHaveBeenCalledTimes(2);
        const payload = JSON.parse(String(vi.mocked(fetch).mock.calls[0][1]?.body));
        expect(payload).toMatchObject({source: "browser-error", path: "/services"});
        expect(JSON.stringify(payload)).not.toContain("token=private");
        vi.mocked(fetch).mockRejectedValueOnce(new Error("Network unavailable"));
        expect(() => reportClientCrash(new Error("Another failure"), "browser-error")).not.toThrow();
        await Promise.resolve();
    });

    it("awaits uncaught server error delivery, groups the React digest, and skips its own endpoint", async () => {
        const {onRequestError} = await import("@/instrumentation");
        const error = Object.assign(new Error("Server failed"), {digest: "server-reference"});
        const request = {path: "/blog?token=private", method: "GET", headers: {authorization: "private-header"}};
        const context = {routerKind: "App Router" as const, routePath: "/blog/[slug]", routeType: "render" as const, revalidateReason: undefined};
        await onRequestError(error, request, context);
        expect(fetch).toHaveBeenCalledOnce();
        const payload = JSON.parse(String(vi.mocked(fetch).mock.calls[0][1]?.body));
        expect(payload.embeds[0].title).toContain("server");
        expect(JSON.stringify(payload)).not.toContain("private-header");
        expect(JSON.stringify(payload)).not.toContain("token=private");
        const {notifyDiscordCrash} = await import("@/lib/telemetry/discord.server");
        const {createCrashReport} = await import("@/lib/telemetry/report");
        expect(await notifyDiscordCrash(createCrashReport(error, "react-boundary", "/blog/article"))).toBe("suppressed");
        await onRequestError(new Error("Reporting failed"), {...request, path: "/api/telemetry/crash"}, context);
        expect(fetch).toHaveBeenCalledOnce();
    });
});
