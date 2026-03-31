"use client";

import React, {
    createContext,
    useContext,
    useEffect,
    useRef,
    useState,
} from "react";
import toast from "react-hot-toast";
import {
    AUTO_LANGUAGE,
    DEFAULT_LANGUAGE,
    getLanguageLabel,
    LANGUAGE_STORAGE_KEY,
    LanguagePreference,
    normalizeLanguageCode,
    SupportedLanguage,
    SupportedLanguageCode,
    SUPPORTED_LANGUAGES,
    TRANSLATION_CACHE_PREFIX,
} from "@/lib/translation-config";

const TRANSLATABLE_ATTRIBUTES = ["aria-label", "placeholder", "title", "alt"] as const;
const META_SELECTORS = [
    'meta[name="description"]',
    'meta[property="og:title"]',
    'meta[property="og:description"]',
    'meta[name="twitter:title"]',
    'meta[name="twitter:description"]',
] as const;
const TRANSLATION_BATCH_SIZE = 40;

type TranslatableAttribute = (typeof TRANSLATABLE_ATTRIBUTES)[number];

interface TextEntry {
    type: "text";
    node: Text;
    original: string;
}

interface AttributeEntry {
    type: "attribute";
    element: HTMLElement;
    attribute: TranslatableAttribute;
    original: string;
}

type TranslationEntry = TextEntry | AttributeEntry;

interface MetaSnapshot {
    selector: string;
    original: string;
}

interface SiteTranslateContextValue {
    activeLanguage: SupportedLanguageCode;
    languagePreference: LanguagePreference;
    isTranslating: boolean;
    translationAvailable: boolean;
    supportedLanguages: SupportedLanguage[];
    setLanguagePreference: (preference: LanguagePreference) => Promise<void>;
}

const SiteTranslateContext = createContext<SiteTranslateContextValue | undefined>(undefined);

function chunkStrings(values: string[], size: number) {
    const chunks: string[][] = [];
    for (let index = 0; index < values.length; index += size) {
        chunks.push(values.slice(index, index + size));
    }

    return chunks;
}

function decodeHtmlEntities(value: string) {
    const textarea = document.createElement("textarea");
    textarea.innerHTML = value;
    return textarea.value;
}

function releaseApplyingLock(isApplyingRef: React.MutableRefObject<boolean>) {
    window.setTimeout(() => {
        isApplyingRef.current = false;
    }, 0);
}

export function SiteTranslateProvider({children}: { children: React.ReactNode }) {
    const [activeLanguage, setActiveLanguage] = useState<SupportedLanguageCode>(DEFAULT_LANGUAGE);
    const [languagePreference, setLanguagePreferenceState] = useState<LanguagePreference>(AUTO_LANGUAGE);
    const [pendingPreference, setPendingPreference] = useState<LanguagePreference | null>(null);
    const [isTranslating, setIsTranslating] = useState(false);
    const [translationAvailable, setTranslationAvailable] = useState(false);

    const requestIdRef = useRef(0);
    const refreshTimeoutRef = useRef<number | null>(null);
    const isApplyingRef = useRef(false);
    const textOriginalsRef = useRef(new WeakMap<Text, string>());
    const attributeOriginalsRef = useRef(new WeakMap<Element, Map<string, string>>());
    const metadataSnapshotRef = useRef<{
        title: string;
        metaEntries: MetaSnapshot[];
    } | null>(null);
    const translationCacheRef = useRef(new Map<SupportedLanguageCode, Map<string, string>>());
    const latestActiveLanguageRef = useRef<SupportedLanguageCode>(DEFAULT_LANGUAGE);
    const translationAvailableRef = useRef(false);

    useEffect(() => {
        latestActiveLanguageRef.current = activeLanguage;
    }, [activeLanguage]);

    useEffect(() => {
        translationAvailableRef.current = translationAvailable;
    }, [translationAvailable]);

    useEffect(() => {
        const storedPreference = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
        const normalizedStoredPreference =
            storedPreference === AUTO_LANGUAGE
                ? AUTO_LANGUAGE
                : normalizeLanguageCode(storedPreference);

        const nextPreference = normalizedStoredPreference ?? AUTO_LANGUAGE;
        setLanguagePreferenceState(nextPreference);
        void applyPreference(nextPreference, {persist: false});
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        const observer = new MutationObserver((mutations) => {
            if (isApplyingRef.current || latestActiveLanguageRef.current === DEFAULT_LANGUAGE) {
                return;
            }

            const shouldRefresh = mutations.some((mutation) => {
                if (mutation.type === "childList") {
                    return mutation.addedNodes.length > 0;
                }

                return mutation.type === "attributes";
            });

            if (!shouldRefresh) {
                return;
            }

            if (refreshTimeoutRef.current) {
                window.clearTimeout(refreshTimeoutRef.current);
            }

            refreshTimeoutRef.current = window.setTimeout(() => {
                void translateDocument(latestActiveLanguageRef.current, {
                    requestId: requestIdRef.current,
                    updateLanguageState: false,
                });
            }, 120);
        });

        observer.observe(document.body, {
            subtree: true,
            childList: true,
            attributes: true,
            attributeFilter: [...TRANSLATABLE_ATTRIBUTES],
        });

        return () => {
            observer.disconnect();

            if (refreshTimeoutRef.current) {
                window.clearTimeout(refreshTimeoutRef.current);
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    function getCachedTranslations(language: SupportedLanguageCode) {
        const inMemoryCache = translationCacheRef.current.get(language);
        if (inMemoryCache) {
            return inMemoryCache;
        }

        const nextCache = new Map<string, string>();
        const serializedCache = window.localStorage.getItem(`${TRANSLATION_CACHE_PREFIX}${language}`);
        if (serializedCache) {
            try {
                const parsedCache = JSON.parse(serializedCache) as Record<string, string>;
                for (const [key, value] of Object.entries(parsedCache)) {
                    nextCache.set(key, value);
                }
            } catch {
                window.localStorage.removeItem(`${TRANSLATION_CACHE_PREFIX}${language}`);
            }
        }

        translationCacheRef.current.set(language, nextCache);
        return nextCache;
    }

    function persistTranslationCache(language: SupportedLanguageCode) {
        const cache = translationCacheRef.current.get(language);
        if (!cache) {
            return;
        }

        window.localStorage.setItem(
            `${TRANSLATION_CACHE_PREFIX}${language}`,
            JSON.stringify(Object.fromEntries(cache.entries())),
        );
    }

    function getOriginalTextValue(node: Text) {
        const storedValue = textOriginalsRef.current.get(node);
        if (storedValue) {
            return storedValue;
        }

        const originalValue = node.nodeValue ?? "";
        textOriginalsRef.current.set(node, originalValue);
        return originalValue;
    }

    function getOriginalAttributeValue(element: HTMLElement, attribute: TranslatableAttribute) {
        let elementMap = attributeOriginalsRef.current.get(element);
        if (!elementMap) {
            elementMap = new Map();
            attributeOriginalsRef.current.set(element, elementMap);
        }

        const storedValue = elementMap.get(attribute);
        if (storedValue) {
            return storedValue;
        }

        const originalValue = element.getAttribute(attribute) ?? "";
        elementMap.set(attribute, originalValue);
        return originalValue;
    }

    function shouldSkipElement(element: Element | null) {
        if (!element) {
            return true;
        }

        if (element.closest("[data-translate-skip='true']")) {
            return true;
        }

        const tagName = element.tagName;
        return [
            "SCRIPT",
            "STYLE",
            "NOSCRIPT",
            "IFRAME",
            "SVG",
            "PATH",
            "PRE",
            "CODE",
        ].includes(tagName);
    }

    function collectTranslationEntries() {
        const entries: TranslationEntry[] = [];
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
            acceptNode: (node) => {
                const parentElement = node.parentElement;
                if (!parentElement || shouldSkipElement(parentElement)) {
                    return NodeFilter.FILTER_REJECT;
                }

                const originalValue = getOriginalTextValue(node as Text);
                if (!originalValue.trim()) {
                    return NodeFilter.FILTER_REJECT;
                }

                return NodeFilter.FILTER_ACCEPT;
            },
        });

        while (walker.nextNode()) {
            const node = walker.currentNode as Text;
            entries.push({
                type: "text",
                node,
                original: getOriginalTextValue(node),
            });
        }

        const attributeSelector = TRANSLATABLE_ATTRIBUTES.map((attribute) => `[${attribute}]`).join(",");
        document.querySelectorAll<HTMLElement>(attributeSelector).forEach((element) => {
            if (shouldSkipElement(element)) {
                return;
            }

            TRANSLATABLE_ATTRIBUTES.forEach((attribute) => {
                if (!element.hasAttribute(attribute)) {
                    return;
                }

                const originalValue = getOriginalAttributeValue(element, attribute);
                if (!originalValue.trim()) {
                    return;
                }

                entries.push({
                    type: "attribute",
                    element,
                    attribute,
                    original: originalValue,
                });
            });
        });

        return entries;
    }

    function ensureMetadataSnapshot() {
        if (metadataSnapshotRef.current) {
            return metadataSnapshotRef.current;
        }

        metadataSnapshotRef.current = {
            title: document.title,
            metaEntries: META_SELECTORS.flatMap((selector) => {
                const element = document.querySelector<HTMLMetaElement>(selector);
                if (!element) {
                    return [];
                }

                const original = element.getAttribute("content") ?? "";
                return original.trim()
                    ? [{selector, original}]
                    : [];
            }),
        };

        return metadataSnapshotRef.current;
    }

    async function fetchTranslations(texts: string[], targetLanguage: SupportedLanguageCode) {
        const response = await fetch("/api/translate", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                sourceLanguage: DEFAULT_LANGUAGE,
                targetLanguage,
                texts,
            }),
        });

        const payload = await response.json() as {
            available?: boolean;
            error?: string;
            translations?: string[];
        };

        if (payload.available === false) {
            return {
                available: false,
                translations: texts,
            };
        }

        if (!response.ok || !Array.isArray(payload.translations)) {
            throw new Error(payload.error || "Translation request failed.");
        }

        return {
            available: true,
            translations: payload.translations.map((text) => decodeHtmlEntities(text)),
        };
    }

    function restoreOriginalContent() {
        isApplyingRef.current = true;

        const entries = collectTranslationEntries();
        entries.forEach((entry) => {
            if (entry.type === "text") {
                if (entry.node.nodeValue !== entry.original) {
                    entry.node.nodeValue = entry.original;
                }

                return;
            }

            if (entry.element.getAttribute(entry.attribute) !== entry.original) {
                entry.element.setAttribute(entry.attribute, entry.original);
            }
        });

        const metadataSnapshot = ensureMetadataSnapshot();
        document.title = metadataSnapshot.title;

        metadataSnapshot.metaEntries.forEach((entry) => {
            const element = document.querySelector<HTMLMetaElement>(entry.selector);
            if (element && element.getAttribute("content") !== entry.original) {
                element.setAttribute("content", entry.original);
            }
        });

        document.documentElement.lang = DEFAULT_LANGUAGE;
        document.documentElement.dataset.language = DEFAULT_LANGUAGE;

        releaseApplyingLock(isApplyingRef);
    }

    async function translateDocument(
        targetLanguage: SupportedLanguageCode,
        {
            requestId,
            updateLanguageState,
        }: {
            requestId: number;
            updateLanguageState: boolean;
        },
    ): Promise<boolean> {
        if (targetLanguage === DEFAULT_LANGUAGE) {
            restoreOriginalContent();

            if (updateLanguageState) {
                setActiveLanguage(DEFAULT_LANGUAGE);
            }

            return true;
        }

        const cache = getCachedTranslations(targetLanguage);
        const entries = collectTranslationEntries();
        const metadataSnapshot = ensureMetadataSnapshot();
        const metadataTexts = [
            metadataSnapshot.title,
            ...metadataSnapshot.metaEntries.map((entry) => entry.original),
        ].filter((value) => value.trim());

        const uniqueTexts = [...new Set([
            ...entries.map((entry) => entry.original),
            ...metadataTexts,
        ])];

        const unresolvedTexts = uniqueTexts.filter((text) => !cache.has(text));
        if (unresolvedTexts.length) {
            for (const chunk of chunkStrings(unresolvedTexts, TRANSLATION_BATCH_SIZE)) {
                const response = await fetchTranslations(chunk, targetLanguage);
                if (!response.available) {
                    return false;
                }

                if (requestId !== requestIdRef.current) {
                    return false;
                }

                chunk.forEach((original, index) => {
                    cache.set(original, response.translations[index] ?? original);
                });
            }

            persistTranslationCache(targetLanguage);
        }

        if (requestId !== requestIdRef.current) {
            return false;
        }

        isApplyingRef.current = true;

        entries.forEach((entry) => {
            const translatedValue = cache.get(entry.original) ?? entry.original;
            if (entry.type === "text") {
                if (entry.node.nodeValue !== translatedValue) {
                    entry.node.nodeValue = translatedValue;
                }

                return;
            }

            if (entry.element.getAttribute(entry.attribute) !== translatedValue) {
                entry.element.setAttribute(entry.attribute, translatedValue);
            }
        });

        document.title = cache.get(metadataSnapshot.title) ?? metadataSnapshot.title;
        metadataSnapshot.metaEntries.forEach((entry) => {
            const element = document.querySelector<HTMLMetaElement>(entry.selector);
            const translatedValue = cache.get(entry.original) ?? entry.original;
            if (element && element.getAttribute("content") !== translatedValue) {
                element.setAttribute("content", translatedValue);
            }
        });

        document.documentElement.lang = targetLanguage;
        document.documentElement.dataset.language = targetLanguage;

        if (updateLanguageState) {
            setActiveLanguage(targetLanguage);
        }

        releaseApplyingLock(isApplyingRef);
        return true;
    }

    async function detectPreferredLanguage() {
        try {
            const response = await fetch("/api/locale", {cache: "no-store"});
            if (response.ok) {
                const payload = await response.json() as { language?: string; translationEnabled?: boolean };
                const isTranslationEnabled = Boolean(payload.translationEnabled);
                translationAvailableRef.current = isTranslationEnabled;
                setTranslationAvailable(isTranslationEnabled);
                const normalizedLanguage = normalizeLanguageCode(payload.language);
                if (normalizedLanguage) {
                    return normalizedLanguage;
                }
            }
        } catch {
            // Fall back to the browser language when the server hint is unavailable.
        }

        const browserLanguage = normalizeLanguageCode(navigator.language);
        return browserLanguage ?? DEFAULT_LANGUAGE;
    }

    async function applyPreference(
        preference: LanguagePreference,
        {persist}: { persist: boolean },
    ): Promise<SupportedLanguageCode | null> {
        requestIdRef.current += 1;
        const requestId = requestIdRef.current;

        setPendingPreference(preference);
        setIsTranslating(true);

        try {
            const nextLanguage = preference === AUTO_LANGUAGE
                ? await detectPreferredLanguage()
                : preference;

            if (nextLanguage === DEFAULT_LANGUAGE) {
                restoreOriginalContent();
            } else {
                if (!translationAvailableRef.current) {
                    restoreOriginalContent();
                    setActiveLanguage(DEFAULT_LANGUAGE);
                    return null;
                }

                const translated = await translateDocument(nextLanguage, {
                    requestId,
                    updateLanguageState: true,
                });
                if (!translated) {
                    translationAvailableRef.current = false;
                    setTranslationAvailable(false);
                    restoreOriginalContent();
                    setActiveLanguage(DEFAULT_LANGUAGE);
                    return null;
                }
            }

            if (requestId !== requestIdRef.current) {
                return null;
            }

            setActiveLanguage(nextLanguage);
            setLanguagePreferenceState(preference);

            if (persist) {
                window.localStorage.setItem(LANGUAGE_STORAGE_KEY, preference);
            }

            return nextLanguage;
        } catch {
            return null;
        } finally {
            if (requestId === requestIdRef.current) {
                setPendingPreference(null);
                setIsTranslating(false);
            }
        }
    }

    const contextValue: SiteTranslateContextValue = {
        activeLanguage,
        languagePreference: pendingPreference ?? languagePreference,
        isTranslating,
        translationAvailable,
        supportedLanguages: SUPPORTED_LANGUAGES,
        setLanguagePreference: async (preference) => {
            const resolvedLanguage = await applyPreference(preference, {persist: true});
            if (!resolvedLanguage) {
                if (preference !== AUTO_LANGUAGE && preference !== DEFAULT_LANGUAGE) {
                    toast.error("Language switching is temporarily unavailable.");
                }
                return;
            }

            toast.success(
                preference === AUTO_LANGUAGE
                    ? `Language set to automatic (${getLanguageLabel(resolvedLanguage)}).`
                    : `Language changed to ${getLanguageLabel(resolvedLanguage)}.`,
            );
        },
    };

    return (
        <SiteTranslateContext.Provider value={contextValue}>
            {children}
        </SiteTranslateContext.Provider>
    );
}

export function useSiteTranslation() {
    const context = useContext(SiteTranslateContext);
    if (!context) {
        throw new Error("useSiteTranslation must be used inside SiteTranslateProvider.");
    }

    return context;
}
