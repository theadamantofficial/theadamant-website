import type {Metadata} from "next";
import "../styles/globals.css";
import {ReactNode} from "react";
import {Toaster} from "react-hot-toast";
import {headers} from "next/headers";
import {DEFAULT_SITE_LOCALE, isSiteLocale, localeToHtmlLang, SiteLocale} from "@/lib/site-locale";
import {getSiteMetadataBase} from "@/lib/site-url";
import {buildOpenGraphMetadata, buildTwitterMetadata} from "@/lib/social-metadata";
import {MotionProvider} from "@/components/providers/motion-provider";

export const metadata: Metadata = {
    title: {
        default: "The Adamant | Web, App, SaaS and Digital Marketing",
        template: "%s | The Adamant",
    },
    description: "The Adamant designs SEO-friendly websites, product interfaces, mobile experiences, and digital marketing campaigns for brands in India, the USA, UK, Japan, and global markets.",
    applicationName: "The Adamant",
    authors: [{name: "The Adamant"}],
    creator: "The Adamant",
    publisher: "The Adamant",
    keywords: [
        "web design",
        "website development",
        "global website development company",
        "website development company in India",
        "website development company in Noida",
        "SEO-friendly websites",
        "UI UX design",
        "mobile app development",
        "app development company in Noida",
        "digital marketing services",
        "social media management",
        "brand boosting",
        "paid ads management",
        "digital product studio",
    ],
    robots: {
        index: true,
        follow: true,
    },
    openGraph: {
        ...buildOpenGraphMetadata({
            title: "The Adamant | Web, App, SaaS and Digital Marketing",
            description: "Design-forward websites, UX systems, mobile experiences, and digital marketing campaigns with clear messaging, fast performance, and SEO-ready structure.",
            pagePath: "/",
        }),
    },
    twitter: buildTwitterMetadata({
        title: "The Adamant | Web, App, SaaS and Digital Marketing",
        description: "Design-forward websites, UX systems, mobile experiences, and digital marketing campaigns with clear messaging, fast performance, and SEO-ready structure.",
    }),
    metadataBase: getSiteMetadataBase(),
};

export default async function RootLayout({children}: Readonly<{
    children: ReactNode;
}>) {
    const requestHeaders = await headers();
    const siteLocaleHeader = requestHeaders.get("x-site-locale");
    const siteLocale = isSiteLocale(siteLocaleHeader ?? "")
        ? siteLocaleHeader as SiteLocale
        : DEFAULT_SITE_LOCALE;

    return (
        <html lang={localeToHtmlLang(siteLocale)} suppressHydrationWarning>
        <body suppressHydrationWarning>
        <noscript>
            <style>{`.motion-reveal{opacity:1!important;transform:none!important;filter:none!important}.animated-faq-panel{height:auto!important;opacity:1!important;transform:none!important}`}</style>
        </noscript>
        <MotionProvider>
            <Toaster
                position="top-right"
                reverseOrder={false}
                containerClassName="mt-14"/>

            {children}
        </MotionProvider>
        </body>
        </html>
    );
}
