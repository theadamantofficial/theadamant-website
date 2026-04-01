import type {Metadata} from "next";
import {notFound} from "next/navigation";
import BlogPage from "@/views/blog-page";
import {getSiteCopy} from "@/lib/site-copy";
import {fetchMediumPosts} from "@/lib/medium";
import {
    getLanguageAlternates,
    getLocalizedPagePath,
    INDEXABLE_SITE_LOCALES,
    isSiteLocale,
    SiteLocale,
} from "@/lib/site-locale";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

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
    const localizedPath = getLocalizedPagePath(locale, "blog");

    return {
        title: {
            absolute: "The Adamant Blog",
        },
        description: "Read The Adamant's latest Medium articles on web design, UX, SEO, website strategy, and digital product thinking from one blog hub on theadamant.com.",
        openGraph: {
            title: "The Adamant Blog",
            description: "Read The Adamant's latest Medium articles on web design, UX, SEO, website strategy, and digital product thinking from one blog hub on theadamant.com.",
            locale,
        },
        twitter: {
            card: "summary_large_image",
            title: "The Adamant Blog",
            description: "Read The Adamant's latest Medium articles on web design, UX, SEO, website strategy, and digital product thinking from one blog hub on theadamant.com.",
        },
        ...(siteUrl
            ? {
                alternates: {
                    canonical: localizedPath,
                    languages: getLanguageAlternates("blog"),
                },
            }
            : {}),
    };
}

export default async function LocalizedBlogPage({
    params,
}: {
    params: { locale: string };
}) {
    if (!isSiteLocale(params.locale) || params.locale === "en") {
        notFound();
    }

    const locale = params.locale as SiteLocale;
    const copy = getSiteCopy(locale);
    const posts = await fetchMediumPosts();

    return <BlogPage copy={copy} locale={locale} posts={posts}/>;
}
