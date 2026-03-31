import {NextRequest, NextResponse} from "next/server";
import {
    DEFAULT_SITE_LOCALE,
    detectSiteLocaleFromAcceptLanguage,
    detectSiteLocaleFromCountry,
    getLocaleFromPathname,
    getLocalizedPath,
    isSiteLocale,
    SITE_LOCALE_COOKIE,
    SiteLocale,
} from "@/lib/site-locale";

export function middleware(request: NextRequest) {
    const {pathname} = request.nextUrl;

    const requestHeaders = new Headers(request.headers);
    const currentPathLocale = getLocaleFromPathname(pathname);
    requestHeaders.set("x-site-locale", currentPathLocale);

    const responseForLocalePath = pathname !== "/"
        && pathname.split("/").filter(Boolean).length > 0
        && isSiteLocale(pathname.split("/").filter(Boolean)[0]);

    if (responseForLocalePath) {
        const response = NextResponse.next({
            request: {
                headers: requestHeaders,
            },
        });

        response.cookies.set(SITE_LOCALE_COOKIE, currentPathLocale, {
            path: "/",
            maxAge: 60 * 60 * 24 * 365,
            sameSite: "lax",
        });

        return response;
    }

    if (pathname !== "/") {
        return NextResponse.next({
            request: {
                headers: requestHeaders,
            },
        });
    }

    const cookieLocaleValue = request.cookies.get(SITE_LOCALE_COOKIE)?.value;
    const cookieLocale = cookieLocaleValue && isSiteLocale(cookieLocaleValue)
        ? cookieLocaleValue
        : null;

    const preferredLocale: SiteLocale = cookieLocale
        ?? detectSiteLocaleFromCountry(request.headers.get("x-vercel-ip-country"))
            ?? detectSiteLocaleFromAcceptLanguage(request.headers.get("accept-language"))
            ?? DEFAULT_SITE_LOCALE;

    requestHeaders.set("x-site-locale", preferredLocale);

    if (preferredLocale !== DEFAULT_SITE_LOCALE) {
        const redirectUrl = request.nextUrl.clone();
        redirectUrl.pathname = getLocalizedPath(preferredLocale);
        return NextResponse.redirect(redirectUrl);
    }

    return NextResponse.next({
        request: {
            headers: requestHeaders,
        },
    });
}

export const config = {
    matcher: ["/((?!api|_next|favicon.ico|images|vectors|animations).*)"],
};
