import type {Metadata} from "next";
import "../styles/globals.css";
import {ReactNode} from "react";
import {Manrope, Space_Grotesk} from "next/font/google";
import {Toaster} from "react-hot-toast";
import {headers} from "next/headers";
import {DEFAULT_SITE_LOCALE, isSiteLocale, localeToHtmlLang} from "@/lib/site-locale";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

export const metadata: Metadata = {
    title: {
        default: "The Adamant | Digital Product Design and Development",
        template: "%s | The Adamant",
    },
    description: "The Adamant designs websites, product interfaces, and mobile experiences built to look sharp, load fast, and support SEO from day one.",
    applicationName: "The Adamant",
    authors: [{name: "The Adamant"}],
    creator: "The Adamant",
    publisher: "The Adamant",
    keywords: [
        "web design",
        "website development",
        "SEO-friendly websites",
        "UI UX design",
        "mobile app development",
        "digital product studio",
    ],
    robots: {
        index: true,
        follow: true,
    },
    openGraph: {
        title: "The Adamant | Digital Product Design and Development",
        description: "Design-forward websites, UX systems, and mobile experiences with clear messaging, fast performance, and SEO-ready structure.",
        type: "website",
        siteName: "The Adamant",
    },
    twitter: {
        card: "summary_large_image",
        title: "The Adamant | Digital Product Design and Development",
        description: "Design-forward websites, UX systems, and mobile experiences with clear messaging, fast performance, and SEO-ready structure.",
    },
    ...(siteUrl
        ? {
            metadataBase: new URL(siteUrl),
        }
        : {}),
};

const manrope = Manrope({
    subsets: ["latin"],
    variable: "--font-sans",
});

const spaceGrotesk = Space_Grotesk({
    subsets: ["latin"],
    variable: "--font-display",
});

export default async function RootLayout({children}: Readonly<{
    children: ReactNode;
}>) {
    const requestHeaders = await headers();
    const siteLocaleHeader = requestHeaders.get("x-site-locale");
    const siteLocale = isSiteLocale(siteLocaleHeader ?? "")
        ? siteLocaleHeader as "en" | "hi" | "es" | "fr"
        : DEFAULT_SITE_LOCALE;

    return (
        <html lang={localeToHtmlLang(siteLocale)} suppressHydrationWarning>
        <body className={`${manrope.variable} ${spaceGrotesk.variable}`}>
        <Toaster
            position="top-right"
            reverseOrder={false}
            containerClassName="mt-14"/>

        {children}
        </body>
        </html>
    );
}
