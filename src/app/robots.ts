import type {MetadataRoute} from "next";
import {getSiteUrl} from "@/lib/site-url";

export default function robots(): MetadataRoute.Robots {
    const siteUrl = getSiteUrl();

    return {
        host: siteUrl,
        rules: [
            {
                userAgent: "Baiduspider",
                allow: "/",
                disallow: ["/admin/", "/api/"],
            },
            {
                userAgent: "*",
                allow: "/",
                disallow: ["/admin/", "/api/"],
            },
        ],
        sitemap: `${siteUrl}/sitemap.xml`,
    };
}
