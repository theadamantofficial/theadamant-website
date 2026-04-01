import type {Metadata} from "next";
import BlogPage from "@/views/blog-page";
import {getSiteCopy} from "@/lib/site-copy";
import {DEFAULT_SITE_LOCALE, getLanguageAlternates} from "@/lib/site-locale";
import {fetchMediumPosts} from "@/lib/medium";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
const copy = getSiteCopy(DEFAULT_SITE_LOCALE);

export const metadata: Metadata = {
    title: {
        absolute: "The Adamant Blog",
    },
    description: "Read The Adamant's latest Medium articles on web design, UX, SEO, website strategy, and digital product thinking from one blog hub on theadamant.com.",
    openGraph: {
        title: "The Adamant Blog",
        description: "Read The Adamant's latest Medium articles on web design, UX, SEO, website strategy, and digital product thinking from one blog hub on theadamant.com.",
    },
    twitter: {
        card: "summary_large_image",
        title: "The Adamant Blog",
        description: "Read The Adamant's latest Medium articles on web design, UX, SEO, website strategy, and digital product thinking from one blog hub on theadamant.com.",
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
    const posts = await fetchMediumPosts();

    return <BlogPage copy={copy} locale={DEFAULT_SITE_LOCALE} posts={posts}/>;
}
