"use client";

import {Globe2, LoaderCircle} from "lucide-react";
import {AUTO_LANGUAGE, getLanguageLabel} from "@/lib/translation-config";
import {useSiteTranslation} from "@/components/providers/site-translate-provider";

export function LanguageSwitcher({mobile = false}: { mobile?: boolean }) {
    const {
        activeLanguage,
        isTranslating,
        languagePreference,
        setLanguagePreference,
        supportedLanguages,
    } = useSiteTranslation();

    return (
        <div
            data-translate-skip="true"
            className={mobile
                ? "flex w-full items-center gap-3 rounded-2xl border border-black/10 bg-white/72 px-4 py-3 text-sm shadow-sm backdrop-blur-sm dark:border-white/10 dark:bg-white/5"
                : "flex items-center gap-2 rounded-full border border-black/10 bg-white/72 px-3 py-2 text-sm shadow-sm backdrop-blur-sm dark:border-white/10 dark:bg-white/5"}
        >
            <Globe2 className="h-4 w-4 shrink-0 text-foreground/70"/>

            <div className="flex min-w-0 flex-1 items-center gap-2">
                <select
                    aria-label="Change website language"
                    className="w-full min-w-0 bg-transparent text-sm font-medium text-foreground outline-none"
                    value={languagePreference}
                    disabled={isTranslating}
                    onChange={(event) => {
                        void setLanguagePreference(event.target.value === AUTO_LANGUAGE ? AUTO_LANGUAGE : event.target.value as typeof activeLanguage);
                    }}
                >
                    <option value={AUTO_LANGUAGE}>Auto ({getLanguageLabel(activeLanguage)})</option>
                    {supportedLanguages.map((language) => (
                        <option key={language.code} value={language.code}>
                            {language.nativeLabel}
                        </option>
                    ))}
                </select>

                {isTranslating && (
                    <LoaderCircle className="h-4 w-4 shrink-0 animate-spin text-foreground/65"/>
                )}
            </div>
        </div>
    );
}
