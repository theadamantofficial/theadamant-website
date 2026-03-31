import type {Metadata} from "next";
import HomePage from "@/views/home-page";
import {getSiteCopy} from "@/lib/site-copy";
import {DEFAULT_SITE_LOCALE, getLanguageAlternates} from "@/lib/site-locale";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
const copy = getSiteCopy(DEFAULT_SITE_LOCALE);

export const metadata: Metadata = {
    title: {
        absolute: copy.metadata.title,
    },
    description: copy.metadata.description,
    openGraph: {
        title: copy.metadata.title,
        description: copy.metadata.description,
    },
    twitter: {
        card: "summary_large_image",
        title: copy.metadata.title,
        description: copy.metadata.description,
    },
    ...(siteUrl
        ? {
            alternates: {
                canonical: "/",
                languages: getLanguageAlternates(),
            },
        }
        : {}),
};

export default function Home() {
    return <HomePage copy={copy} locale={DEFAULT_SITE_LOCALE}/>;
}
