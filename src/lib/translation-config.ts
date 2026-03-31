export const DEFAULT_LANGUAGE = "en";
export const AUTO_LANGUAGE = "auto";
export const LANGUAGE_STORAGE_KEY = "site-language-preference";
export const TRANSLATION_CACHE_PREFIX = "site-translation-cache:";

export type SupportedLanguageCode =
    | "en"
    | "ar"
    | "de"
    | "es"
    | "fr"
    | "hi"
    | "ja"
    | "pt"
    | "zh-CN";

export type LanguagePreference = typeof AUTO_LANGUAGE | SupportedLanguageCode;

export interface SupportedLanguage {
    code: SupportedLanguageCode;
    label: string;
    nativeLabel: string;
}

export const SUPPORTED_LANGUAGES: SupportedLanguage[] = [
    {code: "en", label: "English", nativeLabel: "English"},
    {code: "hi", label: "Hindi", nativeLabel: "हिन्दी"},
    {code: "es", label: "Spanish", nativeLabel: "Español"},
    {code: "fr", label: "French", nativeLabel: "Français"},
    {code: "de", label: "German", nativeLabel: "Deutsch"},
    {code: "ar", label: "Arabic", nativeLabel: "العربية"},
    {code: "pt", label: "Portuguese", nativeLabel: "Português"},
    {code: "zh-CN", label: "Chinese", nativeLabel: "简体中文"},
    {code: "ja", label: "Japanese", nativeLabel: "日本語"},
];

const EXACT_LANGUAGE_CODE_MAP: Record<string, SupportedLanguageCode> = {
    ar: "ar",
    de: "de",
    en: "en",
    "en-us": "en",
    "en-gb": "en",
    es: "es",
    "es-419": "es",
    fr: "fr",
    hi: "hi",
    ja: "ja",
    pt: "pt",
    "pt-br": "pt",
    "pt-pt": "pt",
    zh: "zh-CN",
    "zh-cn": "zh-CN",
    "zh-hans": "zh-CN",
    "zh-sg": "zh-CN",
};

const BASE_LANGUAGE_CODE_MAP: Record<string, SupportedLanguageCode> = {
    ar: "ar",
    de: "de",
    en: "en",
    es: "es",
    fr: "fr",
    hi: "hi",
    ja: "ja",
    pt: "pt",
    zh: "zh-CN",
};

const COUNTRY_LANGUAGE_MAP: Record<string, SupportedLanguageCode> = {
    AE: "ar",
    AR: "es",
    BR: "pt",
    CN: "zh-CN",
    DE: "de",
    EG: "ar",
    ES: "es",
    FR: "fr",
    HI: "hi",
    IN: "hi",
    JP: "ja",
    KW: "ar",
    MX: "es",
    OM: "ar",
    PT: "pt",
    QA: "ar",
    SA: "ar",
    SG: "zh-CN",
    TW: "zh-CN",
};

export function isSupportedLanguageCode(value: string): value is SupportedLanguageCode {
    return SUPPORTED_LANGUAGES.some((language) => language.code === value);
}

export function normalizeLanguageCode(value?: string | null): SupportedLanguageCode | null {
    if (!value) {
        return null;
    }

    const normalizedValue = value.trim().toLowerCase();
    if (EXACT_LANGUAGE_CODE_MAP[normalizedValue]) {
        return EXACT_LANGUAGE_CODE_MAP[normalizedValue];
    }

    const baseLanguageCode = normalizedValue.split("-")[0];
    return BASE_LANGUAGE_CODE_MAP[baseLanguageCode] ?? null;
}

export function detectLanguageFromCountry(value?: string | null): SupportedLanguageCode | null {
    if (!value) {
        return null;
    }

    return COUNTRY_LANGUAGE_MAP[value.trim().toUpperCase()] ?? null;
}

export function parseAcceptLanguageHeader(headerValue?: string | null): SupportedLanguageCode | null {
    if (!headerValue) {
        return null;
    }

    const candidates = headerValue
        .split(",")
        .map((segment) => {
            const [languagePart, qualityPart] = segment.trim().split(";q=");
            return {
                language: languagePart.trim(),
                quality: qualityPart ? Number.parseFloat(qualityPart) : 1,
            };
        })
        .filter((candidate) => candidate.language)
        .sort((left, right) => right.quality - left.quality);

    for (const candidate of candidates) {
        const normalizedLanguage = normalizeLanguageCode(candidate.language);
        if (normalizedLanguage) {
            return normalizedLanguage;
        }
    }

    return null;
}

export function getLanguageLabel(code: SupportedLanguageCode): string {
    const language = SUPPORTED_LANGUAGES.find((item) => item.code === code);
    return language ? language.nativeLabel : code;
}
