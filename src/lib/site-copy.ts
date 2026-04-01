import bnCopy from "@/locales/bn.json";
import deCopy from "@/locales/de.json";
import enCopy from "@/locales/en.json";
import esCopy from "@/locales/es.json";
import frCopy from "@/locales/fr.json";
import guCopy from "@/locales/gu.json";
import hiCopy from "@/locales/hi.json";
import jaCopy from "@/locales/ja.json";
import mrCopy from "@/locales/mr.json";
import ptCopy from "@/locales/pt.json";
import taCopy from "@/locales/ta.json";
import {
    DEFAULT_SITE_LOCALE,
    SiteLocale,
} from "@/lib/site-locale";

interface LabeledItem {
    title: string;
    description: string;
}

interface FaqItem {
    question: string;
    answer: string;
}

interface ServiceItem {
    title: string;
    description: string;
    detail: string;
    image: string;
}

interface ProcessItem {
    number: string;
    title: string;
    description: string;
}

interface ContactOption {
    value: string;
    label: string;
}

export interface SiteCopy {
    locale: SiteLocale;
    dir: "ltr" | "rtl";
    metadata: {
        title: string;
        description: string;
    };
    schema: {
        organizationDescription: string;
    };
    navbar: {
        navItems: Array<{ name: string; anchor: string }>;
        startProject: string;
        lightMode: string;
        darkMode: string;
        languageAriaLabel: string;
    };
    hero: {
        kicker: string;
        title: string;
        description: string;
        primaryCta: string;
        secondaryCta: string;
        positioningPoints: string[];
        previewEyebrowLeft: string;
        previewEyebrowRight: string;
        floatingBadges: string[];
        featureCards: LabeledItem[];
    };
    valueProps: {
        kicker: string;
        title: string;
        description: string;
        items: LabeledItem[];
    };
    services: {
        kicker: string;
        title: string;
        description: string;
        chips: string[];
        items: ServiceItem[];
    };
    process: {
        kicker: string;
        title: string;
        description: string;
        steps: ProcessItem[];
    };
    faq: {
        kicker: string;
        title: string;
        description: string;
        items: FaqItem[];
    };
    contact: {
        kicker: string;
        title: string;
        description: string;
        highlights: LabeledItem[];
        briefTitle: string;
        briefDescription: string;
        briefItems: LabeledItem[];
        form: {
            fullNameLabel: string;
            fullNamePlaceholder: string;
            emailLabel: string;
            emailPlaceholder: string;
            purposeLabel: string;
            purposePlaceholder: string;
            descriptionLabel: string;
            descriptionPlaceholder: string;
            purposeOptions: ContactOption[];
            submitLabel: string;
            submittingLabel: string;
            successLabel: string;
            configError: string;
            sendError: string;
            successToast: string;
        };
    };
    footer: {
        description: string;
        sections: Array<{
            title: string;
            links: Array<{ name: string; anchor: string }>;
        }>;
        copyright: string;
        tagline: string;
    };
}

const siteCopyMap: Record<SiteLocale, SiteCopy> = {
    en: enCopy as SiteCopy,
    hi: hiCopy as SiteCopy,
    gu: guCopy as SiteCopy,
    mr: mrCopy as SiteCopy,
    bn: bnCopy as SiteCopy,
    ta: taCopy as SiteCopy,
    es: esCopy as SiteCopy,
    fr: frCopy as SiteCopy,
    de: deCopy as SiteCopy,
    pt: ptCopy as SiteCopy,
    ja: jaCopy as SiteCopy,
};

export function getSiteCopy(locale: SiteLocale): SiteCopy {
    return siteCopyMap[locale] ?? siteCopyMap[DEFAULT_SITE_LOCALE];
}
