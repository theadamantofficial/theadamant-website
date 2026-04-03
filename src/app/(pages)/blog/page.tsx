import type {Metadata} from "next";
import BlogPage from "@/views/blog-page";
import {listInternalBlogPosts} from "@/lib/internal-blog";
import {getSiteCopy} from "@/lib/site-copy";
import {DEFAULT_SITE_LOCALE, getLanguageAlternates} from "@/lib/site-locale";
import {fetchMediumPosts} from "@/lib/medium";
import {buildOpenGraphMetadata, buildTwitterMetadata} from "@/lib/social-metadata";
const copy = getSiteCopy(DEFAULT_SITE_LOCALE);

export const runtime = "nodejs";
export const revalidate = 1800;

export const metadata: Metadata = {
    title: {
        absolute: "The Adamant Blog",
    },
    description: "Read The Adamant's internal blog posts and Medium articles on web design, UX, SEO, website strategy, and digital product thinking from one hub on theadamant.com.",
    openGraph: buildOpenGraphMetadata({
        title: "The Adamant Blog",
        description: "Read The Adamant's internal blog posts and Medium articles on web design, UX, SEO, website strategy, and digital product thinking from one hub on theadamant.com.",
        pagePath: "/blog",
    }),
    twitter: buildTwitterMetadata({
        title: "The Adamant Blog",
        description: "Read The Adamant's internal blog posts and Medium articles on web design, UX, SEO, website strategy, and digital product thinking from one hub on theadamant.com.",
    }),
    alternates: {
        canonical: "/blog",
        languages: getLanguageAlternates("blog"),
    },
};

export default async function BlogIndexPage() {
    const [mediumPosts, internalPosts] = await Promise.all([
        fetchMediumPosts(),
        listInternalBlogPosts(),
    ]);

    return <BlogPage copy={copy} locale={DEFAULT_SITE_LOCALE} mediumPosts={mediumPosts} internalPosts={internalPosts}/>;
}
