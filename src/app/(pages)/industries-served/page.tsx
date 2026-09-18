import type {Metadata} from "next";
import Link from "next/link";
import {getSiteUrl} from "@/lib/site-url";

export const metadata: Metadata = {
    title: {
        absolute: "Industries Served | Web, App and Digital Marketing | Adamant",
    },
    description: "Adamant Technologies creates websites, mobile apps, SaaS products, and digital marketing systems for technology, professional services, education, real estate, healthcare, ecommerce, and local businesses.",
    alternates: {
        canonical: "/industries-served",
    },
};

const industries = [
    ["Technology startups", "Launch a credible product website, explain a technical offer clearly, and create a foundation for organic growth and investor or customer conversations."],
    ["Professional services", "Turn expertise into a clear digital presence with service pages, proof, lead-generation journeys, and content that answers high-intent questions."],
    ["Education and training", "Make courses, institutions, and learning products easier to discover with structured information, conversion-focused pages, and accessible user flows."],
    ["Real estate and construction", "Present projects, services, locations, and enquiries in a way that helps prospects compare options and take the next step."],
    ["Healthcare and wellness", "Build trustworthy experiences with clear service information, accessible navigation, and content structured around real patient or customer questions."],
    ["Ecommerce and retail", "Create useful catalogues, Shopify stores, product journeys, local search signals, and campaigns that connect discovery to action."],
    ["Travel, hospitality, and food", "Build booking, ordering, discovery, and loyalty experiences for hotels, restaurants, travel companies, and food businesses."],
    ["Photography and creative businesses", "Create portfolio websites, galleries, booking flows, personal brands, and creator platforms that put the work first."],
    ["Finance and insurance", "Design clear digital experiences for financial products, insurance services, fintech teams, and customer support journeys."],
    ["Logistics and transportation", "Connect customers and operations with tracking tools, service websites, portals, and workflow automation."],
    ["Manufacturing and energy", "Explain complex capabilities, support distributors, and improve enquiries with practical websites and digital systems."],
    ["Media, entertainment, and sports", "Build content platforms, fan experiences, campaign sites, and digital products for audiences that expect speed and clarity."],
    ["Local and service businesses", "Give local teams a stronger presence with service pages, booking or enquiry flows, SEO, and ongoing marketing support."],
];

export default function IndustriesServedPage() {
    const siteUrl = getSiteUrl();
    const schema = {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: "Industries Served by Adamant Technologies",
        url: `${siteUrl}/industries-served`,
        description: "Industries served by JSSS Adamant Technologies Private Limited.",
        about: industries.map(([name]) => name),
        isPartOf: {"@id": `${siteUrl}/#website`},
    };

    return (
        <main className="min-h-screen bg-background px-6 py-24 text-foreground sm:px-10 lg:px-16">
            <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(schema)}}/>
            <div className="mx-auto max-w-6xl">
                <p className="section-kicker">Industries served</p>
                <h1 className="mt-5 max-w-4xl text-4xl font-semibold tracking-tight sm:text-6xl">
                    Digital experiences shaped around how your industry earns trust.
                </h1>
                <p className="mt-8 max-w-3xl text-lg leading-8 text-foreground/70">
                    A website or product should reflect the questions, decision cycles, regulations, and expectations of the people it serves. Adamant combines industry context with strong design, development, and search foundations.
                </p>

                <div className="mt-16 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                    {industries.map(([title, description]) => (
                        <article key={title} className="rounded-3xl border border-foreground/10 bg-foreground/[0.03] p-6">
                            <h2 className="text-xl font-semibold">{title}</h2>
                            <p className="mt-3 text-sm leading-6 text-foreground/65">{description}</p>
                        </article>
                    ))}
                </div>

                <section className="mt-16 rounded-3xl border border-foreground/10 bg-foreground/[0.03] p-8">
                    <h2 className="text-2xl font-semibold">Need a different industry focus?</h2>
                    <p className="mt-3 max-w-2xl leading-7 text-foreground/65">
                        Share the audience, service, product, location, and growth target. We can map the content structure and digital experience around the real buying journey rather than forcing your business into a generic template.
                    </p>
                    <div className="mt-6 flex flex-wrap gap-4">
                        <Link href="/#contact" className="button-primary">Discuss your project</Link>
                        <Link href="/website-development" className="button-secondary">See website development</Link>
                    </div>
                </section>
            </div>
        </main>
    );
}
