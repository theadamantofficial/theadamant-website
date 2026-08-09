import type {Metadata} from "next";
import {notFound} from "next/navigation";
import BlogAdminPage from "@/views/blog-admin-page";
import {getSiteCopy} from "@/lib/site-copy";
import {isSiteLocale, SiteLocale} from "@/lib/site-locale";

export const metadata: Metadata = {
    title: {
        absolute: "The Adamant Blog Admin",
    },
    robots: {
        index: false,
        follow: false,
    },
};

export default async function LocalizedBlogAdminPage({
    params,
}: {
    params: Promise<{ locale: string }>;
}) {
    const {locale: localeParam} = await params;

    if (!isSiteLocale(localeParam) || localeParam === "en") {
        notFound();
    }

    const locale = localeParam as SiteLocale;
    const copy = getSiteCopy(locale);

    return <BlogAdminPage copy={copy} locale={locale}/>;
}
