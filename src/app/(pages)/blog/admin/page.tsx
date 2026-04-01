import type {Metadata} from "next";
import BlogAdminPage from "@/views/blog-admin-page";
import {getSiteCopy} from "@/lib/site-copy";
import {DEFAULT_SITE_LOCALE} from "@/lib/site-locale";

const copy = getSiteCopy(DEFAULT_SITE_LOCALE);

export const metadata: Metadata = {
    title: {
        absolute: "The Adamant Blog Admin",
    },
    robots: {
        index: false,
        follow: false,
    },
};

export default function BlogAdminIndexPage() {
    return <BlogAdminPage copy={copy} locale={DEFAULT_SITE_LOCALE}/>;
}
