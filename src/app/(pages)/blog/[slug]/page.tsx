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

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
const copy = getSiteCopy(DEFAULT_SITE_LOCALE);

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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

    return {
        title: {
            absolute: `${post.title} | The Adamant`,
        },
        description: post.excerpt,
        openGraph: {
            title: post.title,
            description: post.excerpt,
        },
        twitter: {
            card: "summary_large_image",
            title: post.title,
            description: post.excerpt,
        },
        ...(siteUrl
            ? {
                alternates: {
                    canonical: getLocalizedPagePath(DEFAULT_SITE_LOCALE, pathname),
                    languages: getLanguageAlternates(pathname),
                },
            }
            : {}),
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
