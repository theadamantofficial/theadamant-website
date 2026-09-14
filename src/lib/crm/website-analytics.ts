import {createHash} from "node:crypto";
import {GoogleAuth, JWT} from "google-auth-library";
import {CrmApiError} from "@/lib/crm/errors";
import type {AnalyticsConnection, AnalyticsDays, WebsiteAnalytics} from "@/features/crm/analytics/types";
import {diagnosticPath} from "@/lib/telemetry/report";

type GoogleReport = {
    dimensionHeaders?: {name: string}[];
    metricHeaders?: {name: string}[];
    rows?: {dimensionValues?: {value?: string}[]; metricValues?: {value?: string}[]}[];
    metadata?: {timeZone?: string; subjectToThresholding?: boolean; samplingMetadatas?: unknown[]};
};
type ReportRequest = Record<string, unknown>;
type AnalyticsConfig = {connection: AnalyticsConnection; privateKey: string};
const cache = new Map<string, {expires: number; value: WebsiteAnalytics}>();
const pending = new Map<string, Promise<WebsiteAnalytics>>();
let auth: {key: string; client: JWT | GoogleAuth} | undefined;

function getConfig(): AnalyticsConfig {
    const property = process.env.GOOGLE_ANALYTICS_PROPERTY_ID?.trim() || "";
    const stream = process.env.GOOGLE_ANALYTICS_STREAM_ID?.trim() || "";
    const authMode = process.env.GOOGLE_ANALYTICS_AUTH_MODE?.trim() || "service-account";
    if (authMode !== "service-account" && authMode !== "adc") throw new CrmApiError("Choose service-account or adc for GOOGLE_ANALYTICS_AUTH_MODE.", 503);
    if (stream && !/^\d+$/.test(stream)) throw new CrmApiError("GOOGLE_ANALYTICS_STREAM_ID must be a numeric web Stream ID, not a measurement ID.", 503);
    let email = "", privateKey = "";
    try {
        const credentials: unknown = JSON.parse(process.env.GOOGLE_ANALYTICS_SERVICE_ACCOUNT_JSON || "{}");
        if (credentials && typeof credentials === "object") {
            const fields = credentials as Record<string, unknown>;
            if (fields.type === "service_account" && typeof fields.client_email === "string" && typeof fields.private_key === "string"
                && /^[^\s@]+@[^\s@]+\.gserviceaccount\.com$/.test(fields.client_email)
                && fields.private_key.includes("-----BEGIN PRIVATE KEY-----")) {
                email = fields.client_email;
                privateKey = fields.private_key.replace(/\\n/g, "\n");
            }
        }
    } catch { /* Missing or invalid credentials are shown as a connection state. */ }
    return {
        connection: {
            authMode,
            configured: /^\d+$/.test(property) && (authMode === "adc" || Boolean(email && privateKey)),
            propertyId: /^\d+$/.test(property) ? property : null,
            serviceAccountEmail: email || null,
            streamId: /^\d+$/.test(stream) ? stream : null,
        },
        privateKey,
    };
}

export function getAnalyticsConnection(): AnalyticsConnection { return getConfig().connection; }

export function parseAnalyticsDays(value: string | null): AnalyticsDays {
    if (value === null) return 30;
    if (value === "7" || value === "30" || value === "90") return Number(value) as AnalyticsDays;
    throw new CrmApiError("Choose a 7, 30, or 90 day reporting period.", 400);
}

function configKey(config: AnalyticsConfig): string {
    return createHash("sha256").update(`${config.connection.authMode}:${config.connection.propertyId}:${config.connection.streamId}:${config.connection.serviceAccountEmail}:${config.privateKey}:${process.env.GOOGLE_APPLICATION_CREDENTIALS || ""}`).digest("hex");
}

function exact(fieldName: string, value: string) {
    return {filter: {fieldName, stringFilter: {matchType: "EXACT", value, caseSensitive: false}}};
}

function webFilter(connection: AnalyticsConnection, historical: boolean) {
    const expressions: unknown[] = [exact("platform", "web")];
    if (connection.streamId) expressions.push(exact("streamId", connection.streamId));
    if (historical) {
        expressions.push({filter: {fieldName: "hostName", inListFilter: {values: ["theadamant.com", "www.theadamant.com"], caseSensitive: false}}});
        expressions.push({notExpression: {filter: {fieldName: "pagePath", stringFilter: {matchType: "FULL_REGEXP", value: "/(?:[^/]+/)?admin(?:/.*)?", caseSensitive: false}}}});
    }
    return {andGroup: {expressions}};
}

async function googleRequest<T>(property: string, method: "batchRunReports" | "runRealtimeReport", body: ReportRequest, token: string, quotaProject?: string): Promise<T> {
    let response: Response;
    try {
        response = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${property}:${method}`, {
            method: "POST", headers: {Authorization: `Bearer ${token}`, "Content-Type": "application/json", ...(quotaProject ? {"x-goog-user-project": quotaProject} : {})},
            body: JSON.stringify(body), cache: "no-store", signal: AbortSignal.timeout(10_000),
        });
    } catch { throw new CrmApiError("Google Analytics is unavailable right now. Try again shortly.", 502); }
    if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
            throw new CrmApiError("Google Analytics access was denied. Enable the Analytics Data API and grant your signed-in account or service account Viewer access to this property.", 502);
        }
        if (response.status === 429) throw new CrmApiError("Google Analytics report quota was reached. Try again shortly.", 503);
        if (response.status === 404) throw new CrmApiError("The Google Analytics property could not be found. Check the numeric Property ID.", 502);
        throw new CrmApiError("Google Analytics could not load this report. Check the property and reporting configuration.", 502);
    }
    try { return await response.json() as T; }
    catch { throw new CrmApiError("Google Analytics returned an invalid report.", 502); }
}

function rows(report: GoogleReport) {
    return (report.rows || []).map((row) => {
        const dimensions = Object.fromEntries((report.dimensionHeaders || []).map((header, index) => [header.name, row.dimensionValues?.[index]?.value || "(not set)"]));
        const metrics = Object.fromEntries((report.metricHeaders || []).map((header, index) => {
            const number = Number(row.metricValues?.[index]?.value || 0);
            return [header.name, Number.isFinite(number) ? number : 0];
        }));
        return {dimensions, metrics};
    });
}

function reportDates(days: AnalyticsDays, timeZone: string) {
    const parts = new Intl.DateTimeFormat("en", {timeZone, year: "numeric", month: "2-digit", day: "2-digit"}).formatToParts(new Date());
    const value = (name: string) => parts.find((part) => part.type === name)?.value;
    const today = new Date(`${value("year")}-${value("month")}-${value("day")}T00:00:00Z`);
    const dates = Array.from({length: days}, (_, index) => {
        const date = new Date(today);
        date.setUTCDate(date.getUTCDate() - days + index);
        return date.toISOString().slice(0, 10);
    });
    return {startDate: dates[0], endDate: dates[days - 1], dates};
}

async function loadReports(config: AnalyticsConfig, days: AnalyticsDays, key: string): Promise<WebsiteAnalytics> {
    if (auth?.key !== key) {
        const scopes = ["https://www.googleapis.com/auth/analytics.readonly"];
        auth = {key, client: config.connection.authMode === "adc"
            ? new GoogleAuth({scopes, clientOptions: {transporterOptions: {timeout: 10_000, retry: false}}})
            : new JWT({email: config.connection.serviceAccountEmail!, key: config.privateKey, scopes, transporterOptions: {timeout: 10_000, retry: false}})};
    }
    let token: string | null | undefined;
    let quotaProject: string | undefined;
    const authenticationError = config.connection.authMode === "adc"
        ? "Google Analytics authentication failed. Run gcloud auth application-default login with the analytics.readonly scope, then restart the website."
        : "Google Analytics authentication failed. Check the service-account JSON key.";
    try {
        const credential = await auth.client.getAccessToken();
        token = typeof credential === "string" ? credential : credential?.token;
        if (auth.client instanceof GoogleAuth) quotaProject = (await auth.client.getClient()).quotaProjectId;
    } catch { throw new CrmApiError(authenticationError, 502); }
    if (!token) throw new CrmApiError(authenticationError, 502);
    const base = {dateRanges: [{startDate: `${days}daysAgo`, endDate: "yesterday"}], dimensionFilter: webFilter(config.connection, true)};
    const request = (metrics: string[], dimension?: string, limit?: number): ReportRequest => ({
        ...base, metrics: metrics.map((name) => ({name})),
        ...(dimension ? {dimensions: [{name: dimension}]} : {}),
        ...(limit ? {limit: String(limit), orderBys: [{metric: {metricName: metrics[0]}, desc: true}]} : {}),
    });
    const [main, detail, realtime] = await Promise.all([
        googleRequest<{reports: GoogleReport[]}>(config.connection.propertyId!, "batchRunReports", {requests: [
            request(["totalUsers", "sessions", "screenPageViews", "engagementRate"]),
            {...request(["totalUsers", "sessions", "screenPageViews"], "date"), orderBys: [{dimension: {dimensionName: "date"}}], limit: "90"},
            request(["screenPageViews", "totalUsers"], "pagePath", 10),
            request(["sessions"], "sessionDefaultChannelGroup", 10),
            request(["totalUsers"], "country", 10),
        ]}, token, quotaProject),
        googleRequest<{reports: GoogleReport[]}>(config.connection.propertyId!, "batchRunReports", {requests: [
            request(["totalUsers"], "deviceCategory", 10),
            {...request(["eventCount"], "eventName", 10), dimensionFilter: {andGroup: {expressions: [
                base.dimensionFilter, {filter: {fieldName: "eventName", inListFilter: {values: ["contact_click", "generate_lead", "section_view"]}}},
            ]}}},
        ]}, token, quotaProject),
        googleRequest<GoogleReport>(config.connection.propertyId!, "runRealtimeReport", {
            metrics: [{name: "activeUsers"}], dimensions: [{name: "platform"}], dimensionFilter: webFilter(config.connection, false),
        }, token, quotaProject).catch(() => null),
    ]);
    if (!Array.isArray(main.reports) || main.reports.length !== 5 || !Array.isArray(detail.reports) || detail.reports.length !== 2) {
        throw new CrmApiError("Google Analytics returned an unexpected report.", 502);
    }
    const [summary, daily, pages, channels, countries] = main.reports;
    const [devices, events] = detail.reports;
    const timeZone = summary.metadata?.timeZone || "UTC";
    const range = reportDates(days, timeZone);
    const totals = rows(summary)[0]?.metrics || {};
    const dailyRows = new Map(rows(daily).map((row) => [row.dimensions.date, row.metrics]));
    return {connection: config.connection, report: {
        days, startDate: range.startDate, endDate: range.endDate, timeZone, fetchedAt: new Date().toISOString(),
        limitedData: [...main.reports, ...detail.reports].some((report) => report.metadata?.subjectToThresholding || report.metadata?.samplingMetadatas?.length),
        totals: {users: totals.totalUsers || 0, sessions: totals.sessions || 0, pageViews: totals.screenPageViews || 0, engagementRate: totals.engagementRate || 0},
        daily: range.dates.map((date) => {
            const metrics = dailyRows.get(date.replaceAll("-", "")) || {};
            return {date, users: metrics.totalUsers || 0, sessions: metrics.sessions || 0, pageViews: metrics.screenPageViews || 0};
        }),
        pages: rows(pages).map(({dimensions, metrics}) => ({path: diagnosticPath(dimensions.pagePath), views: metrics.screenPageViews || 0, users: metrics.totalUsers || 0})),
        channels: rows(channels).map(({dimensions, metrics}) => ({name: dimensions.sessionDefaultChannelGroup, sessions: metrics.sessions || 0})),
        countries: rows(countries).map(({dimensions, metrics}) => ({name: dimensions.country, users: metrics.totalUsers || 0})),
        devices: rows(devices).map(({dimensions, metrics}) => ({name: dimensions.deviceCategory, users: metrics.totalUsers || 0})),
        events: rows(events).map(({dimensions, metrics}) => ({name: dimensions.eventName, count: metrics.eventCount || 0})),
        realtime: realtime ? {users: rows(realtime).reduce((sum, row) => sum + (row.metrics.activeUsers || 0), 0), scope: config.connection.streamId ? "stream" : "property-web"} : null,
    }};
}

export async function getWebsiteAnalytics(days: AnalyticsDays): Promise<WebsiteAnalytics> {
    const config = getConfig();
    if (!config.connection.configured) return {connection: config.connection, report: null};
    const key = configKey(config);
    const cacheKey = `${key}:${days}`;
    const cached = cache.get(cacheKey);
    if (cached && cached.expires > Date.now()) return cached.value;
    const current = pending.get(cacheKey);
    if (current) return current;
    const promise = loadReports(config, days, key).then((value) => {
        if (cache.size >= 10) cache.delete(cache.keys().next().value!);
        cache.set(cacheKey, {expires: Date.now() + 60_000, value});
        return value;
    }).finally(() => pending.delete(cacheKey));
    pending.set(cacheKey, promise);
    return promise;
}
