import {afterEach, beforeEach, describe, expect, it, vi} from "vitest";

describe("Google Ads contact conversions", () => {
    beforeEach(() => {
        vi.resetModules();
        vi.useFakeTimers();
        vi.stubEnv("NEXT_PUBLIC_TELEMETRY_ENABLED", "true");
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.unstubAllGlobals();
        vi.unstubAllEnvs();
    });

    it("sends the supplied CONTACT event with Google's callback timeout", async () => {
        const gtag = vi.fn();
        vi.stubGlobal("window", {gtag, setTimeout, clearTimeout});
        const {GOOGLE_ADS_CONTACT_EVENT, GOOGLE_ADS_EVENT_TIMEOUT_MS, sendGoogleAdsContactConversion} = await import("@/lib/google-tag-manager");
        const completed = vi.fn();

        sendGoogleAdsContactConversion(completed);

        expect(gtag).toHaveBeenCalledOnce();
        expect(gtag).toHaveBeenCalledWith("event", GOOGLE_ADS_CONTACT_EVENT, expect.objectContaining({
            event_callback: expect.any(Function),
            event_timeout: GOOGLE_ADS_EVENT_TIMEOUT_MS,
        }));

        gtag.mock.calls[0][2].event_callback();
        expect(completed).toHaveBeenCalledOnce();
    });

    it("does not block navigation when telemetry or the Google tag is unavailable", async () => {
        const gtag = vi.fn();
        vi.stubGlobal("window", {gtag, setTimeout, clearTimeout});
        vi.stubEnv("NEXT_PUBLIC_TELEMETRY_ENABLED", "false");
        const {sendGoogleAdsContactConversion} = await import("@/lib/google-tag-manager");
        const completed = vi.fn();

        sendGoogleAdsContactConversion(completed);

        expect(gtag).not.toHaveBeenCalled();
        expect(completed).toHaveBeenCalledOnce();
    });

    it("falls back after two seconds when a blocked tag never invokes its callback", async () => {
        const gtag = vi.fn();
        vi.stubGlobal("window", {gtag, setTimeout, clearTimeout});
        const {GOOGLE_ADS_EVENT_TIMEOUT_MS, sendGoogleAdsContactConversion} = await import("@/lib/google-tag-manager");
        const completed = vi.fn();

        sendGoogleAdsContactConversion(completed);
        await vi.advanceTimersByTimeAsync(GOOGLE_ADS_EVENT_TIMEOUT_MS);

        expect(completed).toHaveBeenCalledOnce();
    });
});
