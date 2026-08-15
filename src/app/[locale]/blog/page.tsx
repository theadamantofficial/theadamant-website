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
    const localizedPath = getLocalizedPagePath(locale, "blog");

    return {
        title: {
            absolute: "Adamant Blog",
        },
        description: "Read Adamant's internal blog posts and Medium articles on web design, UX, SEO, website strategy, and digital product thinking from one hub on theadamant.com.",
        openGraph: buildOpenGraphMetadata({
            title: "Adamant Blog",
            description: "Read Adamant's internal blog posts and Medium articles on web design, UX, SEO, website strategy, and digital product thinking from one hub on theadamant.com.",
            pagePath: localizedPath,
            locale,
        }),
        twitter: buildTwitterMetadata({
            title: "Adamant Blog",
            description: "Read Adamant's internal blog posts and Medium articles on web design, UX, SEO, website strategy, and digital product thinking from one hub on theadamant.com.",
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
    params: Promise<{ locale: string }>;
}) {
    const {locale: localeParam} = await params;

    if (!isSiteLocale(localeParam) || localeParam === "en") {
        notFound();
    }

    const locale = localeParam as SiteLocale;
    const copy = getSiteCopy(locale);
    const [mediumPosts, internalPosts] = await Promise.all([
        fetchMediumPosts(),
        listInternalBlogPosts(),
    ]);

    return <BlogPage copy={copy} locale={locale} mediumPosts={mediumPosts} internalPosts={internalPosts}/>;
}
