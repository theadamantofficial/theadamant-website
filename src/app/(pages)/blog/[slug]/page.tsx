import type {Metadata} from "next";
import {notFound} from "next/navigation";
import InternalBlogPostPage from "@/views/internal-blog-post-page";
import {getInternalBlogPostBySlug} from "@/lib/internal-blog";
import {getSiteCopy} from "@/lib/site-copy";
import {
    DEFAULT_SITE_LOCALE,
    getLanguageAlternates,
    getLocalizedPagePath,
} from "@/lib/site-locale";
import {getSiteUrl} from "@/lib/site-url";
const copy = getSiteCopy(DEFAULT_SITE_LOCALE);

export const runtime = "nodejs";
export const revalidate = 1800;

export async function generateMetadata({
    params,
}: {
    params: { slug: string };
}): Promise<Metadata> {
    const post = await getInternalBlogPostBySlug(params.slug);

    if (!post) {
        return {};
    }

    const pathname = `blog/${post.slug}`;
    const siteUrl = getSiteUrl();
    const url = `${siteUrl}${getLocalizedPagePath(DEFAULT_SITE_LOCALE, pathname)}`;

    return {
        title: {
            absolute: `${post.title} | The Adamant`,
        },
        description: post.excerpt,
        keywords: post.tags,
        openGraph: {
            title: post.title,
            description: post.excerpt,
            type: "article",
            url,
            publishedTime: post.publishedAt,
            modifiedTime: post.updatedAt,
            authors: [post.authorName],
            tags: post.tags,
            images: post.coverImage ? [{url: post.coverImage.startsWith("http") ? post.coverImage : `${siteUrl}${post.coverImage}`}] : undefined,
        },
        twitter: {
            card: "summary_large_image",
            title: post.title,
            description: post.excerpt,
            images: post.coverImage ? [post.coverImage.startsWith("http") ? post.coverImage : `${siteUrl}${post.coverImage}`] : undefined,
        },
        alternates: {
            canonical: getLocalizedPagePath(DEFAULT_SITE_LOCALE, pathname),
            languages: getLanguageAlternates(pathname),
        },
    };
}

export default async function InternalBlogPostRoute({
    params,
}: {
    params: { slug: string };
}) {
    const post = await getInternalBlogPostBySlug(params.slug);

    if (!post) {
        notFound();
    }

    return <InternalBlogPostPage copy={copy} locale={DEFAULT_SITE_LOCALE} post={post}/>;
}
