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

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

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

    return {
        title: {
            absolute: `${post.title} | The Adamant`,
        },
        description: post.excerpt,
        openGraph: {
            title: post.title,
            description: post.excerpt,
            locale,
        },
        twitter: {
            card: "summary_large_image",
            title: post.title,
            description: post.excerpt,
        },
        ...(siteUrl
            ? {
                alternates: {
                    canonical: getLocalizedPagePath(locale, pathname),
                    languages: getLanguageAlternates(pathname),
                },
            }
            : {}),
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
