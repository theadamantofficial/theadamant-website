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
        "user interface design",
        "conversion rate optimisation",
        "conversion rate optimization",
        "UI UX designing",
        "UX design and UI design",
        "digital marketing agency India",
        "digital marketing firms in India",
        "digital advertising companies in India",
        "India SEO company",
        "Indian SEO agency",
        "SEO firms India",
        "India SEO firm",
        "SEO company from India",
        "SEO provider in India",
        "search engine optimization companies in India",
        "search engine optimization agency in India",
        "web programming company",
        "development website company",
        "digital marketing business in India",
        "mobile app designing company",
        "digital marketing agency Delhi",
        "digital marketing agency Bangalore",
        "digital marketing agency Ahmedabad",
        "SEO agency Mumbai",
    ],
    alternates: {
        canonical: "/industries-served",
    },
};

const industries = [
    ["Technology startups", "Launch a credible product website that explains what the software does, who it helps, and why it is different. We can support product pages, investor-facing content, SaaS onboarding journeys, dashboards, and an SEO foundation for organic growth."],
    ["Professional services", "Turn expertise into a clear digital presence with service pages, case studies, trust signals, lead-generation forms, and useful answers to common customer questions. This works well for consultants, agencies, legal teams, accountants, and other expert-led businesses."],
    ["Education and training", "Make courses, institutions, and learning products easier to discover with structured information, accessible page layouts, enquiry flows, and content that helps learners or parents choose with confidence."],
    ["Real estate and construction", "Present properties, projects, services, locations, and enquiries in a way that helps prospects compare options. We create property websites, project pages, location-focused SEO content, galleries, and lead-capture journeys."],
    ["Healthcare and wellness", "Build trustworthy digital experiences with clear service information, accessible navigation, appointment or enquiry flows, and content structured around real patient and customer questions. The emphasis is on clarity without making unsupported claims."],
    ["Ecommerce and retail", "Create useful product catalogues, Shopify stores, category pages, product journeys, payment flows, and campaigns that connect search discovery to purchase. We also improve mobile shopping experiences and conversion paths."],
    ["Travel, hospitality, and food", "Build booking, ordering, discovery, and loyalty experiences for hotels, restaurants, travel companies, cafes, and food brands. Location pages, menus, galleries, reviews, and clear calls to action help customers decide faster."],
    ["Photography and creative businesses", "Create portfolio websites, galleries, booking flows, personal brands, and creator platforms that put the work first. Fast image delivery, simple enquiries, service packages, and local SEO help creative businesses attract the right clients."],
    ["Finance and insurance", "Design clear digital experiences for financial products, insurance services, fintech teams, and customer support journeys. We focus on understandable content, structured navigation, secure handoffs, and a professional experience across devices."],
    ["Logistics and transportation", "Connect customers and operations with tracking tools, service websites, quote forms, portals, dashboards, and workflow automation. Clear service information helps businesses explain routes, coverage, delivery options, and next steps."],
    ["Manufacturing and energy", "Explain complex capabilities in plain language, support distributors, and improve enquiries with practical websites, product pages, industry content, and digital systems that make technical information easier to use."],
    ["Media, entertainment, and sports", "Build content platforms, fan experiences, campaign sites, membership journeys, and digital products for audiences that expect speed and clarity. Structured content and strong media presentation keep the experience easy to explore."],
    ["Local and service businesses", "Give local teams a stronger presence with service pages, location content, booking or enquiry flows, Google-friendly technical foundations, and ongoing digital marketing support that is tied to real business goals."],
];

const solutions = [
    ["Websites and redesigns", "We plan and build marketing websites, service pages, portfolios, landing pages, ecommerce stores, and location pages around the way customers search, compare, and make contact. A redesign can also improve messaging, mobile usability, speed, and conversion paths without losing valuable content."],
    ["Mobile applications", "We help shape customer apps, internal tools, booking flows, ordering experiences, and cross-platform products. The work can cover user journeys, interface design, Flutter or native development planning, analytics, and the practical steps needed for a reliable launch."],
    ["SaaS and web applications", "For software companies and internal platforms, we support product discovery, UX flows, dashboards, APIs, user roles, integrations, and launch planning. The aim is to make complex workflows easier to understand for both new users and the teams who manage the product."],
    ["SEO and content systems", "Our SEO work combines technical checks, search-intent mapping, industry pages, internal links, metadata, analytics, and useful content. The goal is not to repeat keywords; it is to make each page relevant to a real question and useful after someone arrives from search."],
    ["Automation and AI workflows", "We can connect n8n workflows, AI integrations, CRM systems, notifications, reporting, and repetitive business tasks. Automation is planned around a clear process so it saves time, reduces manual errors, and remains understandable for the team using it."],
    ["Digital marketing and growth", "We connect social media, paid campaigns, landing pages, brand positioning, SEO content, and measurement to a clear business goal. This gives each channel a useful role, from attracting attention to creating qualified enquiries or product sign-ups."],
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
                Whether you are launching a software product, promoting a photography portfolio, selling online, managing property enquiries, or improving an established company website, we connect strategy, design, development, and growth into one practical digital plan. That can include a new website, a mobile or SaaS product, technical SEO, content planning, automation, AI integrations, or ongoing digital marketing support.
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
