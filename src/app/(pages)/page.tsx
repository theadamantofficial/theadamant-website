import type {Metadata} from "next";
import HomePage from "@/views/home-page";
import {getSiteCopy} from "@/lib/site-copy";
import {DEFAULT_SITE_LOCALE, getLanguageAlternates} from "@/lib/site-locale";
import {buildOpenGraphMetadata, buildTwitterMetadata} from "@/lib/social-metadata";
import {getRegionalSeo} from "@/lib/regional-seo";
const copy = getSiteCopy(DEFAULT_SITE_LOCALE);
const regionalSeo = getRegionalSeo(DEFAULT_SITE_LOCALE);

export const metadata: Metadata = {
    title: {
        absolute: "Website & App Development Agency | Adamant",
    },
    description: copy.metadata.description,
    keywords: regionalSeo.keywords,
    openGraph: buildOpenGraphMetadata({
        title: copy.metadata.title,
        description: copy.metadata.description,
        pagePath: "/",
        locale: regionalSeo.ogLocale,
    }),
    twitter: buildTwitterMetadata({
        title: copy.metadata.title,
        description: copy.metadata.description,
    }),
    alternates: {
        canonical: "/",
        languages: getLanguageAlternates(),
    },
};

export default function Home() {
    return <HomePage copy={copy} locale={DEFAULT_SITE_LOCALE}/>;
}
