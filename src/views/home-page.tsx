import HeroSection from "@/components/sections/hero-section";
import {Navbar} from "@/components/layouts/navbar";
import Footer from "@/components/layouts/footer";
import ContactUsSection from "@/components/sections/contact-us-section";
import ServicesSection from "@/components/sections/services-section";
import ValuePropsSection from "@/components/sections/value-props-section";
import ProcessSection from "@/components/sections/process-section";
import FaqSection from "@/components/sections/faq-section";
import dynamic from "next/dynamic";
import {SiteCopy} from "@/lib/site-copy";
import {SiteLocale} from "@/lib/site-locale";

const MEDIUM_URL = "https://medium.com/@theadamant";

const WebsiteAuditFab = dynamic(
    () => import("@/components/ui/website-audit-fab").then((module) => module.WebsiteAuditFab),
);

export default function HomePage({
    copy,
    locale,
}: {
    copy: SiteCopy;
    locale: SiteLocale;
}) {
    const schemas = [
        {
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "The Adamant",
            description: copy.schema.organizationDescription,
            inLanguage: locale,
            sameAs: [
                "https://www.instagram.com/theadamantofficial",
                "https://www.linkedin.com/company/the-adamant",
                "https://x.com/theadamantofc",
                "https://medium.com/@theadamant",
            ],
        },
        {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            inLanguage: locale,
            mainEntity: copy.faq.items.map((item) => ({
                "@type": "Question",
                name: item.question,
                acceptedAnswer: {
                    "@type": "Answer",
                    text: item.answer,
                },
            })),
        },
        {
            "@context": "https://schema.org",
            "@type": "Blog",
            name: "The Adamant on Medium",
            url: MEDIUM_URL,
            inLanguage: locale,
            description: "Articles and insights from The Adamant about web design, UX, website development, SEO, and digital products.",
            publisher: {
                "@type": "Organization",
                name: "The Adamant",
                url: MEDIUM_URL,
            },
        },
    ];

    return <main className="relative w-full overflow-hidden">
        {schemas.map((schema, index) => (
            <script
                key={index}
                type="application/ld+json"
                dangerouslySetInnerHTML={{__html: JSON.stringify(schema)}}
            />
        ))}

        <Navbar copy={copy.navbar} locale={locale}/>

        <WebsiteAuditFab locale={locale}/>

        <HeroSection copy={copy.hero} locale={locale}/>

        <ValuePropsSection copy={copy.valueProps}/>

        <ServicesSection copy={copy.services}/>

        <ProcessSection copy={copy.process}/>

        <FaqSection copy={copy.faq}/>

        <ContactUsSection copy={copy.contact}/>

        <Footer copy={copy.footer} locale={locale}/>
    </main>;
}
