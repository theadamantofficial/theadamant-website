import type {Metadata} from "next";
import {notFound} from "next/navigation";
import InternalBlogPostPage from "@/views/internal-blog-post-page";
import {getEnhancedBlogSeoTitle, getInternalBlogPostBySlug} from "@/lib/internal-blog";
import {getSiteCopy} from "@/lib/site-copy";
import {
    getLanguageAlternates,
    getLocalizedPagePath,
    isSiteLocale,
    SiteLocale,
} from "@/lib/site-locale";
import {getSiteUrl} from "@/lib/site-url";
import {buildTwitterMetadata, getOpenGraphImages} from "@/lib/social-metadata";

export const runtime = "nodejs";
export const revalidate = 1800;

export async function generateMetadata({
    params,
}: {
    params: { locale: string; slug: string };
}): Promise<Metadata> {
    if (!isSiteLocale(params.locale) || params.locale === "en") {
        return {};
    }

    const post = await getInternalBlogPostBySlug(params.slug);

    if (!post) {
        return {};
    }

    const locale = params.locale as SiteLocale;
    const pathname = `blog/${post.slug}`;
    const siteUrl = getSiteUrl();
    const url = `${siteUrl}${getLocalizedPagePath(locale, pathname)}`;
    const seoTitle = getEnhancedBlogSeoTitle(post.title, post.tags);

    return {
        title: {
            absolute: seoTitle,
        },
        description: post.excerpt,
        keywords: post.tags,
        openGraph: {
            title: seoTitle,
            description: post.excerpt,
            locale,
            type: "article",
            url,
            siteName: "The Adamant",
            images: getOpenGraphImages(post.coverImage, seoTitle),
            publishedTime: post.publishedAt,
            modifiedTime: post.updatedAt,
            authors: [post.authorName],
            tags: post.tags,
        },
        twitter: buildTwitterMetadata({
            title: seoTitle,
            description: post.excerpt,
            imagePath: post.coverImage,
        }),
        alternates: {
            canonical: getLocalizedPagePath(locale, pathname),
            languages: getLanguageAlternates(pathname),
        },
    };
}

export default async function LocalizedInternalBlogPostRoute({
    params,
}: {
    params: { locale: string; slug: string };
}) {
    if (!isSiteLocale(params.locale) || params.locale === "en") {
        notFound();
    }

    const post = await getInternalBlogPostBySlug(params.slug);

    if (!post) {
        notFound();
    }

    const locale = params.locale as SiteLocale;
    const copy = getSiteCopy(locale);

    return <InternalBlogPostPage copy={copy} locale={locale} post={post}/>;
}
