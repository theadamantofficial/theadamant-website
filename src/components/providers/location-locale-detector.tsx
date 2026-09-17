"use client";

import {useEffect} from "react";
import {usePathname, useRouter} from "next/navigation";
import {
    getLocalizedPagePath,
    getLocaleFromPathname,
    SITE_LOCALE_COOKIE,
    SiteLocale,
} from "@/lib/site-locale";

const LOCATION_CHECK_KEY = "adamant-location-locale-checked";

function hasCookie(name: string) {
    return document.cookie.split("; ").some((cookie) => cookie.startsWith(`${name}=`));
}

export default function LocationLocaleDetector() {
    const pathname = usePathname();
    const router = useRouter();

    useEffect(() => {
        if (pathname !== "/" || hasCookie(SITE_LOCALE_COOKIE)
            || sessionStorage.getItem(LOCATION_CHECK_KEY)
            || !("geolocation" in navigator)) {
            return;
        }

        sessionStorage.setItem(LOCATION_CHECK_KEY, "true");
        navigator.geolocation.getCurrentPosition(async ({coords}) => {
            const response = await fetch("/api/location-locale", {
                method: "POST",
                headers: {"content-type": "application/json"},
                body: JSON.stringify({
                    latitude: coords.latitude,
                    longitude: coords.longitude,
                }),
            });

            if (!response.ok) {
                return;
            }

            const data = await response.json() as {locale?: SiteLocale};
            if (!data.locale || data.locale === getLocaleFromPathname(pathname)) {
                return;
            }

            document.cookie = `${SITE_LOCALE_COOKIE}=${data.locale}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
            router.replace(getLocalizedPagePath(data.locale));
        }, () => undefined, {
            enableHighAccuracy: false,
            maximumAge: 86400000,
            timeout: 5000,
        });
    }, [pathname, router]);

    return null;
}
