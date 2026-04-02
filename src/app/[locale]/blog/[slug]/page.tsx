import type {Metadata} from "next";
import {notFound} from "next/navigation";
import InternalBlogPostPage from "@/views/internal-blog-post-page";
import {getInternalBlogPostBySlug} from "@/lib/internal-blog";
import {getSiteCopy} from "@/lib/site-copy";
import {
    getLanguageAlternates,
    getLocalizedPagePath,
    isSiteLocale,
    SiteLocale,
} from "@/lib/site-locale";
import {getSiteUrl} from "@/lib/site-url";
import {getOpenGraphImages, getTwitterImages} from "@/lib/social-metadata";

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

    return {
        title: {
            absolute: `${post.title} | The Adamant`,
        },
        description: post.excerpt,
        keywords: post.tags,
        openGraph: {
            title: post.title,
            description: post.excerpt,
            locale,
            type: "article",
            url,
            publishedTime: post.publishedAt,
            modifiedTime: post.updatedAt,
            authors: [post.authorName],
            tags: post.tags,
            images: getOpenGraphImages(post.coverImage, post.title),
        },
        twitter: {
            card: "summary_large_image",
            title: post.title,
            description: post.excerpt,
            images: getTwitterImages(post.coverImage),
        },
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
