import {
    IconBrandInstagram,
    IconBrandLinkedin,
    IconBrandMedium,
    IconBrandX,
} from "@tabler/icons-react";
import {AppLogo} from "@/components/ui/resizable-navbar";
import Link from "next/link";
import {SiteCopy} from "@/lib/site-copy";
import {getLocalizedPagePath, getLocalizedPath, SiteLocale} from "@/lib/site-locale";
import {BLOG_LABELS, MEDIUM_URL} from "@/lib/blog-config";
const MEDIUM_COPY: Record<SiteLocale, {
    kicker: string;
    title: string;
    description: string;
    button: string;
    hubButton: string;
}> = {
    en: {
        kicker: "Insights",
        title: "Read our web design and SEO articles on Medium.",
        description: "Follow The Adamant on Medium for articles on website strategy, UX, SEO foundations, and digital product thinking.",
        button: "Visit Medium blog",
        hubButton: "Open blog hub",
    },
    hi: {
        kicker: "Insights",
        title: "Medium पर हमारे web design और SEO लेख पढ़ें।",
        description: "The Adamant के Medium ब्लॉग पर website strategy, UX, SEO foundations और digital product insights पढ़ें।",
        button: "Medium ब्लॉग देखें",
        hubButton: "ब्लॉग हब देखें",
    },
    gu: {
        kicker: "Insights",
        title: "Medium પર અમારા web design અને SEO લેખો વાંચો.",
        description: "The Adamant ના Medium બ્લોગ પર website strategy, UX, SEO foundations અને digital product insights મેળવો.",
        button: "Medium બ્લોગ જુઓ",
        hubButton: "બ્લોગ હબ જુઓ",
    },
    mr: {
        kicker: "Insights",
        title: "Medium वर आमचे web design आणि SEO लेख वाचा.",
        description: "The Adamant च्या Medium ब्लॉगवर website strategy, UX, SEO foundations आणि digital product insights वाचा.",
        button: "Medium ब्लॉग पहा",
        hubButton: "ब्लॉग हब पहा",
    },
    bn: {
        kicker: "Insights",
        title: "Medium-এ আমাদের web design এবং SEO আর্টিকেল পড়ুন।",
        description: "The Adamant-এর Medium ব্লগে website strategy, UX, SEO foundations এবং digital product insights পড়ুন।",
        button: "Medium ব্লগ দেখুন",
        hubButton: "ব্লগ হাব দেখুন",
    },
    ta: {
        kicker: "Insights",
        title: "Medium-ல் எங்களின் web design மற்றும் SEO கட்டுரைகளை படிக்கவும்.",
        description: "The Adamant Medium பக்கத்தில் website strategy, UX, SEO foundations மற்றும் digital product insights படிக்கலாம்.",
        button: "Medium வலைப்பதிவை திறக்கவும்",
        hubButton: "ப்ளாக் ஹப்பை திறக்கவும்",
    },
    es: {
        kicker: "Insights",
        title: "Lee nuestros artículos de diseño web y SEO en Medium.",
        description: "Sigue a The Adamant en Medium para leer sobre estrategia web, UX, SEO y producto digital.",
        button: "Visitar blog en Medium",
        hubButton: "Abrir blog hub",
    },
    fr: {
        kicker: "Insights",
        title: "Lisez nos articles sur le design web et le SEO sur Medium.",
        description: "Suivez The Adamant sur Medium pour des articles sur la stratégie web, l'UX, le SEO et le produit digital.",
        button: "Voir le blog Medium",
        hubButton: "Ouvrir le hub blog",
    },
    de: {
        kicker: "Insights",
        title: "Lesen Sie unsere Artikel zu Webdesign und SEO auf Medium.",
        description: "Folgen Sie The Adamant auf Medium für Beiträge zu Webstrategie, UX, SEO-Grundlagen und digitalen Produkten.",
        button: "Medium-Blog öffnen",
        hubButton: "Blog-Hub öffnen",
    },
    pt: {
        kicker: "Insights",
        title: "Leia nossos artigos de web design e SEO no Medium.",
        description: "Acompanhe a The Adamant no Medium para conteúdos sobre estratégia web, UX, SEO e produto digital.",
        button: "Visitar blog no Medium",
        hubButton: "Abrir blog hub",
    },
    ja: {
        kicker: "Insights",
        title: "MediumでWebデザインとSEOの記事を読む。",
        description: "The AdamantのMediumでは、Web戦略、UX、SEO基盤、デジタルプロダクトに関する記事を公開しています。",
        button: "Mediumブログを見る",
        hubButton: "ブログハブを見る",
    },
};

export default function Footer({
    copy,
    locale,
}: {
    copy: SiteCopy["footer"];
    locale: SiteLocale;
}) {
    const mediumCopy = MEDIUM_COPY[locale];
    const footerSections = copy.sections.map((section, index) => (
        index === 0
            ? {
                ...section,
                links: [...section.links, {name: BLOG_LABELS[locale], anchor: "__blog__"}],
            }
            : section
    ));

    return <footer className="section-shell pb-12 pt-6">
        <div className="glass-panel overflow-hidden px-6 py-10 sm:px-8">
            <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr_0.9fr]">
                <div>
                    <div className="flex flex-col gap-4">
                        <AppLogo includeText={false} href={getLocalizedPath(locale)}/>
                        <h2 className="text-2xl font-semibold tracking-tight text-foreground">The Adamant</h2>
                        <p className="max-w-md text-sm leading-7 text-foreground/68">
                            {copy.description}
                        </p>
                    </div>

                    <div className="mt-6 flex gap-3">
                        <a href="https://www.instagram.com/theadamantofficial" className="social-link" target="_blank" rel="noreferrer" aria-label="The Adamant on Instagram">
                            <IconBrandInstagram className="social-icon"/>
                        </a>
                        <a href="https://www.linkedin.com/company/the-adamant" className="social-link" target="_blank" rel="noreferrer" aria-label="The Adamant on LinkedIn">
                            <IconBrandLinkedin className="social-icon"/>
                        </a>
                        <a href="https://x.com/theadamantofc" className="social-link" target="_blank" rel="noreferrer" aria-label="The Adamant on X">
                            <IconBrandX className="social-icon"/>
                        </a>
                        <a href="https://medium.com/@theadamant" className="social-link" target="_blank" rel="noreferrer" aria-label="The Adamant on Medium">
                            <IconBrandMedium className="social-icon"/>
                        </a>
                    </div>

                    <div className="mt-6 rounded-[1.6rem] border border-black/10 bg-white/68 p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-foreground/52">
                            {mediumCopy.kicker}
                        </p>
                        <h3 className="mt-3 text-lg font-semibold text-foreground">
                            {mediumCopy.title}
                        </h3>
                        <p className="mt-3 text-sm leading-7 text-foreground/68">
                            {mediumCopy.description}
                        </p>
                        <div className="mt-4 flex flex-wrap gap-3">
                            <Link href={getLocalizedPagePath(locale, "blog")} className="button-secondary">
                                {mediumCopy.hubButton}
                            </Link>
                            <a
                                href={MEDIUM_URL}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-2 text-sm font-semibold text-foreground/72 transition hover:text-foreground"
                            >
                                {mediumCopy.button}
                            </a>
                        </div>
                    </div>
                </div>

                {footerSections.map((section) => (
                    <div key={section.title} className="flex flex-col gap-4">
                        <h3 className="text-sm font-semibold uppercase tracking-[0.24em] text-foreground/55">{section.title}</h3>

                        <ul className="space-y-2">
                            {section.links.map((link) => (
                                <li key={link.name}>
                                    <Link
                                        href={link.anchor === "__blog__" ? getLocalizedPagePath(locale, "blog") : getLocalizedPath(locale, link.anchor)}
                                        className="text-sm text-foreground/70 transition hover:text-foreground hover:underline"
                                    >
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>

            <div className="mt-10 flex flex-col gap-3 border-t border-black/10 pt-6 text-sm text-foreground/62 dark:border-white/10 sm:flex-row sm:items-center sm:justify-between">
                <p>&copy; {new Date().getFullYear()} {copy.copyright}</p>
                <p>{copy.tagline}</p>
            </div>
        </div>
    </footer>
}
