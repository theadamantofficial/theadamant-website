import type {Metadata} from "next";
import Link from "next/link";
import {getSiteUrl} from "@/lib/site-url";

export const metadata: Metadata = {
    title: {
        absolute: "Industries We Serve | Web, App, SaaS and Digital Solutions | Adamant",
    },
    description: "Adamant Technologies builds websites, mobile apps, SaaS products, automation, SEO, and digital marketing solutions for technology, healthcare, education, ecommerce, real estate, photography, and growing businesses worldwide.",
    keywords: [
        "industries served by web development company",
        "web development for different industries",
        "industry specific website development",
        "website development for startups",
        "SaaS development for businesses",
        "mobile app development for businesses",
        "digital solutions for businesses",
        "technology solutions for small businesses",
        "ecommerce website development",
        "healthcare website development",
        "education website development",
        "real estate website development",
        "construction website development",
        "finance and fintech development",
        "travel and hospitality website development",
        "restaurant website development",
        "photography website development",
        "creative agency website development",
        "media and entertainment website development",
        "logistics software development",
        "manufacturing software development",
        "SEO for local businesses",
        "digital marketing for startups",
        "business automation services",
        "AI solutions for businesses",
    ],
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

const solutions = [
    ["Websites and redesigns", "Marketing websites, service pages, portfolios, landing pages, ecommerce stores, and location pages built around the way customers find and choose a business."],
    ["Mobile applications", "Customer apps, internal tools, booking flows, ordering experiences, and cross-platform products using practical mobile technology."],
    ["SaaS and web applications", "Product discovery, UX flows, dashboards, APIs, user roles, integrations, and launch support for software businesses and internal platforms."],
    ["SEO and content systems", "Technical SEO, search-intent mapping, industry pages, internal linking, analytics, and useful content that supports long-term visibility."],
    ["Automation and AI workflows", "n8n workflows, AI integrations, CRM connections, notifications, reporting, and repetitive processes that can be made simpler."],
    ["Digital marketing and growth", "Social media, paid campaigns, landing pages, brand positioning, and measurement connected to clear business goals."],
];

const faqs = [
    ["Which industries does Adamant Technologies work with?", "We work with technology, SaaS, professional services, education, healthcare, real estate, construction, ecommerce, retail, travel, hospitality, food, photography, creative businesses, finance, logistics, manufacturing, media, and local service businesses."],
    ["Can you build solutions for a niche or unusual industry?", "Yes. We start with the audience, buying journey, operational needs, and compliance considerations rather than forcing every business into the same template."],
    ["What digital solutions do you provide for each industry?", "Depending on the project, we provide websites, redesigns, mobile apps, SaaS products, web applications, SEO, digital marketing, automation, AI integrations, and ongoing improvement."],
    ["Do you work with international businesses?", "Yes. Adamant supports businesses in India and international markets with structured remote collaboration, clear milestones, and location-aware content and digital experiences."],
];

export default function IndustriesServedPage() {
    const siteUrl = getSiteUrl();
    const keywordList = metadata.keywords as string[];
    const schema = {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: "Industries Served by Adamant Technologies",
        url: `${siteUrl}/industries-served`,
        description: metadata.description,
        keywords: keywordList,
        about: industries.map(([name]) => name),
        isPartOf: {"@id": `${siteUrl}/#website`},
    };
    const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqs.map(([question, answer]) => ({
            "@type": "Question",
            name: question,
            acceptedAnswer: {"@type": "Answer", text: answer},
        })),
    };

    return (
        <main className="min-h-screen bg-background px-6 py-24 text-foreground sm:px-10 lg:px-16">
            <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(schema)}}/>
            <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(faqSchema)}}/>
            <div className="mx-auto max-w-6xl">
                <p className="section-kicker">Industries We Serve</p>
                <h1 className="mt-5 max-w-4xl text-4xl font-semibold tracking-tight sm:text-6xl">
                    Digital Solutions Shaped Around How Your Industry Earns Trust.
                </h1>
                <p className="mt-8 max-w-3xl text-lg leading-8 text-foreground/70">
                    Adamant Technologies works with businesses across India and international markets. We build websites, mobile apps, SaaS products, automation workflows, SEO systems, and digital marketing experiences that reflect the questions, decision cycles, regulations, and expectations of each industry.
                </p>
                <p className="mt-5 max-w-3xl text-base leading-8 text-foreground/65">
                    Whether you are launching a software product, promoting a photography portfolio, selling online, managing property enquiries, or improving an established company website, we connect strategy, design, development, and growth into one practical digital plan.
                </p>

                <div className="mt-16 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                    {industries.map(([title, description]) => (
                        <article key={title} className="rounded-3xl border border-foreground/10 bg-foreground/[0.03] p-6">
                            <h2 className="text-xl font-semibold">{title}</h2>
                            <p className="mt-3 text-sm leading-6 text-foreground/65">{description}</p>
                        </article>
                    ))}
                </div>

                <section className="mt-20" aria-labelledby="industry-solutions-heading">
                    <p className="section-kicker">Industry Solutions</p>
                    <h2 id="industry-solutions-heading" className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
                        One Partner For Your Website, Product, And Growth Work
                    </h2>
                    <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                        {solutions.map(([title, description]) => (
                            <article key={title} className="rounded-3xl border border-foreground/10 bg-foreground/[0.03] p-6">
                                <h3 className="text-lg font-semibold">{title}</h3>
                                <p className="mt-3 text-sm leading-6 text-foreground/65">{description}</p>
                            </article>
                        ))}
                    </div>
                </section>

                <section className="mt-20 rounded-3xl border border-primary/20 bg-primary/[0.05] p-8" aria-labelledby="industry-process-heading">
                    <p className="section-kicker">A Practical Process</p>
                    <h2 id="industry-process-heading" className="mt-3 text-3xl font-semibold tracking-tight">
                        Start With Your Business, Not A Generic Template
                    </h2>
                    <div className="mt-6 grid gap-6 text-sm leading-7 text-foreground/70 md:grid-cols-3">
                        <p><strong className="text-foreground">1. Understand:</strong> We learn about your customers, offer, competitors, location, and the actions that matter most.</p>
                        <p><strong className="text-foreground">2. Shape:</strong> We plan the content, user journeys, technology, design direction, and measurable goals around that context.</p>
                        <p><strong className="text-foreground">3. Improve:</strong> We launch a usable foundation and identify the next improvements through analytics, feedback, SEO, and business results.</p>
                    </div>
                </section>

                <section className="mt-20" aria-labelledby="industry-faq-heading">
                    <p className="section-kicker">Frequently Asked Questions</p>
                    <h2 id="industry-faq-heading" className="mt-3 text-3xl font-semibold tracking-tight">Questions About Our Industry Experience</h2>
                    <div className="mt-8 grid gap-5 md:grid-cols-2">
                        {faqs.map(([question, answer]) => (
                            <article key={question} className="rounded-3xl border border-foreground/10 bg-foreground/[0.03] p-6">
                                <h3 className="text-lg font-semibold">{question}</h3>
                                <p className="mt-3 text-sm leading-6 text-foreground/65">{answer}</p>
                            </article>
                        ))}
                    </div>
                </section>

                <section className="mt-16 rounded-3xl border border-foreground/10 bg-foreground/[0.03] p-8">
                    <h2 className="text-2xl font-semibold">Need A Different Industry Focus?</h2>
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
