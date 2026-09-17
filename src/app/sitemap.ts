import type {MetadataRoute} from "next";
import {getSiteUrl} from "@/lib/site-url";
import {SERVICE_LANDING_PAGES} from "@/lib/service-landing-pages";

const STATIC_PATHS = [
    "/",
    "/about",
    "/industries-served",
    "/blog",
    "/privacy-policy",
    "/terms",
    "/data-deletion",
];

const LOCALE_PATHS = [
    "/en-us",
    "/ja",
    "/ko",
    "/ar",
    "/de-ch",
    "/fr-ch",
    "/it-ch",
];

export default function sitemap(): MetadataRoute.Sitemap {
    const siteUrl = getSiteUrl();
    const servicePaths = Object.keys(SERVICE_LANDING_PAGES).map((slug) => `/${slug}`);

    return [...new Set([...STATIC_PATHS, ...LOCALE_PATHS, ...servicePaths])].map((path) => ({
        url: `${siteUrl}${path}`,
        changeFrequency: path === "/" || path === "/blog" ? "weekly" : "monthly",
        priority: path === "/" ? 1 : path === "/about" ? 0.8 : 0.7,
    }));
}
