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

export default function LocalizedBlogAdminPage({
    params,
}: {
    params: { locale: string };
}) {
    if (!isSiteLocale(params.locale) || params.locale === "en") {
        notFound();
    }

    const locale = params.locale as SiteLocale;
    const copy = getSiteCopy(locale);

    return <BlogAdminPage copy={copy} locale={locale}/>;
}
