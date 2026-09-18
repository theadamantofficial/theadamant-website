import {Navbar} from "@/components/layouts/navbar";
import Footer from "@/components/layouts/footer";
import dynamic from "next/dynamic";
import {SiteCopy} from "@/lib/site-copy";
import {SiteLocale} from "@/lib/site-locale";
import {getSiteUrl} from "@/lib/site-url";
import HomeSeoContentSection from "@/components/sections/home-seo-content-section";
import TechnologyStackSection from "@/components/sections/technology-stack-section";
import IndustriesSection from "@/components/sections/industries-section";
import InternationalMarketSection from "@/components/sections/international-market-section";
import AdamantSystemSection from "@/components/experience/adamant-system-section";
import HeroSection from "@/components/sections/hero-section";
import PeelReveal from "@/components/visuals/peel-reveal";
import {getRegionalSeo} from "@/lib/regional-seo";
import {
    BUSINESS_ADDRESS_SCHEMA,
    BUSINESS_NAME,
    BUSINESS_PHONE,
    LEGAL_BUSINESS_NAME,
} from "@/lib/business";

const CompanyCredentialsSection = dynamic(() => import("@/components/sections/company-credentials-section"));
const PartnerProofStrip = dynamic(() => import("@/components/sections/partner-proof-strip"));
const ValuePropsSection = dynamic(() => import("@/components/sections/value-props-section"));
const ServicesSection = dynamic(() => import("@/components/sections/services-section"));
const ClientWorkSection = dynamic(() => import("@/components/sections/client-work-section"));
const ProcessSection = dynamic(() => import("@/components/sections/process-section"));
const TestimonialsSection = dynamic(() => import("@/components/sections/testimonials-section"));
const FaqSection = dynamic(() => import("@/components/sections/faq-section"));
const ContactUsSection = dynamic(() => import("@/components/sections/contact-us-section"));
const CursorHalo = dynamic(() => import("@/components/visuals/cursor-halo"));
const DeferredPathToSuccess = dynamic(() => import("@/components/experience/deferred-experiences").then((module) => module.DeferredPathToSuccess));
const NonCriticalTools = dynamic(() => import("@/components/ui/non-critical-tools").then((module) => module.NonCriticalTools));

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
    const regionalSeo = getRegionalSeo(locale);
    const schemas = [
        {
            "@context": "https://schema.org",
            "@type": "Organization",
            "@id": `${getSiteUrl()}/#organization`,
            name: BUSINESS_NAME,
            alternateName: ["Adamant Technologies", "Adamant"],
            url: getSiteUrl(),
            legalName: LEGAL_BUSINESS_NAME,
            telephone: BUSINESS_PHONE,
            address: BUSINESS_ADDRESS_SCHEMA,
            foundingDate: "2026-04-27",
            description: copy.schema.organizationDescription,
            areaServed: {
                "@type": regionalSeo.countryCode === "001" ? "Place" : "Country",
                name: regionalSeo.region,
                identifier: regionalSeo.countryCode,
            },
            logo: `${getSiteUrl()}/opengraph-image`,
            inLanguage: locale,
            identifier: {
                "@type": "PropertyValue",
                propertyID: "DPIIT Certificate Number",
                value: "DIPP260656",
            },
            award: "DPIIT Startup Recognition - DIPP260656",
            sameAs: [
                "https://www.instagram.com/theadamantofficial/",
                "https://www.linkedin.com/company/the-adamant",
                "https://x.com/theadamantofc",
                "https://medium.com/@theadamant",
            ],
        },
        {
            "@context": "https://schema.org",
            "@type": "WebSite",
            "@id": `${getSiteUrl()}/#website`,
            name: "Adamant Technologies",
            url: getSiteUrl(),
            publisher: {"@id": `${getSiteUrl()}/#organization`},
            potentialAction: {
                "@type": "SearchAction",
                target: `${getSiteUrl()}/blog?query={search_term_string}`,
                "query-input": "required name=search_term_string",
            },
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

    return <main className="relative w-full overflow-x-clip">
        {schemas.map((schema, index) => (
            <script
                key={index}
                type="application/ld+json"
                dangerouslySetInnerHTML={{__html: JSON.stringify(schema)}}
            />
        ))}

        <Navbar copy={copy.navbar} locale={locale}/>

        <NonCriticalTools locale={locale}/>

        <PeelReveal/>
        <CursorHalo/>

        <HeroSection copy={copy.hero} locale={locale}/>

        <InternationalMarketSection locale={locale}/>

        <AdamantSystemSection services={copy.services} locale={locale}/>

        <ClientWorkSection locale={locale}/>

        <CompanyCredentialsSection copy={copy.credentials} locale={locale}/>

        <ValuePropsSection copy={copy.valueProps}/>

        <ServicesSection copy={servicesCopy} locale={locale}/>

        <PartnerProofStrip copy={copy.services.proofStrip} items={proofItems}/>

        <ProcessSection copy={copy.process}/>

        <TestimonialsSection locale={locale}/>

        <IndustriesSection locale={locale}/>

        <TechnologyStackSection locale={locale}/>

        <HomeSeoContentSection locale={locale}/>

        <FaqSection copy={copy.faq}/>

        <ContactUsSection copy={copy.contact}/>

        <DeferredPathToSuccess locale={locale}/>

        <Footer copy={copy.footer} locale={locale}/>
    </main>;
}
