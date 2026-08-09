import type {Metadata} from "next";
import {notFound} from "next/navigation";
import InternalBlogPostPage from "@/views/internal-blog-post-page";
import {getEnhancedBlogSeoTitle, getInternalBlogPostBySlug} from "@/lib/internal-blog";
import {getSiteCopy} from "@/lib/site-copy";
import {
    DEFAULT_SITE_LOCALE,
    getLanguageAlternates,
    getLocalizedPagePath,
} from "@/lib/site-locale";
import {getSiteUrl} from "@/lib/site-url";
import {buildTwitterMetadata, getOpenGraphImages} from "@/lib/social-metadata";
const copy = getSiteCopy(DEFAULT_SITE_LOCALE);

export const runtime = "nodejs";
export const revalidate = 1800;

export async function generateMetadata({
    params,
}: {
    params: Promise<{slug: string}>;
}): Promise<Metadata> {
    const {slug} = await params;
    const post = await getInternalBlogPostBySlug(slug);

    if (!post) {
        return {};
    }

    const pathname = `blog/${post.slug}`;
    const siteUrl = getSiteUrl();
    const url = `${siteUrl}${getLocalizedPagePath(DEFAULT_SITE_LOCALE, pathname)}`;
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
            canonical: getLocalizedPagePath(DEFAULT_SITE_LOCALE, pathname),
            languages: getLanguageAlternates(pathname),
        },
    };
}

export default async function InternalBlogPostRoute({
    params,
}: {
    params: Promise<{slug: string}>;
}) {
    const {slug} = await params;
    const post = await getInternalBlogPostBySlug(slug);

    if (!post) {
        notFound();
    }

    return <InternalBlogPostPage copy={copy} locale={DEFAULT_SITE_LOCALE} post={post}/>;
}
