import {afterEach, beforeEach, describe, expect, it, vi} from "vitest";

const sdk = vi.hoisted(() => ({
    getApps: vi.fn(() => []), initializeApp: vi.fn(() => ({name: "adamant-website"})),
    isSupported: vi.fn(async () => true), initializeAnalytics: vi.fn(() => ({app: {}})), logEvent: vi.fn(),
}));
vi.mock("firebase/app", () => ({getApps: sdk.getApps, initializeApp: sdk.initializeApp}));
vi.mock("firebase/analytics", () => ({isSupported: sdk.isSupported, initializeAnalytics: sdk.initializeAnalytics, logEvent: sdk.logEvent}));

describe("Firebase web analytics", () => {
    beforeEach(() => {
        vi.resetModules(); vi.clearAllMocks();
        sdk.isSupported.mockResolvedValue(true);
        vi.stubEnv("NEXT_PUBLIC_TELEMETRY_ENABLED", "true");
        vi.stubGlobal("window", {location: {origin: "https://theadamant.com", pathname: "/", search: "?token=private", hash: "#services"}});
    });
    afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });

    it("initializes the supplied property once and sends manual page views without raw URLs", async () => {
        const {trackSiteEvent, firebaseConfig} = await import("@/lib/firebase-analytics");
        await Promise.all([trackSiteEvent("page_view", {page_path: "/"}), trackSiteEvent("contact_click", {method: "whatsapp"})]);
        expect(sdk.initializeApp).toHaveBeenCalledOnce();
        expect(firebaseConfig.measurementId).toBe("G-GTL1BQJ71E");
        expect(sdk.initializeAnalytics).toHaveBeenCalledWith(expect.anything(), {config: expect.objectContaining({send_page_view: false, page_location: "https://theadamant.com/", page_referrer: ""})});
        expect(sdk.logEvent).toHaveBeenCalledTimes(2);
    });

    it("does not initialize Analytics for admin pages or unsupported browsers", async () => {
        const {trackSiteEvent} = await import("@/lib/firebase-analytics");
        window.location.pathname = "/admin/leads";
        await trackSiteEvent("page_view");
        expect(sdk.isSupported).not.toHaveBeenCalled();
        window.location.pathname = "/";
        sdk.isSupported.mockResolvedValue(false);
        await trackSiteEvent("page_view");
        expect(sdk.initializeAnalytics).not.toHaveBeenCalled();
        expect(sdk.logEvent).not.toHaveBeenCalled();
    });

    it("does not initialize when disabled, and safely ignores SDK failures", async () => {
        const {trackSiteEvent} = await import("@/lib/firebase-analytics");
        vi.stubEnv("NEXT_PUBLIC_TELEMETRY_ENABLED", "false");
        await trackSiteEvent("page_view");
        expect(sdk.isSupported).not.toHaveBeenCalled();
        vi.stubEnv("NEXT_PUBLIC_TELEMETRY_ENABLED", "true");
        sdk.isSupported.mockRejectedValueOnce(new Error("Browser storage blocked"));
        await expect(trackSiteEvent("page_view")).resolves.toBeUndefined();
        expect(sdk.logEvent).not.toHaveBeenCalled();
    });

    it("preserves referral domains for traffic reports without forwarding their paths or queries", async () => {
        vi.stubGlobal("document", {referrer: "https://www.google.com/search?q=private-query#fragment"});
        const {getAnalyticsReferrer, trackSiteEvent} = await import("@/lib/firebase-analytics");
        expect(getAnalyticsReferrer()).toBe("https://www.google.com");
        await trackSiteEvent("page_view");
        expect(sdk.initializeAnalytics).toHaveBeenCalledWith(expect.anything(), {config: expect.objectContaining({page_referrer: "https://www.google.com"})});
        expect(JSON.stringify(sdk.initializeAnalytics.mock.calls)).not.toContain("private-query");
    });

    it("attributes contact events to their originating page with a sanitized location", async () => {
        const {trackSiteEvent} = await import("@/lib/firebase-analytics");
        window.location.pathname = "/website-development";
        const event = trackSiteEvent("contact_click", {method: "whatsapp", page_location: "https://theadamant.com/?token=private"});
        window.location.pathname = "/blog";
        await event;
        expect(sdk.logEvent).toHaveBeenCalledWith(expect.anything(), "contact_click", {
            method: "whatsapp", page_path: "/website-development", page_location: "https://theadamant.com/website-development",
        });
    });
});
