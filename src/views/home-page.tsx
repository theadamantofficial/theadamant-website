import HeroSection from "@/components/sections/hero-section";
import {Navbar} from "@/components/layouts/navbar";
import Footer from "@/components/layouts/footer";
import ContactUsSection from "@/components/sections/contact-us-section";
import ServicesSection from "@/components/sections/services-section";
import ValuePropsSection from "@/components/sections/value-props-section";
import ProcessSection from "@/components/sections/process-section";
import FaqSection, {faqItems} from "@/components/sections/faq-section";

export default function HomePage() {
    const schemas = [
        {
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "The Adamant",
            description: "The Adamant designs websites, product interfaces, and mobile experiences with clear messaging, fast performance, and SEO-ready foundations.",
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
            mainEntity: faqItems.map((item) => ({
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

        <Navbar/>

        <HeroSection/>

        <ValuePropsSection/>

        <ServicesSection/>

        <ProcessSection/>

        <FaqSection/>

        <ContactUsSection/>

        <Footer/>
    </main>;
}
