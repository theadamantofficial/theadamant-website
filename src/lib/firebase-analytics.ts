import {telemetryEnabled} from "@/lib/telemetry/client";
import {diagnosticPath} from "@/lib/telemetry/report";

// Firebase web configuration is public. Server credentials never belong here.
export const firebaseConfig = {
    apiKey: "AIzaSyBtVrKsDv_K3MH3uoBiw59yM4mT4pis5mM",
    authDomain: "adamant-3eada.firebaseapp.com",
    databaseURL: "https://adamant-3eada-default-rtdb.firebaseio.com",
    projectId: "adamant-3eada",
    storageBucket: "adamant-3eada.firebasestorage.app",
    messagingSenderId: "764806881549",
    appId: "1:764806881549:web:6b5daea203034db1449044",
    measurementId: "G-GTL1BQJ71E",
};

let analyticsPromise: Promise<{
    analytics: import("firebase/analytics").Analytics;
    logEvent: typeof import("firebase/analytics").logEvent;
} | null> | undefined;

export function isPublicAnalyticsPath(path: string): boolean {
    return !/(?:^|\/)admin(?:\/|$)|^\/tear-preview(?:\/|$)/.test(path);
}

export function getAnalyticsReferrer(): string {
    if (typeof document === "undefined" || !document.referrer) return "";
    try { return new URL(document.referrer).origin; }
    catch { return ""; }
}

async function getSiteAnalytics() {
    if (typeof window === "undefined" || !telemetryEnabled()) return null;
    if (!analyticsPromise) analyticsPromise = (async () => {
        const [{getApps, initializeApp}, {initializeAnalytics, isSupported, logEvent}] = await Promise.all([
            import("firebase/app"), import("firebase/analytics"),
        ]);
        if (!await isSupported()) return null;
        const app = getApps().find((entry) => entry.name === "adamant-website") || initializeApp(firebaseConfig, "adamant-website");
        const analytics = initializeAnalytics(app, {config: {
            send_page_view: false,
            // Keep automatic events from forwarding form values or raw URLs.
            page_location: `${window.location.origin}${diagnosticPath(window.location.pathname)}`,
            page_referrer: getAnalyticsReferrer(),
            allow_google_signals: false,
            allow_ad_personalization_signals: false,
        }});
        return {analytics, logEvent};
    })().catch(() => null);
    return analyticsPromise;
}

export async function trackSiteEvent(name: "page_view" | "section_view" | "contact_click" | "generate_lead", params: Record<string, string> = {}): Promise<void> {
    if (typeof window === "undefined" || !isPublicAnalyticsPath(window.location.pathname)) return;
    // Capture the originating page before the SDK loads or navigation changes it.
    const path = diagnosticPath(window.location.pathname);
    const eventParams = {...params, page_path: path, page_location: `${window.location.origin}${path}`};
    try {
        const site = await getSiteAnalytics();
        if (!site || !isPublicAnalyticsPath(window.location.pathname)) return;
        switch (name) {
            case "page_view": site.logEvent(site.analytics, "page_view", eventParams); break;
            case "generate_lead": site.logEvent(site.analytics, "generate_lead", eventParams); break;
            default: site.logEvent(site.analytics, name, eventParams);
        }
    } catch { /* Blocked analytics must never affect the website. */ }
}
