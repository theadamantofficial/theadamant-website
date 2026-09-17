import type {Metadata} from "next";
import {notFound} from "next/navigation";
import HomePage from "@/views/home-page";
import {getSiteCopy} from "@/lib/site-copy";
import {
    getLanguageAlternates,
    getLocalizedPath,
    INDEXABLE_SITE_LOCALES,
    isSiteLocale,
    SiteLocale,
} from "@/lib/site-locale";
import {buildOpenGraphMetadata, buildTwitterMetadata} from "@/lib/social-metadata";

export const dynamicParams = false;

const INTERNATIONAL_METADATA: Partial<Record<SiteLocale, {title: string; description: string}>> = {
    "en-us": {
        title: "Adamant Technologies | Website, SaaS and Digital Marketing in the USA",
        description: "Adamant helps US startups and growing businesses with website development, UI/UX design, mobile apps, SaaS products, technical SEO, and digital marketing.",
    },
    ja: {
        title: "Adamant Technologies | Webサイト制作・アプリ開発・SEO",
        description: "日本市場を目指す企業向けのWebサイト制作、UI/UXデザイン、モバイルアプリ、SaaS、テクニカルSEO、デジタルマーケティング。",
    },
    ko: {
        title: "Adamant Technologies | 웹사이트 개발·앱·SEO·디지털 마케팅",
        description: "한국 시장을 위한 웹사이트 개발, UI/UX 디자인, 모바일 앱, SaaS, 기술 SEO 및 디지털 마케팅 서비스.",
    },
    ar: {
        title: "Adamant Technologies | تطوير المواقع والتطبيقات والتسويق الرقمي في دبي",
        description: "تصميم وتطوير المواقع والتطبيقات ومنتجات SaaS وتحسين محركات البحث والتسويق الرقمي للشركات في دبي والإمارات.",
    },
    "de-ch": {
        title: "Adamant Technologies | Webentwicklung und SEO in der Schweiz",
        description: "Webentwicklung, UI/UX, Mobile Apps, SaaS, technische Suchmaschinenoptimierung und digitales Marketing für Schweizer Unternehmen.",
    },
    "fr-ch": {
        title: "Adamant Technologies | Développement web et SEO en Suisse",
        description: "Développement web, UI/UX, applications mobiles, SaaS, SEO technique et marketing digital pour les entreprises en Suisse.",
    },
    "it-ch": {
        title: "Adamant Technologies | Sviluppo web e SEO in Svizzera",
        description: "Sviluppo web, UI/UX, applicazioni mobile, SaaS, SEO tecnica e marketing digitale per le aziende in Svizzera.",
    },
};

export function generateStaticParams() {
    return INDEXABLE_SITE_LOCALES.map((locale) => ({locale}));
}

export async function generateMetadata({
    params,
}: {
    params: Promise<{ locale: string }>;
}): Promise<Metadata> {
    const {locale: localeParam} = await params;

    if (!isSiteLocale(localeParam) || localeParam === "en") {
        return {};
    }

    const locale = localeParam as SiteLocale;
    const copy = getSiteCopy(locale);
    const localizedPath = getLocalizedPath(locale);
    const localizedMetadata = INTERNATIONAL_METADATA[locale] ?? copy.metadata;

    return {
        title: {
            absolute: localizedMetadata.title,
        },
        description: localizedMetadata.description,
        openGraph: buildOpenGraphMetadata({
            title: localizedMetadata.title,
            description: localizedMetadata.description,
            pagePath: localizedPath,
            locale,
        }),
        twitter: buildTwitterMetadata({
            title: copy.metadata.title,
            description: copy.metadata.description,
        }),
        alternates: {
            canonical: localizedPath,
            languages: getLanguageAlternates(),
        },
    };
}

export default async function LocalizedHomePage({
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

    return <HomePage copy={copy} locale={locale}/>;
}
