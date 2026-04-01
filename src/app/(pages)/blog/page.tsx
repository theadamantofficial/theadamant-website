import type {Metadata} from "next";
import BlogPage from "@/views/blog-page";
import {listInternalBlogPosts} from "@/lib/internal-blog";
import {getSiteCopy} from "@/lib/site-copy";
import {DEFAULT_SITE_LOCALE, getLanguageAlternates} from "@/lib/site-locale";
import {fetchMediumPosts} from "@/lib/medium";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
const copy = getSiteCopy(DEFAULT_SITE_LOCALE);

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
    title: {
        absolute: "The Adamant Blog",
    },
    description: "Read The Adamant's internal blog posts and Medium articles on web design, UX, SEO, website strategy, and digital product thinking from one hub on theadamant.com.",
    openGraph: {
        title: "The Adamant Blog",
        description: "Read The Adamant's internal blog posts and Medium articles on web design, UX, SEO, website strategy, and digital product thinking from one hub on theadamant.com.",
    },
    twitter: {
        card: "summary_large_image",
        title: "The Adamant Blog",
        description: "Read The Adamant's internal blog posts and Medium articles on web design, UX, SEO, website strategy, and digital product thinking from one hub on theadamant.com.",
    },
    ...(siteUrl
        ? {
            alternates: {
                canonical: "/blog",
                languages: getLanguageAlternates("blog"),
            },
        }
        : {}),
};

export default async function BlogIndexPage() {
    const [mediumPosts, internalPosts] = await Promise.all([
        fetchMediumPosts(),
        listInternalBlogPosts(),
    ]);

    return <BlogPage copy={copy} locale={DEFAULT_SITE_LOCALE} mediumPosts={mediumPosts} internalPosts={internalPosts}/>;
}
