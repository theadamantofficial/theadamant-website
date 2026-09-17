import {SiteLocale} from "@/lib/site-locale";

const MARKET_COPY: Partial<Record<SiteLocale, {
    kicker: string;
    title: string;
    description: string;
    services: string;
}>> = {
    "en-us": {
        kicker: "United States market",
        title: "Websites, SaaS products, and digital growth for ambitious US businesses.",
        description: "Adamant supports US startups, professional service firms, and growing companies with conversion-focused website development, UI/UX design, mobile products, technical SEO, content strategy, and digital marketing.",
        services: "US website development · SaaS product design · mobile app development · SEO strategy · digital marketing",
    },
    ja: {
        kicker: "日本市場向け",
        title: "日本の企業とグローバルブランドのためのWeb・アプリ・SEO支援。",
        description: "Adamantは、Webサイト制作、UI/UXデザイン、モバイルアプリ、SaaS、テクニカルSEO、デジタルマーケティングを通じて、日本市場を目指す企業の成長を支援します。",
        services: "Webサイト制作 · UI/UXデザイン · モバイルアプリ · SaaS · SEO · デジタルマーケティング",
    },
    ko: {
        kicker: "한국 시장",
        title: "한국 기업과 글로벌 브랜드를 위한 웹사이트, 앱, SaaS, SEO.",
        description: "Adamant는 웹사이트 개발, UI/UX 디자인, 모바일 앱, SaaS 제품, 기술 SEO와 디지털 마케팅을 연결하여 한국 시장을 목표로 하는 기업의 성장을 지원합니다.",
        services: "웹사이트 개발 · UI/UX 디자인 · 모바일 앱 · SaaS · 기술 SEO · 디지털 마케팅",
    },
    ar: {
        kicker: "سوق دبي والإمارات",
        title: "مواقع وتطبيقات ومنتجات رقمية تساعد الشركات في دبي على النمو.",
        description: "تقدم Adamant تصميم واجهات وتجارب المستخدم، وتطوير المواقع والتطبيقات، ومنتجات SaaS، وتحسين محركات البحث، والتسويق الرقمي للشركات التي تستهدف دبي والإمارات والأسواق العالمية.",
        services: "تطوير المواقع · تصميم UI/UX · تطبيقات الهاتف · SaaS · تحسين محركات البحث · التسويق الرقمي",
    },
    "de-ch": {
        kicker: "Schweizer Markt",
        title: "Websites, digitale Produkte und SEO für Unternehmen in der Schweiz.",
        description: "Adamant unterstützt Schweizer Unternehmen mit klaren Websites, UI/UX-Design, mobilen Produkten, SaaS, technischer Suchmaschinenoptimierung und digitalem Marketing für lokale und internationale Zielgruppen.",
        services: "Webentwicklung · UI/UX · Mobile Apps · SaaS · SEO · Digital Marketing",
    },
    "fr-ch": {
        kicker: "Marché suisse",
        title: "Sites web, produits numériques et SEO pour les entreprises suisses.",
        description: "Adamant accompagne les entreprises en Suisse avec des sites web clairs, du design UI/UX, des applications mobiles, des produits SaaS, du SEO technique et du marketing digital pour des audiences locales et internationales.",
        services: "Développement web · UI/UX · Applications mobiles · SaaS · SEO · Marketing digital",
    },
    "it-ch": {
        kicker: "Mercato svizzero",
        title: "Siti web, prodotti digitali e SEO per le aziende in Svizzera.",
        description: "Adamant aiuta le aziende svizzere con siti web chiari, design UI/UX, applicazioni mobile, prodotti SaaS, SEO tecnica e marketing digitale per pubblici locali e internazionali.",
        services: "Sviluppo web · UI/UX · App mobile · SaaS · SEO · Marketing digitale",
    },
};

export default function InternationalMarketSection({locale}: {locale: SiteLocale}) {
    const market = MARKET_COPY[locale];

    if (!market) {
        return null;
    }

    return (
        <section className="section-shell py-16 sm:py-20" aria-labelledby="international-market-heading">
            <div className="rounded-[2rem] border border-foreground/10 bg-foreground/[0.03] p-7 sm:p-10">
                <p className="section-kicker">{market.kicker}</p>
                <h2 id="international-market-heading" className="mt-4 max-w-4xl text-3xl font-semibold tracking-tight sm:text-5xl">
                    {market.title}
                </h2>
                <p className="mt-6 max-w-3xl text-base leading-8 text-foreground/70">{market.description}</p>
                <p className="mt-6 text-sm font-semibold tracking-wide text-foreground/65">{market.services}</p>
            </div>
        </section>
    );
}
