import {NextRequest, NextResponse} from "next/server";
import {
    DEFAULT_SITE_LOCALE,
    detectPreferredSiteLocale,
    getLocalizedPagePath,
    isSiteLocale,
    SITE_LOCALE_COOKIE,
} from "@/lib/site-locale";

const CRAWLER_PATTERN = /(bot|crawler|spider|slurp|baiduspider|bingpreview|facebookexternalhit|google-inspectiontool)/i;

function getLocalizedRoute(pathname: string, locale: ReturnType<typeof detectPreferredSiteLocale>) {
    if (pathname === "/") {
        return getLocalizedPagePath(locale);
    }

    if (pathname === "/blog") {
        return getLocalizedPagePath(locale, "blog");
    }

    return null;
}

export function middleware(request: NextRequest) {
    const {pathname} = request.nextUrl;
    const requestHeaders = new Headers(request.headers);
    const pathLocale = pathname.split("/").filter(Boolean)[0];
    requestHeaders.set(
        "x-site-locale",
        pathLocale && isSiteLocale(pathLocale) ? pathLocale : DEFAULT_SITE_LOCALE,
    );
    const continueRequest = () => NextResponse.next({request: {headers: requestHeaders}});

    if (pathname.startsWith("/_next") || pathname.startsWith("/api") || pathname.startsWith("/admin")) {
        return continueRequest();
    }

    if (pathname !== "/" && pathname !== "/blog") {
        return continueRequest();
    }

    if (request.cookies.has(SITE_LOCALE_COOKIE)) {
        return continueRequest();
    }

    const userAgent = request.headers.get("user-agent") ?? "";
    if (CRAWLER_PATTERN.test(userAgent)) {
        return continueRequest();
    }

    const locale = detectPreferredSiteLocale({
        countryCode: request.headers.get("x-vercel-ip-country")
            ?? request.headers.get("cf-ipcountry"),
        acceptLanguage: request.headers.get("accept-language"),
    });

    if (locale === DEFAULT_SITE_LOCALE || isSiteLocale(pathname.slice(1))) {
        return continueRequest();
    }

    const destination = request.nextUrl.clone();
    destination.pathname = getLocalizedRoute(pathname, locale) ?? pathname;

    const response = NextResponse.redirect(destination);
    response.cookies.set(SITE_LOCALE_COOKIE, locale, {
        httpOnly: false,
        maxAge: 60 * 60 * 24 * 365,
        path: "/",
        sameSite: "lax",
        secure: request.nextUrl.protocol === "https:",
    });
    response.headers.set("Vary", "Accept-Language, x-vercel-ip-country, cf-ipcountry, Cookie");
    return response;
}

export const config = {
    matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
