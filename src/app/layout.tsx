import type {Metadata} from "next";
import "../styles/globals.css";
import "../styles/experience.css";
import "../styles/service-art.css";
import {ReactNode} from "react";
import {Toaster} from "react-hot-toast";
import {headers} from "next/headers";
import {DEFAULT_SITE_LOCALE, isSiteLocale, localeToHtmlLang, SiteLocale} from "@/lib/site-locale";
import {getSiteMetadataBase} from "@/lib/site-url";
import {buildOpenGraphMetadata, buildTwitterMetadata} from "@/lib/social-metadata";
import {MotionProvider} from "@/components/providers/motion-provider";
import SiteBackgroundMusic from "@/components/ui/site-background-music";
import Script from "next/script";
import SiteAnalytics from "@/components/providers/site-analytics";
import LocationLocaleDetector from "@/components/providers/location-locale-detector";
import {GOOGLE_TAG_MANAGER_ID, googleTagManagerEnabled, googleTagManagerScript} from "@/lib/google-tag-manager";

export const metadata: Metadata = {
    title: {
        default: "Adamant Technologies | Web, App, SaaS and Digital Marketing",
        template: "%s | Adamant",
    },
    description: "JSSS Adamant Technologies Private Limited builds SEO-friendly websites, mobile apps, SaaS products, and digital marketing campaigns for businesses in India and global markets.",
    applicationName: "Adamant",
    authors: [{name: "Adamant"}],
    creator: "Adamant",
    publisher: "Adamant",
    keywords: [
        "JSSS Adamant Technologies Private Limited",
        "Adamant Technologies",
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
        "China website development",
        "Chinese SEO",
        "中国网站开发",
        "中国数字营销",
    ],
    robots: {
        index: true,
        follow: true,
    },
    openGraph: {
        ...buildOpenGraphMetadata({
            title: "Adamant Technologies | Web, App, SaaS and Digital Marketing",
            description: "Websites, mobile apps, SaaS products, and digital marketing from JSSS Adamant Technologies Private Limited.",
            pagePath: "/",
        }),
    },
    twitter: buildTwitterMetadata({
        title: "Adamant Technologies | Web, App, SaaS and Digital Marketing",
        description: "Websites, mobile apps, SaaS products, and digital marketing from JSSS Adamant Technologies Private Limited.",
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
    const enableTagManager = googleTagManagerEnabled();

    return (
        <html lang={localeToHtmlLang(siteLocale)} suppressHydrationWarning>
        <head>
            {enableTagManager && <Script id="google-tag-manager" strategy="beforeInteractive">{googleTagManagerScript}</Script>}
        </head>
        <body suppressHydrationWarning>
        {enableTagManager && <noscript><iframe src={`https://www.googletagmanager.com/ns.html?id=${GOOGLE_TAG_MANAGER_ID}`} height="0" width="0" style={{display: "none", visibility: "hidden"}} title="Google Tag Manager"/></noscript>}
        <noscript>
            <style>{`.motion-reveal{opacity:1!important;transform:none!important;filter:none!important}.animated-faq-panel{height:auto!important;opacity:1!important;transform:none!important}`}</style>
        </noscript>
        <MotionProvider>
            <LocationLocaleDetector/>
            <SiteAnalytics/>
            <Toaster
                position="top-right"
                reverseOrder={false}
                containerClassName="mt-14"/>

            {children}
            <SiteBackgroundMusic src={process.env.NEXT_PUBLIC_BACKGROUND_MUSIC_URL || "/audio/here-comes-the-sun.mp3"} title={process.env.NEXT_PUBLIC_BACKGROUND_MUSIC_TITLE || "The Beatles · Here Comes the Sun (2019 Mix)"}/>
        </MotionProvider>
        </body>
        </html>
    );
}
