import {afterEach, beforeEach, describe, expect, it, vi} from "vitest";

const authentication = vi.hoisted(() => ({token: vi.fn(async () => ({token: "private-access-token"})), create: vi.fn(), adcToken: vi.fn(async () => "private-adc-token"), adcCreate: vi.fn()}));
vi.mock("google-auth-library", () => ({GoogleAuth: class {
    constructor(options: unknown) { authentication.adcCreate(options); }
    getAccessToken = authentication.adcToken;
    async getClient() { return {quotaProjectId: "adamant-3eada"}; }
}, JWT: class {
    constructor(options: unknown) { authentication.create(options); }
    getAccessToken = authentication.token;
}}));

function report(dimensions: string[], metrics: string[], values: (string | number)[][]) {
    return {dimensionHeaders: dimensions.map((name) => ({name})), metricHeaders: metrics.map((name) => ({name})),
        rows: values.map((row) => ({dimensionValues: row.slice(0, dimensions.length).map((value) => ({value: String(value)})), metricValues: row.slice(dimensions.length).map((value) => ({value: String(value)}))})),
        metadata: {timeZone: "America/Los_Angeles"}};
}
const main = {reports: [
    report([], ["totalUsers", "sessions", "screenPageViews", "engagementRate"], [[3, 5, 10, .8]]),
    report(["date"], ["totalUsers", "sessions", "screenPageViews"], [["20260913", 3, 3, 6], ["20260914", 3, 2, 4]]),
    report(["pagePath"], ["screenPageViews", "totalUsers"], [["/services", 6, 3]]),
    report(["sessionDefaultChannelGroup"], ["sessions"], [["Organic Search", 5]]),
    report(["country"], ["totalUsers"], [["India", 3]]),
]};
const detail = {reports: [
    report(["deviceCategory"], ["totalUsers"], [["mobile", 3]]),
    report(["eventName"], ["eventCount"], [["contact_click", 2], ["generate_lead", 1]]),
]};

describe("Google Analytics server reports", () => {
    beforeEach(() => {
        vi.resetModules(); vi.clearAllMocks();
        vi.useFakeTimers(); vi.setSystemTime(new Date("2026-09-15T01:00:00Z"));
        vi.stubEnv("GOOGLE_ANALYTICS_PROPERTY_ID", "123456789");
        vi.stubEnv("GOOGLE_ANALYTICS_AUTH_MODE", "service-account");
        vi.stubEnv("GOOGLE_ANALYTICS_STREAM_ID", "");
        vi.stubEnv("GOOGLE_ANALYTICS_SERVICE_ACCOUNT_JSON", JSON.stringify({type: "service_account", client_email: "analytics@example.iam.gserviceaccount.com", private_key: "-----BEGIN PRIVATE KEY-----\nprivate-server-key\n-----END PRIVATE KEY-----"}));
        authentication.token.mockResolvedValue({token: "private-access-token"});
        authentication.adcToken.mockResolvedValue("private-adc-token");
        vi.stubGlobal("fetch", vi.fn().mockImplementation(async (url, options) => {
            const body = JSON.parse(options.body);
            const result = String(url).endsWith(":runRealtimeReport") ? report(["platform"], ["activeUsers"], [["web", 2]]) : body.requests.length === 5 ? main : detail;
            return new Response(JSON.stringify(result), {status: 200});
        }));
    });
    afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); vi.unstubAllEnvs(); vi.restoreAllMocks(); });

    it("returns Google's distinct period users and property-local dates, rather than summing daily users", async () => {
        const {getWebsiteAnalytics} = await import("@/lib/crm/website-analytics");
        const result = await getWebsiteAnalytics(7);
        expect(result.report?.totals).toEqual({users: 3, sessions: 5, pageViews: 10, engagementRate: .8});
        expect(result.report?.startDate).toBe("2026-09-07");
        expect(result.report?.endDate).toBe("2026-09-13");
        expect(result.report?.daily).toHaveLength(7);
        expect(result.report?.daily[6]).toEqual({date: "2026-09-13", users: 3, sessions: 3, pageViews: 6});
        expect(result.report?.channels).toEqual([{name: "Organic Search", sessions: 5}]);
        expect(result.report?.realtime).toEqual({users: 2, scope: "property-web"});
        expect(JSON.stringify(result)).not.toMatch(/private-server-key|private-access-token/);
        expect(authentication.create).toHaveBeenCalledWith(expect.objectContaining({scopes: ["https://www.googleapis.com/auth/analytics.readonly"]}));
        const body = JSON.parse(String(vi.mocked(fetch).mock.calls[0][1]?.body));
        expect(body.requests).toHaveLength(5);
        expect(body.requests[0].dateRanges).toEqual([{startDate: "7daysAgo", endDate: "yesterday"}]);
        expect(JSON.stringify(body)).toContain("theadamant.com");
        expect(JSON.stringify(body)).toContain("notExpression");
    });

    it("uses ADC when explicitly selected without requiring a service-account key", async () => {
        vi.stubEnv("GOOGLE_ANALYTICS_AUTH_MODE", "adc");
        vi.stubEnv("GOOGLE_ANALYTICS_SERVICE_ACCOUNT_JSON", "");
        const {getWebsiteAnalytics} = await import("@/lib/crm/website-analytics");
        const result = await getWebsiteAnalytics(30);
        expect(result.connection).toMatchObject({configured: true, authMode: "adc", serviceAccountEmail: null});
        expect(result.report?.totals.users).toBe(3);
        expect(authentication.create).not.toHaveBeenCalled();
        expect(authentication.adcCreate).toHaveBeenCalledWith(expect.objectContaining({scopes: ["https://www.googleapis.com/auth/analytics.readonly"]}));
        expect(vi.mocked(fetch).mock.calls[0][1]?.headers).toMatchObject({Authorization: "Bearer private-adc-token"});
        expect(vi.mocked(fetch).mock.calls[0][1]?.headers).toMatchObject({"x-goog-user-project": "adamant-3eada"});
        expect(JSON.stringify(result)).not.toContain("private-adc-token");
    });

    it("returns an actionable ADC login failure without exposing credential errors", async () => {
        vi.stubEnv("GOOGLE_ANALYTICS_AUTH_MODE", "adc");
        vi.stubEnv("GOOGLE_ANALYTICS_SERVICE_ACCOUNT_JSON", "");
        authentication.adcToken.mockRejectedValueOnce(new Error("private-refresh-token"));
        const {getWebsiteAnalytics} = await import("@/lib/crm/website-analytics");
        await expect(getWebsiteAnalytics(30)).rejects.toThrow("gcloud auth application-default login");
        expect(fetch).not.toHaveBeenCalled();
    });

    it("coalesces simultaneous requests and caches a period for one minute", async () => {
        const {getWebsiteAnalytics} = await import("@/lib/crm/website-analytics");
        const [first, second] = await Promise.all([getWebsiteAnalytics(30), getWebsiteAnalytics(30)]);
        expect(first).toBe(second);
        expect(fetch).toHaveBeenCalledTimes(3);
        await getWebsiteAnalytics(30);
        expect(fetch).toHaveBeenCalledTimes(3);
        vi.advanceTimersByTime(60_001);
        await getWebsiteAnalytics(30);
        expect(fetch).toHaveBeenCalledTimes(6);
    });

    it("shows an unconnected state for missing/invalid credentials without making external calls", async () => {
        const {getWebsiteAnalytics} = await import("@/lib/crm/website-analytics");
        vi.stubEnv("GOOGLE_ANALYTICS_PROPERTY_ID", "G-GTL1BQJ71E");
        expect(await getWebsiteAnalytics(30)).toMatchObject({connection: {configured: false, propertyId: null}, report: null});
        vi.stubEnv("GOOGLE_ANALYTICS_PROPERTY_ID", "123456789");
        vi.stubEnv("GOOGLE_ANALYTICS_SERVICE_ACCOUNT_JSON", "invalid-json");
        expect(await getWebsiteAnalytics(30)).toMatchObject({connection: {configured: false, serviceAccountEmail: null}, report: null});
        expect(fetch).not.toHaveBeenCalled();
        expect(authentication.create).not.toHaveBeenCalled();
    });

    it("scopes realtime to a configured stream and rejects a measurement ID used as a stream ID", async () => {
        const {getWebsiteAnalytics} = await import("@/lib/crm/website-analytics");
        vi.stubEnv("GOOGLE_ANALYTICS_STREAM_ID", "987654321");
        expect((await getWebsiteAnalytics(30)).report?.realtime?.scope).toBe("stream");
        const realtimeCall = vi.mocked(fetch).mock.calls.find(([url]) => String(url).endsWith(":runRealtimeReport"));
        expect(String(realtimeCall?.[1]?.body)).toContain("987654321");
        vi.stubEnv("GOOGLE_ANALYTICS_STREAM_ID", "G-GTL1BQJ71E");
        await expect(getWebsiteAnalytics(30)).rejects.toThrow("numeric web Stream ID");
    });

    it("keeps historical data when realtime is unavailable", async () => {
        vi.mocked(fetch).mockImplementation(async (url, options) => {
            if (String(url).endsWith(":runRealtimeReport")) return new Response("{}", {status: 503});
            return new Response(JSON.stringify(JSON.parse(String(options?.body)).requests.length === 5 ? main : detail));
        });
        const {getWebsiteAnalytics} = await import("@/lib/crm/website-analytics");
        expect((await getWebsiteAnalytics(30)).report).toMatchObject({totals: {users: 3}, realtime: null});
    });

    it("distinguishes access/quota failures from real zero activity and does not expose provider secrets", async () => {
        const {getWebsiteAnalytics} = await import("@/lib/crm/website-analytics");
        vi.mocked(fetch).mockResolvedValue(new Response(JSON.stringify({error: "private-server-key private-access-token"}), {status: 403}));
        await expect(getWebsiteAnalytics(30)).rejects.toThrow("Viewer access");
        vi.mocked(fetch).mockResolvedValue(new Response("{}", {status: 429}));
        await expect(getWebsiteAnalytics(30)).rejects.toThrow("quota");
        authentication.token.mockRejectedValueOnce(new Error("private-server-key"));
        await expect(getWebsiteAnalytics(30)).rejects.toThrow("authentication failed");
        vi.mocked(fetch).mockImplementation(async (url, options) => {
            const source = String(url).endsWith(":runRealtimeReport") ? {rows: []} : JSON.parse(String(options?.body)).requests.length === 5 ? main : detail;
            return new Response(JSON.stringify("reports" in source ? {reports: source.reports.map((report) => ({...report, rows: []}))} : source));
        });
        expect((await getWebsiteAnalytics(30)).report?.totals).toEqual({users: 0, sessions: 0, pageViews: 0, engagementRate: 0});
    });
});
