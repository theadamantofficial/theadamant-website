export const DEFAULT_SITE_LOCALE = "en";
export const SEO_SITE_LOCALES = ["en", "hi", "es", "fr", "de", "pt", "ja"] as const;
export const INDEXABLE_SITE_LOCALES = SEO_SITE_LOCALES.filter((locale) => locale !== DEFAULT_SITE_LOCALE);
export const SITE_LOCALE_COOKIE = "site-locale";

export type SiteLocale = (typeof SEO_SITE_LOCALES)[number];

export interface SiteLocaleOption {
    code: SiteLocale;
    label: string;
    nativeLabel: string;
}

export const SITE_LOCALE_OPTIONS: SiteLocaleOption[] = [
    {code: "en", label: "English", nativeLabel: "English"},
    {code: "hi", label: "Hindi", nativeLabel: "हिन्दी"},
    {code: "es", label: "Spanish", nativeLabel: "Español"},
    {code: "fr", label: "French", nativeLabel: "Français"},
    {code: "de", label: "German", nativeLabel: "Deutsch"},
    {code: "pt", label: "Portuguese", nativeLabel: "Português"},
    {code: "ja", label: "Japanese", nativeLabel: "日本語"},
];

const COUNTRY_LOCALE_MAP: Partial<Record<string, SiteLocale>> = {
    AT: "de",
    AR: "es",
    BO: "es",
    BR: "pt",
    CH: "de",
    CL: "es",
    CO: "es",
    CR: "es",
    DE: "de",
    DO: "es",
    EC: "es",
    ES: "es",
    FR: "fr",
    GT: "es",
    HN: "es",
    IN: "hi",
    JP: "ja",
    MX: "es",
    NI: "es",
    PA: "es",
    PE: "es",
    PT: "pt",
    PY: "es",
    SV: "es",
    UY: "es",
    VE: "es",
};

const LANGUAGE_LOCALE_MAP: Partial<Record<string, SiteLocale>> = {
    de: "de",
    en: "en",
    es: "es",
    fr: "fr",
    hi: "hi",
    ja: "ja",
    pt: "pt",
};

export function isSiteLocale(value: string): value is SiteLocale {
    return SEO_SITE_LOCALES.includes(value as SiteLocale);
}

export function localeToHtmlLang(locale: SiteLocale) {
    switch (locale) {
        case "hi":
            return "hi";
        case "es":
            return "es";
        case "fr":
            return "fr";
        case "de":
            return "de";
        case "pt":
            return "pt";
        case "ja":
            return "ja";
        default:
            return "en";
    }
}

export function getLocalizedPath(locale: SiteLocale, hash = "") {
    const normalizedHash = hash ? (hash.startsWith("#") ? hash : `#${hash}`) : "";
    if (locale === DEFAULT_SITE_LOCALE) {
        return `/${normalizedHash}`;
    }

    return `/${locale}${normalizedHash}`;
}

export function detectSiteLocaleFromCountry(countryCode?: string | null): SiteLocale | null {
    if (!countryCode) {
        return null;
    }

    return COUNTRY_LOCALE_MAP[countryCode.trim().toUpperCase()] ?? null;
}

export function detectSiteLocaleFromAcceptLanguage(headerValue?: string | null): SiteLocale | null {
    if (!headerValue) {
        return null;
    }

    const candidates = headerValue
        .split(",")
        .map((segment) => {
            const [languagePart, qualityPart] = segment.trim().split(";q=");
            return {
                language: languagePart.trim().toLowerCase(),
                quality: qualityPart ? Number.parseFloat(qualityPart) : 1,
            };
        })
        .filter((candidate) => candidate.language)
        .sort((left, right) => right.quality - left.quality);

    for (const candidate of candidates) {
        const baseLanguage = candidate.language.split("-")[0];
        const matchedLocale = LANGUAGE_LOCALE_MAP[baseLanguage];
        if (matchedLocale) {
            return matchedLocale;
        }
    }

    return null;
}

export function getLocaleLabel(locale: SiteLocale) {
    return SITE_LOCALE_OPTIONS.find((option) => option.code === locale)?.nativeLabel ?? locale;
}

export function getLanguageAlternates() {
    return {
        en: "/",
        hi: "/hi",
        es: "/es",
        fr: "/fr",
        de: "/de",
        pt: "/pt",
        ja: "/ja",
        "x-default": "/",
    };
}

export function getLocaleFromPathname(pathname: string): SiteLocale {
    const firstSegment = pathname.split("/").filter(Boolean)[0];
    return firstSegment && isSiteLocale(firstSegment) ? firstSegment : DEFAULT_SITE_LOCALE;
}
