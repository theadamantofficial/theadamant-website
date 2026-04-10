import {Navbar} from "@/components/layouts/navbar";
import Footer from "@/components/layouts/footer";
import dynamic from "next/dynamic";
import {SiteCopy} from "@/lib/site-copy";
import {SiteLocale} from "@/lib/site-locale";

const HeroSection = dynamic(() => import("@/components/sections/hero-section"));
const PartnerProofStrip = dynamic(() => import("@/components/sections/partner-proof-strip"));
const ValuePropsSection = dynamic(() => import("@/components/sections/value-props-section"));
const ServicesSection = dynamic(() => import("@/components/sections/services-section"));
const ProcessSection = dynamic(() => import("@/components/sections/process-section"));
const FaqSection = dynamic(() => import("@/components/sections/faq-section"));
const ContactUsSection = dynamic(() => import("@/components/sections/contact-us-section"));
const WebsiteAuditFab = dynamic(
    () => import("@/components/ui/website-audit-fab").then((module) => module.WebsiteAuditFab),
);
const SeoChatFab = dynamic(
    () => import("@/components/ui/seo-chat-fab").then((module) => module.SeoChatFab),
);

export default function HomePage({
    copy,
    locale,
}: {
    copy: SiteCopy;
    locale: SiteLocale;
}) {
    const proofItems = copy.services.items.filter((item) => (item.proofHighlights?.length ?? 0) > 0);
    const servicesCopy = {
        ...copy.services,
        items: copy.services.items.filter((item) => (item.proofHighlights?.length ?? 0) === 0),
    };
    const schemas = [
        {
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "The Adamant",
            description: copy.schema.organizationDescription,
            inLanguage: locale,
            sameAs: [
                "https://www.instagram.com/theadamantofficial/",
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

        {locale === "en" && <WebsiteAuditFab locale={locale}/>}
        {locale === "en" && <SeoChatFab/>}

        <HeroSection copy={copy.hero} locale={locale}/>

        <PartnerProofStrip copy={copy.services.proofStrip} items={proofItems}/>

        <ValuePropsSection copy={copy.valueProps}/>

        <ServicesSection copy={servicesCopy} locale={locale}/>

        <ProcessSection copy={copy.process}/>

        <FaqSection copy={copy.faq}/>

        <ContactUsSection copy={copy.contact}/>

        <Footer copy={copy.footer} locale={locale}/>
    </main>;
}
