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
import {buildOpenGraphMetadata, buildTwitterMetadata} from "@/lib/social-metadata";

export const dynamicParams = false;

export function generateStaticParams() {
    return INDEXABLE_SITE_LOCALES.map((locale) => ({locale}));
}

export async function generateMetadata({
    params,
}: {
    params: Promise<{ locale: string }>;
}): Promise<Metadata> {
    const {locale: localeParam} = await params;

    if (!isSiteLocale(localeParam) || localeParam === "en") {
        return {};
    }

    const locale = localeParam as SiteLocale;
    const copy = getSiteCopy(locale);
    const localizedPath = getLocalizedPath(locale);

    return {
        title: {
            absolute: copy.metadata.title,
        },
        description: copy.metadata.description,
        openGraph: buildOpenGraphMetadata({
            title: copy.metadata.title,
            description: copy.metadata.description,
            pagePath: localizedPath,
            locale,
        }),
        twitter: buildTwitterMetadata({
            title: copy.metadata.title,
            description: copy.metadata.description,
        }),
        alternates: {
            canonical: localizedPath,
            languages: getLanguageAlternates(),
        },
    };
}

export default async function LocalizedHomePage({
    params,
}: {
    params: Promise<{ locale: string }>;
}) {
    const {locale: localeParam} = await params;

    if (!isSiteLocale(localeParam) || localeParam === "en") {
        notFound();
    }

    const locale = localeParam as SiteLocale;
    const copy = getSiteCopy(locale);

    return <HomePage copy={copy} locale={locale}/>;
}
