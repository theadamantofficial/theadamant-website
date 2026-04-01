export const DEFAULT_SITE_LOCALE = "en";
export const SEO_SITE_LOCALES = ["en", "hi", "gu", "mr", "bn", "ta", "es", "fr", "de", "pt", "ja"] as const;
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
    {code: "gu", label: "Gujarati", nativeLabel: "ગુજરાતી"},
    {code: "mr", label: "Marathi", nativeLabel: "मराठी"},
    {code: "bn", label: "Bengali", nativeLabel: "বাংলা"},
    {code: "ta", label: "Tamil", nativeLabel: "தமிழ்"},
    {code: "es", label: "Spanish", nativeLabel: "Español"},
    {code: "fr", label: "French", nativeLabel: "Français"},
    {code: "de", label: "German", nativeLabel: "Deutsch"},
    {code: "pt", label: "Portuguese", nativeLabel: "Português"},
    {code: "ja", label: "Japanese", nativeLabel: "日本語"},
];

const COUNTRY_LOCALE_MAP: Partial<Record<string, SiteLocale>> = {
    AT: "de",
    AR: "es",
    BD: "bn",
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
    IN: "en",
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
    bn: "bn",
    de: "de",
    en: "en",
    es: "es",
    fr: "fr",
    gu: "gu",
    hi: "hi",
    ja: "ja",
    mr: "mr",
    pt: "pt",
    ta: "ta",
};

export function isSiteLocale(value: string): value is SiteLocale {
    return SEO_SITE_LOCALES.includes(value as SiteLocale);
}

export function localeToHtmlLang(locale: SiteLocale) {
    switch (locale) {
        case "hi":
            return "hi";
        case "gu":
            return "gu";
        case "mr":
            return "mr";
        case "bn":
            return "bn";
        case "ta":
            return "ta";
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

export function getLocalizedPagePath(locale: SiteLocale, pathname = "") {
    const normalizedPath = pathname.replace(/^\/+|\/+$/g, "");

    if (locale === DEFAULT_SITE_LOCALE) {
        return normalizedPath ? `/${normalizedPath}` : "/";
    }

    return normalizedPath ? `/${locale}/${normalizedPath}` : `/${locale}`;
}

export function getLocalizedPath(locale: SiteLocale, hash = "") {
    const normalizedHash = hash ? (hash.startsWith("#") ? hash : `#${hash}`) : "";
    const basePath = getLocalizedPagePath(locale);

    if (!normalizedHash) {
        return basePath;
    }

    return `${basePath}${normalizedHash}`;
}

export function getLanguageAlternates(pathname = "") {
    const normalizedPath = pathname.replace(/^\/+|\/+$/g, "");

    return {
        en: getLocalizedPagePath("en", normalizedPath),
        hi: getLocalizedPagePath("hi", normalizedPath),
        gu: getLocalizedPagePath("gu", normalizedPath),
        mr: getLocalizedPagePath("mr", normalizedPath),
        bn: getLocalizedPagePath("bn", normalizedPath),
        ta: getLocalizedPagePath("ta", normalizedPath),
        es: getLocalizedPagePath("es", normalizedPath),
        fr: getLocalizedPagePath("fr", normalizedPath),
        de: getLocalizedPagePath("de", normalizedPath),
        pt: getLocalizedPagePath("pt", normalizedPath),
        ja: getLocalizedPagePath("ja", normalizedPath),
        "x-default": getLocalizedPagePath("en", normalizedPath),
    };
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

export function getLocaleFromPathname(pathname: string): SiteLocale {
    const firstSegment = pathname.split("/").filter(Boolean)[0];
    return firstSegment && isSiteLocale(firstSegment) ? firstSegment : DEFAULT_SITE_LOCALE;
}
