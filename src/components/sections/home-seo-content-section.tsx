import Link from "next/link";
import {SiteLocale} from "@/lib/site-locale";

const serviceDetails = [
    {
        title: "Website development and redesign",
        body: "We plan and build SEO-friendly business websites, service websites, campaign landing pages, and marketing sites that communicate the offer quickly. The work includes information architecture, responsive UI, accessible components, technical SEO, content hierarchy, analytics readiness, and a practical editing workflow. The result is not just a visual redesign; it is a faster and clearer path from search result to qualified enquiry.",
        href: "/website-development",
        label: "Explore website development",
    },
    {
        title: "UI/UX and digital product design",
        body: "For SaaS companies, mobile products, and complex services, Adamant turns difficult journeys into understandable interfaces. We map user goals, content, screens, states, and calls to action before development. This helps teams reduce ambiguity, improve onboarding, and launch a product experience that feels consistent across desktop, tablet, and mobile while supporting conversion-focused search traffic.",
        href: "/website-development",
        label: "See UX and website strategy",
    },
    {
        title: "Mobile app development",
        body: "We help international founders and businesses shape focused mobile product releases, from discovery and user flows through interface design and development. A useful first release should solve a real problem, explain its value clearly, and create a foundation for later features. Our app work connects the product experience with its website, launch content, analytics, and growth plan.",
        href: "/app-development-india",
        label: "Explore mobile app development",
    },
    {
        title: "SaaS product development",
        body: "For founders and teams turning a product idea into a focused release, we connect product scope, user flows, interface design, engineering planning, and launch measurement.",
        href: "/saas-development-company",
        label: "Explore SaaS development",
    },
    {
        title: "Technical SEO and content strategy",
        body: "International search visibility starts with pages that can be crawled, understood, and matched to a real audience. We review indexing, site structure, service-page intent, internal links, metadata, and multilingual signals, then prioritize changes against qualified visits and enquiries.",
        href: "/technical-seo-services",
        label: "Explore technical SEO services",
    },
    {
        title: "Digital marketing and organic growth",
        body: "After launch, visibility depends on more than publishing occasional posts. We connect search intent, useful content, social media, brand positioning, paid campaigns, landing pages, and measurement. This gives every channel a clear role: attract the right audience, answer its questions, build confidence, and create a next step that can be measured.",
        href: "/digital-marketing-services",
        label: "Explore digital marketing",
    },
    {
        title: "Ecommerce website development",
        body: "An online store needs more than a product grid. We plan category navigation, product information, mobile shopping flows, checkout, and search-ready content around how customers compare and buy. The right platform and integrations depend on the catalog, market, and operations behind the store.",
        href: "/ecommerce-website-development",
        label: "Explore ecommerce development",
    },
    {
        title: "WordPress development and redesign",
        body: "For teams that need an editable marketing site, we build or improve WordPress pages with responsive design, clear service content, technical SEO foundations, and a manageable publishing workflow. Existing useful content can be preserved while the structure and experience improve.",
        href: "/wordpress-development-company",
        label: "Explore WordPress development",
    },
    {
        title: "CRM development and integrations",
        body: "A custom CRM can connect leads, sales stages, customer records, tasks, reporting, and the tools a team already uses. We map the workflow before building so the system supports real handoffs across sales, service, and marketing instead of adding another isolated dashboard.",
        href: "/crm-development-services",
        label: "Explore CRM development",
    },
    {
        title: "AI automation for business workflows",
        body: "Practical AI automation starts with a repeatable task and a clear review process. We help teams connect forms, CRM data, documents, and communication tools through useful integrations and human-reviewed workflows that save time without hiding how decisions are made.",
        href: "/ai-automation-services",
        label: "Explore AI automation",
    },
];

export default function HomeSeoContentSection({locale}: {locale: SiteLocale}) {
    if (locale !== "en") {
        return null;
    }

    return (
        <section className="section-shell py-20 sm:py-28" aria-labelledby="home-seo-content-heading">
            <div className="rounded-[2rem] border border-foreground/10 bg-foreground/[0.03] p-7 sm:p-10 lg:p-14">
                <div className="max-w-4xl">
                    <p className="section-kicker">A digital partner for the whole growth journey</p>
                    <h2 id="home-seo-content-heading" className="section-title">
                        Website, app, SaaS, and digital marketing services from Adamant Technologies
                    </h2>
                    <p className="mt-6 text-base leading-8 text-foreground/72">
                        Adamant Technologies is an Indian web design and digital growth company helping startups, professional service firms, local businesses, and growing brands build a stronger online presence. We combine strategy, copy direction, user experience, development, technical SEO, and measurable marketing so a website is easier to find on Google, easier to trust, and more likely to convert the right enquiries.
                    </p>
                    <p className="mt-5 text-base leading-8 text-foreground/72">
                        A visitor may discover a company through Google, a social post, a recommendation, an advertisement, or a product launch. In each case, the experience needs to answer the same essential questions: what does this company do, who is it for, why should someone trust it, and what should happen next? Our work is structured around those questions with clear page hierarchy, useful content, internal links, and conversion-focused messaging instead of vague claims or unnecessary complexity.
                    </p>
                </div>

                <div className="mt-12 grid gap-5 lg:grid-cols-2">
                    {serviceDetails.map((service) => (
                        <article key={service.title} className="rounded-3xl border border-foreground/10 bg-background/55 p-6 sm:p-7">
                            <h3 className="text-xl font-semibold tracking-tight">{service.title}</h3>
                            <p className="mt-4 text-sm leading-7 text-foreground/68">{service.body}</p>
                            {service.href && service.label ? (
                                <Link href={service.href} className="mt-5 inline-flex text-sm font-semibold underline decoration-foreground/25 underline-offset-4 hover:decoration-foreground">
                                    {service.label} →
                                </Link>
                            ) : null}
                        </article>
                    ))}
                </div>

                <div className="mt-10 rounded-3xl border border-foreground/10 bg-background/55 p-6 sm:p-7">
                    <h3 className="text-2xl font-semibold tracking-tight">Explore services by market and project goal</h3>
                    <p className="mt-3 max-w-3xl text-sm leading-7 text-foreground/68">
                        Start with a focused page for your location or project. The service guides above cover global website builds, ecommerce, mobile apps, SaaS, CRM, AI automation, and digital marketing.
                    </p>
                    <nav aria-label="Main services" className="mt-5 flex flex-wrap gap-x-5 gap-y-3 text-sm font-semibold">
                        {[
                            ["/website-development-india", "Website development in India"],
                            ["/web-design-company-india", "Web design in India"],
                            ["/website-development-noida", "Website development in Noida"],
                            ["/website-development-delhi-ncr", "Website development in Delhi NCR"],
                            ["/seo-company-noida", "SEO services in Noida"],
                            ["/industries-served", "Industries we serve"],
                        ].map(([href, label]) => (
                            <Link key={href} href={href} className="text-primary underline decoration-primary/25 underline-offset-4 hover:decoration-primary">
                                {label} →
                            </Link>
                        ))}
                    </nav>
                </div>

                <article className="mt-8 rounded-3xl border border-primary/20 bg-primary/[0.06] p-6 sm:p-7">
                    <p className="section-kicker">Selected product work</p>
                    <h3 className="mt-3 text-2xl font-semibold tracking-tight">AetherSEO: an SEO workspace built by Adamant</h3>
                    <p className="mt-4 max-w-3xl text-sm leading-7 text-foreground/70">
                        AetherSEO is Adamant&apos;s in-house SEO workspace for multilingual publishing, audits, content operations, and workflow tracking. It shows how we approach product strategy, structured workflows, and practical software experiences beyond marketing pages.
                    </p>
                    <Link href="https://aetherseo.com/en" target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex text-sm font-semibold underline decoration-foreground/25 underline-offset-4 hover:decoration-foreground">
                        Explore AetherSEO →
                    </Link>
                </article>

                <div className="mt-12 grid gap-8 border-t border-foreground/10 pt-10 lg:grid-cols-[1.1fr_0.9fr]">
                    <div>
                        <h3 className="text-2xl font-semibold tracking-tight">Built for Indian and international markets</h3>
                        <p className="mt-4 text-sm leading-7 text-foreground/68">
                            We work with businesses in Noida, Delhi NCR, across India, and in international markets including the USA, UK, and Japan. For a cross-border launch, our <Link href="/website-development" className="font-semibold text-primary underline decoration-primary/25 underline-offset-4">global website development service</Link> connects messaging, UX, performance, and technical SEO. Teams building a product can also explore <Link href="/saas-development-company" className="font-semibold text-primary underline decoration-primary/25 underline-offset-4">SaaS development</Link> and <Link href="/app-development-india" className="font-semibold text-primary underline decoration-primary/25 underline-offset-4">mobile app development</Link> with remote collaboration from India.
                        </p>
                        <p className="mt-4 text-sm leading-7 text-foreground/68">
                            The same principle applies to industries. Technology, education, professional services, real estate, construction, healthcare, ecommerce, and local businesses each have different questions and decision cycles. A good website makes those differences visible through its content, proof, navigation, and conversion flow.
                        </p>
                        <nav aria-label="International homepage versions" className="mt-5 flex flex-wrap gap-x-4 gap-y-2 text-sm font-semibold">
                            <Link href="/en-us" className="text-primary underline decoration-primary/25 underline-offset-4">United States (English)</Link>
                            <Link href="/ja" className="text-primary underline decoration-primary/25 underline-offset-4">Japan (日本語)</Link>
                            <Link href="/de-ch" className="text-primary underline decoration-primary/25 underline-offset-4">Switzerland (Deutsch)</Link>
                            <Link href="/ar" className="text-primary underline decoration-primary/25 underline-offset-4">UAE (العربية)</Link>
                            <Link href="/zh-cn" className="text-primary underline decoration-primary/25 underline-offset-4">China (简体中文)</Link>
                        </nav>
                    </div>
                    <div>
                        <h3 className="text-2xl font-semibold tracking-tight">A process designed to reduce rework</h3>
                        <p className="mt-4 text-sm leading-7 text-foreground/68">
                            We begin with the audience, offer, competitors, search intent, and business goal. We then shape the content structure and user journey before refining the visual system and implementation. After launch, analytics, enquiries, search visibility, and user behaviour show where the next improvement should happen.
                        </p>
                        <Link href="/about" className="mt-5 inline-flex text-sm font-semibold underline decoration-foreground/25 underline-offset-4 hover:decoration-foreground">
                            Learn about Adamant Technologies →
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}
