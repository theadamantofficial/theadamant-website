import type {Metadata} from "next";
import HomePage from "@/views/home-page";
import {getSiteCopy} from "@/lib/site-copy";
import {DEFAULT_SITE_LOCALE, getLanguageAlternates} from "@/lib/site-locale";
import {getOpenGraphImages, getTwitterImages} from "@/lib/social-metadata";
const copy = getSiteCopy(DEFAULT_SITE_LOCALE);

export const metadata: Metadata = {
    title: {
        absolute: copy.metadata.title,
    },
    description: copy.metadata.description,
    openGraph: {
        title: copy.metadata.title,
        description: copy.metadata.description,
        images: getOpenGraphImages(),
    },
    twitter: {
        card: "summary_large_image",
        title: copy.metadata.title,
        description: copy.metadata.description,
        images: getTwitterImages(),
    },
    alternates: {
        canonical: "/",
        languages: getLanguageAlternates(),
    },
};

export default function Home() {
    return <HomePage copy={copy} locale={DEFAULT_SITE_LOCALE}/>;
}
