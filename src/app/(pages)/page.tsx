import type {Metadata} from "next";
import HomePage from "@/views/home-page";
import {getSiteCopy} from "@/lib/site-copy";
import {DEFAULT_SITE_LOCALE, getLanguageAlternates} from "@/lib/site-locale";
import {buildOpenGraphMetadata, buildTwitterMetadata} from "@/lib/social-metadata";
const copy = getSiteCopy(DEFAULT_SITE_LOCALE);

export const metadata: Metadata = {
    title: {
        absolute: copy.metadata.title,
    },
    description: copy.metadata.description,
    openGraph: buildOpenGraphMetadata({
        title: copy.metadata.title,
        description: copy.metadata.description,
        pagePath: "/",
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
