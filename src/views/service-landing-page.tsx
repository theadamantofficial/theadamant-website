import dynamic from "next/dynamic";
import Link from "next/link";
import {CheckCircle2} from "lucide-react";
import {Navbar} from "@/components/layouts/navbar";
import Footer from "@/components/layouts/footer";
import ContactUsSection from "@/components/sections/contact-us-section";
import {DEFAULT_SITE_LOCALE} from "@/lib/site-locale";
import {getSiteCopy} from "@/lib/site-copy";
import {getSiteUrl} from "@/lib/site-url";
import {ServiceLandingPageConfig} from "@/lib/service-landing-pages";
import {ServiceLandingHero} from "@/components/sections/service-landing-hero";
import {
    ServiceGlideSection,
    ServiceLandingProgress,
} from "@/components/sections/service-landing-motion";
import {AnimatedFaqList} from "@/components/ui/animated-faq-list";
import {Reveal, StaggerGroup, StaggerItem} from "@/components/ui/reveal";

const WebsiteAuditFab = dynamic(
    () => import("@/components/ui/website-audit-fab").then((module) => module.WebsiteAuditFab),
);
const SeoChatFab = dynamic(
    () => import("@/components/ui/seo-chat-fab").then((module) => module.SeoChatFab),
);

const copy = getSiteCopy(DEFAULT_SITE_LOCALE);

export default function ServiceLandingPage({
    page,
}: {
    page: ServiceLandingPageConfig;
}) {
    const siteUrl = getSiteUrl();
    const pageUrl = `${siteUrl}/${page.slug}`;
    const pageSchema = {
        "@context": "https://schema.org",
        "@type": "ProfessionalService",
        name: `Adamant - ${page.metaTitle}`,
        url: pageUrl,
        description: page.metaDescription,
        image: `${siteUrl}${page.image}`,
        areaServed: buildAreaServed(page.slug),
        serviceType: page.title,
        provider: {
            "@type": "Organization",
            "@id": `${siteUrl}/#organization`,
            name: "Adamant",
            url: siteUrl,
            sameAs: [
                "https://www.instagram.com/theadamantofficial/",
                "https://www.linkedin.com/company/the-adamant",
                "https://x.com/theadamantofc",
                "https://medium.com/@theadamant",
            ],
        },
    };
    const breadcrumbSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
            {
                "@type": "ListItem",
                position: 1,
                name: "Home",
                item: siteUrl,
            },
            {
                "@type": "ListItem",
                position: 2,
                name: page.title,
                item: pageUrl,
            },
        ],
    };
    const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: page.faqs.map((faq) => ({
            "@type": "Question",
            name: faq.question,
            acceptedAnswer: {
                "@type": "Answer",
                text: faq.answer,
            },
        })),
    };

    return (
        <main className="relative min-h-screen overflow-x-clip">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{__html: JSON.stringify(pageSchema)}}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{__html: JSON.stringify(breadcrumbSchema)}}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{__html: JSON.stringify(faqSchema)}}
            />

            <Navbar copy={copy.navbar} locale={DEFAULT_SITE_LOCALE}/>
            {page.secondaryAction.kind === "audit" && <WebsiteAuditFab locale={DEFAULT_SITE_LOCALE}/>}
            <SeoChatFab/>
            <ServiceLandingProgress/>

            <ServiceLandingHero page={page}/>

            <ServiceGlideSection
                className="section-shell pb-12"
                ariaLabelledby="service-highlights-heading"
            >
                <Reveal className="glass-panel p-7 sm:p-8">
                    <div className="max-w-3xl">
                        <p className="section-kicker">Why teams choose this service</p>
                        <h2 id="service-highlights-heading" className="section-title">What this service means for your business</h2>
                        <p className="section-copy">
                            The work is shaped around the questions customers ask before they choose a provider: what you do, who it is for, what makes it credible, and what should happen next.
                        </p>
                    </div>

                    <StaggerGroup className="mt-8 grid gap-4 lg:grid-cols-3">
                        {page.highlights.map((item) => (
                            <StaggerItem key={item.title} className="h-full">
                                <article className="lift-card h-full rounded-[1.6rem] border border-black/8 bg-white/72 p-6 dark:border-white/10 dark:bg-white/5">
                                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-foreground text-background">
                                        <CheckCircle2 className="h-5 w-5"/>
                                    </div>
                                    <h3 className="mt-5 text-xl font-semibold tracking-tight text-foreground">{item.title}</h3>
                                    <p className="mt-3 text-sm leading-6 text-foreground/68">{item.description}</p>
                                </article>
                            </StaggerItem>
                        ))}
                    </StaggerGroup>
                </Reveal>
            </ServiceGlideSection>

            <ServiceGlideSection className="section-shell py-12">
                <StaggerGroup className="grid items-stretch gap-8 lg:grid-cols-[1.1fr_0.9fr]">
                    <StaggerItem className="h-full">
                    <div className="glass-panel h-full p-7 sm:p-8">
                        <p className="section-kicker">Scope</p>
                        <h2 className="section-title">{page.scopeTitle}</h2>
                        <p className="section-copy">
                            {page.scopeDescription}
                        </p>

                        <ul className="mt-8 grid gap-3">
                            {page.scopeItems.map((item) => (
                                <li
                                    key={item}
                                    className="rounded-[1.35rem] border border-black/8 bg-white/72 px-4 py-4 text-sm leading-7 text-foreground/70 dark:border-white/10 dark:bg-white/5"
                                >
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                    </StaggerItem>

                    <StaggerItem className="h-full">
                    <div className="glass-panel h-full p-7 sm:p-8">
                        <p className="section-kicker">Related pages</p>
                        <h2 className="section-title">Support the service with clearer internal links</h2>
                        <p className="section-copy">
                            These supporting routes give search engines clearer service context and let visitors move to the page that best matches their intent.
                        </p>

                        <div className="mt-8 grid gap-3">
                            {page.relatedLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className="rounded-[1.35rem] border border-black/8 bg-white/72 px-4 py-4 text-sm font-semibold text-foreground transition hover:border-black/16 hover:text-primary dark:border-white/10 dark:bg-white/5"
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </div>
                    </div>
                    </StaggerItem>
                </StaggerGroup>
            </ServiceGlideSection>

            <ServiceGlideSection
                className="section-shell pb-12 pt-12"
                ariaLabelledby="service-faq-heading"
            >
                <Reveal className="max-w-3xl">
                    <p className="section-kicker">FAQ</p>
                    <h2 id="service-faq-heading" className="section-title">Questions that usually come up before the first call</h2>
                    <p className="section-copy">
                        FAQ content helps both search engines and buyers understand how the service works, what it includes, and whether the page matches the project they want to discuss.
                    </p>
                </Reveal>

                <AnimatedFaqList items={page.faqs} className="mt-8" idPrefix={`${page.slug}-faq`}/>
            </ServiceGlideSection>

            <ContactUsSection copy={copy.contact} serviceType={page.eyebrow}/>
            <Footer copy={copy.footer} locale={DEFAULT_SITE_LOCALE}/>
        </main>
    );
}

function buildAreaServed(slug: string) {
    if (slug.includes("noida")) {
        return {
            "@type": "City",
            name: "Noida",
        };
    }

    if (slug.includes("india")) {
        return {
            "@type": "Country",
            name: "India",
        };
    }

    return [
        {
            "@type": "Country",
            name: "India",
        },
        {
            "@type": "Country",
            name: "United States",
        },
        {
            "@type": "Country",
            name: "United Kingdom",
        },
        {
            "@type": "Country",
            name: "Japan",
        },
    ];
}
