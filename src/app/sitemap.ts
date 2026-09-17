import type {MetadataRoute} from "next";
import {getSiteUrl} from "@/lib/site-url";
import {SERVICE_LANDING_PAGES} from "@/lib/service-landing-pages";
import {listInternalBlogPosts} from "@/lib/internal-blog";
import {
    INDEXABLE_SITE_LOCALES,
    getLocalizedPagePath,
} from "@/lib/site-locale";

const STATIC_PATHS = [
    "/",
    "/about",
    "/industries-served",
    "/blog",
    "/privacy-policy",
    "/terms",
    "/data-deletion",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const siteUrl = getSiteUrl();
    const servicePaths = Object.keys(SERVICE_LANDING_PAGES).map((slug) => `/${slug}`);
    const internalBlogPosts = await listInternalBlogPosts();
    const blogPaths = internalBlogPosts.map((post) => `/blog/${post.slug}`);
    const localizedPaths = INDEXABLE_SITE_LOCALES.flatMap((locale) => [
        getLocalizedPagePath(locale),
        getLocalizedPagePath(locale, "blog"),
        ...internalBlogPosts.map((post) => getLocalizedPagePath(locale, `blog/${post.slug}`)),
    ]);
    const blogPostDates = new Map(
        internalBlogPosts.map((post) => [`/blog/${post.slug}`, post.updatedAt || post.publishedAt]),
    );

    return [...new Set([...STATIC_PATHS, ...servicePaths, ...blogPaths, ...localizedPaths])].map((path) => {
        return {
            url: `${siteUrl}${path}`,
            ...(blogPostDates.has(path) ? {lastModified: blogPostDates.get(path)} : {}),
            changeFrequency: path === "/" || path.endsWith("/blog") ? "weekly" : "monthly",
            priority: path === "/" ? 1 : path === "/about" ? 0.8 : 0.7,
        };
    });
}
