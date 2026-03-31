"use client";

import {useEffect, useState, useTransition} from "react";
import {usePathname, useRouter} from "next/navigation";
import {Globe2, LoaderCircle} from "lucide-react";
import {
    getLocaleFromPathname,
    getLocalizedPath,
    SITE_LOCALE_COOKIE,
    SITE_LOCALE_OPTIONS,
    SiteLocale,
} from "@/lib/site-locale";

export function LanguageSwitcher({mobile = false}: { mobile?: boolean }) {
    const pathname = usePathname();
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [selectedLocale, setSelectedLocale] = useState<SiteLocale>(getLocaleFromPathname(pathname ?? "/"));

    useEffect(() => {
        setSelectedLocale(getLocaleFromPathname(pathname ?? "/"));
    }, [pathname]);

    return (
        <div
            className={mobile
                ? "flex w-full items-center gap-3 rounded-2xl border border-black/10 bg-white/72 px-4 py-3 text-sm shadow-sm backdrop-blur-sm dark:border-white/10 dark:bg-white/5"
                : "flex items-center gap-2 rounded-full border border-black/10 bg-white/72 px-3 py-2 text-sm shadow-sm backdrop-blur-sm dark:border-white/10 dark:bg-white/5"}
        >
            <Globe2 className="h-4 w-4 shrink-0 text-foreground/70"/>

            <div className="flex min-w-0 flex-1 items-center gap-2">
                <select
                    aria-label="Change website language"
                    className="w-full min-w-0 bg-transparent text-sm font-medium text-foreground outline-none disabled:cursor-not-allowed disabled:opacity-60"
                    value={selectedLocale}
                    disabled={isPending}
                    onChange={(event) => {
                        const nextLocale = event.target.value as SiteLocale;
                        const hash = typeof window !== "undefined" ? window.location.hash : "";

                        setSelectedLocale(nextLocale);
                        document.cookie = `${SITE_LOCALE_COOKIE}=${nextLocale}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;

                        startTransition(() => {
                            router.push(getLocalizedPath(nextLocale, hash));
                        });
                    }}
                >
                    {SITE_LOCALE_OPTIONS.map((language) => (
                        <option key={language.code} value={language.code}>
                            {language.nativeLabel}
                        </option>
                    ))}
                </select>

                {isPending && (
                    <LoaderCircle className="h-4 w-4 shrink-0 animate-spin text-foreground/65"/>
                )}
            </div>
        </div>
    );
}
