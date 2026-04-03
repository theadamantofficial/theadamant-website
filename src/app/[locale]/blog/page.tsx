import type {Metadata} from "next";
import {notFound} from "next/navigation";
import BlogPage from "@/views/blog-page";
import {listInternalBlogPosts} from "@/lib/internal-blog";
import {getSiteCopy} from "@/lib/site-copy";
import {fetchMediumPosts} from "@/lib/medium";
import {
    getLanguageAlternates,
    getLocalizedPagePath,
    INDEXABLE_SITE_LOCALES,
    isSiteLocale,
    SiteLocale,
} from "@/lib/site-locale";
import {buildOpenGraphMetadata, buildTwitterMetadata} from "@/lib/social-metadata";

export const dynamicParams = false;
export const runtime = "nodejs";
export const revalidate = 1800;

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
        description: "Read The Adamant's internal blog posts and Medium articles on web design, UX, SEO, website strategy, and digital product thinking from one hub on theadamant.com.",
        openGraph: buildOpenGraphMetadata({
            title: "The Adamant Blog",
            description: "Read The Adamant's internal blog posts and Medium articles on web design, UX, SEO, website strategy, and digital product thinking from one hub on theadamant.com.",
            pagePath: localizedPath,
            locale,
        }),
        twitter: buildTwitterMetadata({
            title: "The Adamant Blog",
            description: "Read The Adamant's internal blog posts and Medium articles on web design, UX, SEO, website strategy, and digital product thinking from one hub on theadamant.com.",
        }),
        alternates: {
            canonical: localizedPath,
            languages: getLanguageAlternates("blog"),
        },
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
    const [mediumPosts, internalPosts] = await Promise.all([
        fetchMediumPosts(),
        listInternalBlogPosts(),
    ]);

    return <BlogPage copy={copy} locale={locale} mediumPosts={mediumPosts} internalPosts={internalPosts}/>;
}
