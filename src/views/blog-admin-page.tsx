import Link from "next/link";
import {ArrowLeft, LockKeyhole} from "lucide-react";
import {Navbar} from "@/components/layouts/navbar";
import Footer from "@/components/layouts/footer";
import {BlogAdminPanel} from "@/components/blog/blog-admin-panel";
import {SiteCopy} from "@/lib/site-copy";
import {getLocalizedPagePath, SiteLocale} from "@/lib/site-locale";

export default function BlogAdminPage({
    copy,
    locale,
}: {
    copy: SiteCopy;
    locale: SiteLocale;
}) {
    return (
        <main className="relative min-h-screen overflow-hidden">
            <Navbar copy={copy.navbar} locale={locale}/>

            <section className="relative px-6 pb-12 pt-28 sm:px-8 lg:px-12">
                <div className="section-shell">
                    <p className="section-kicker">
                        <LockKeyhole className="h-4 w-4"/>
                        Internal blog admin
                    </p>
                    <h1 className="section-title max-w-3xl">
                        Publish articles on The Adamant without leaving the site workspace.
                    </h1>
                    <p className="section-copy max-w-3xl">
                        This admin page is meant for company members. It keeps a cookie-based session for sign-in and
                        lets you add internal blog posts that appear in the on-site blog section immediately.
                    </p>

                    <div className="mt-8">
                        <Link href={getLocalizedPagePath(locale, "blog")} className="button-secondary">
                            <ArrowLeft className="h-4 w-4"/>
                            Back to blog
                        </Link>
                    </div>
                </div>
            </section>

            <section className="section-shell pb-20">
                <BlogAdminPanel locale={locale}/>
            </section>

            <Footer copy={copy.footer} locale={locale}/>
        </main>
    );
}
