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
import {getRegionalSeo} from "@/lib/regional-seo";

export const dynamicParams = false;

const INTERNATIONAL_METADATA: Partial<Record<SiteLocale, {title: string; description: string}>> = {
    "en-us": {
        title: "Web & App Development in the USA | Adamant",
        description: "Adamant helps US startups and growing businesses with website development, UI/UX design, mobile apps, SaaS products, technical SEO, and digital marketing.",
    },
    ja: {
        title: "Web制作・アプリ開発 | Adamant",
        description: "日本市場を目指す企業向けのWebサイト制作、UI/UXデザイン、モバイルアプリ、SaaS、テクニカルSEO、デジタルマーケティング。",
    },
    ko: {
        title: "웹사이트·앱 개발 | Adamant",
        description: "한국 시장을 위한 웹사이트 개발, UI/UX 디자인, 모바일 앱, SaaS, 기술 SEO 및 디지털 마케팅 서비스.",
    },
    ar: {
        title: "تطوير المواقع والتطبيقات في دبي | Adamant",
        description: "تصميم وتطوير المواقع والتطبيقات ومنتجات SaaS وتحسين محركات البحث والتسويق الرقمي للشركات في دبي والإمارات.",
    },
    "zh-cn": {
        title: "网站与应用开发 | Adamant",
        description: "Adamant Technologies 为中国及全球企业提供网站开发、移动应用、SaaS 产品、技术 SEO 和数字营销服务，帮助品牌提升线上可见度。",
    },
    "de-ch": {
        title: "Webentwicklung in der Schweiz | Adamant",
        description: "Webentwicklung, UI/UX, Mobile Apps, SaaS, technische Suchmaschinenoptimierung und digitales Marketing für Schweizer Unternehmen.",
    },
    "fr-ch": {
        title: "Développement web en Suisse | Adamant",
        description: "Développement web, UI/UX, applications mobiles, SaaS, SEO technique et marketing digital pour les entreprises en Suisse.",
    },
    "it-ch": {
        title: "Sviluppo web in Svizzera | Adamant",
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
    const regionalSeo = getRegionalSeo(locale);

    return {
        title: {
            absolute: localizedMetadata.title,
        },
        description: localizedMetadata.description,
        keywords: regionalSeo.keywords,
        openGraph: buildOpenGraphMetadata({
            title: localizedMetadata.title,
            description: localizedMetadata.description,
            pagePath: localizedPath,
            locale: regionalSeo.ogLocale,
        }),
        twitter: buildTwitterMetadata({
            title: localizedMetadata.title,
            description: localizedMetadata.description,
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
