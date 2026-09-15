export const GOOGLE_TAG_MANAGER_ID = "GTM-PFTRSVCF";
export const GOOGLE_ADS_CONTACT_EVENT = "conversion_event_contact";
export const GOOGLE_ADS_EVENT_TIMEOUT_MS = 2000;

type GoogleTagEventParameters = {
    event_callback: () => void;
    event_timeout: number;
};

declare global {
    interface Window {
        gtag?: (command: "event", eventName: string, parameters: GoogleTagEventParameters) => void;
    }
}

// Match the public Firebase Analytics environment switch.
export function googleTagManagerEnabled(): boolean {
    return process.env.NEXT_PUBLIC_TELEMETRY_ENABLED === "true"
        || (process.env.NODE_ENV === "production" && process.env.NEXT_PUBLIC_TELEMETRY_ENABLED !== "false");
}

export const googleTagManagerScript = `(function(w,d,s,l,i){w[l]=w[l]||[];w.gtag=w.gtag||function(){w[l].push(arguments);};w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${GOOGLE_TAG_MANAGER_ID}');`;

/**
 * Reports the Google Ads CONTACT conversion and optionally waits for it before
 * continuing an in-page navigation. The local timeout keeps navigation working
 * even when an extension blocks the Google tag before it can run its callback.
 */
export function sendGoogleAdsContactConversion(onComplete?: () => void): void {
    if (typeof window === "undefined") return;

    let completed = false;
    let fallbackTimeout: number | undefined;
    const callback = () => {
        if (completed) return;
        completed = true;
        if (fallbackTimeout !== undefined) window.clearTimeout(fallbackTimeout);
        onComplete?.();
    };

    if (!googleTagManagerEnabled() || typeof window.gtag !== "function") {
        callback();
        return;
    }

    if (onComplete) fallbackTimeout = window.setTimeout(callback, GOOGLE_ADS_EVENT_TIMEOUT_MS);

    try {
        window.gtag("event", GOOGLE_ADS_CONTACT_EVENT, {
            event_callback: callback,
            event_timeout: GOOGLE_ADS_EVENT_TIMEOUT_MS,
        });
    } catch {
        callback();
    }
}

/** Google Ads' delayed-navigation helper, adapted for client-side React usage. */
export function gtagSendEvent(url?: string): false {
    sendGoogleAdsContactConversion(typeof url === "string"
        ? () => window.location.assign(url)
        : undefined);
    return false;
}
