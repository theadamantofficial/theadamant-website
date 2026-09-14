export const GOOGLE_TAG_MANAGER_ID = "GTM-PFTRSVCF";

// Match the public Firebase Analytics environment switch.
export function googleTagManagerEnabled(): boolean {
    return process.env.NEXT_PUBLIC_TELEMETRY_ENABLED === "true"
        || (process.env.NODE_ENV === "production" && process.env.NEXT_PUBLIC_TELEMETRY_ENABLED !== "false");
}

export const googleTagManagerScript = `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${GOOGLE_TAG_MANAGER_ID}');`;
