import type {Metadata} from "next";
import {notFound} from "next/navigation";
import HomePage from "@/views/home-page";
import {getSiteCopy} from "@/lib/site-copy";
import {
    getLanguageAlternates,
    getLocalizedPath,
    INDEXABLE_SITE_LOCALES,
    isSiteLocale,
    SiteLocale,
} from "@/lib/site-locale";
import {getOpenGraphImages, getTwitterImages} from "@/lib/social-metadata";

export const dynamicParams = false;

export function generateStaticParams() {
    return INDEXABLE_SITE_LOCALES.map((locale) => ({locale}));
}

export function generateMetadata({
    params,
}: {
    params: { locale: string };
}): Metadata {
    if (!isSiteLocale(params.locale) || params.locale === "en") {
        return {};
    }

    const locale = params.locale as SiteLocale;
    const copy = getSiteCopy(locale);
    const localizedPath = getLocalizedPath(locale);

    return {
        title: {
            absolute: copy.metadata.title,
        },
        description: copy.metadata.description,
        openGraph: {
            title: copy.metadata.title,
            description: copy.metadata.description,
            locale,
            images: getOpenGraphImages(),
        },
        twitter: {
            card: "summary_large_image",
            title: copy.metadata.title,
            description: copy.metadata.description,
            images: getTwitterImages(),
        },
        alternates: {
            canonical: localizedPath,
            languages: getLanguageAlternates(),
        },
    };
}

export default function LocalizedHomePage({
    params,
}: {
    params: { locale: string };
}) {
    if (!isSiteLocale(params.locale) || params.locale === "en") {
        notFound();
    }

    const locale = params.locale as SiteLocale;
    const copy = getSiteCopy(locale);

    return <HomePage copy={copy} locale={locale}/>;
}
