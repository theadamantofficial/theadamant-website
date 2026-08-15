import type {Metadata} from "next";
import {getSiteUrl} from "@/lib/site-url";
import {buildOpenGraphMetadata, buildTwitterMetadata} from "@/lib/social-metadata";

interface LandingHighlight {
    title: string;
    description: string;
}

interface LandingFaq {
    question: string;
    answer: string;
}

interface LandingSecondaryAction {
    kind: "audit" | "link";
    label: string;
    href?: string;
}

interface LandingLink {
    href: string;
    label: string;
}

export interface ServiceLandingPageConfig {
    slug: string;
    image: string;
    eyebrow: string;
    title: string;
    intro: string;
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
    scopeTitle: string;
    scopeDescription: string;
    scopeItems: string[];
    highlights: LandingHighlight[];
    faqs: LandingFaq[];
    relatedLinks: LandingLink[];
    primaryCtaLabel: string;
    secondaryAction: LandingSecondaryAction;
}

const SERVICE_LANDING_PAGE_LIST: ServiceLandingPageConfig[] = [
    {
        slug: "website-development",
        image: "/images/img-web-dev.png",
        eyebrow: "Global website builds",
        title: "Website development company for global brands that need a sharper, faster website",
        intro: "Adamant builds custom business sites with clear messaging, semantic structure, and conversion-focused UX for teams in India, the USA, UK, Japan, and global markets. If you need a website development company that can ship SEO-friendly websites without bloated templates, this page is the starting point.",
        metaTitle: "Global Website Development Company | Adamant",
        metaDescription: "Need a global website development company for SEO-friendly websites with sharp UX and clean technical foundations? Adamant builds custom business websites for India, the USA, UK, Japan, and global markets.",
        keywords: [
            "global website development company",
            "website development company",
            "SEO-friendly websites",
            "custom website development",
            "website development USA UK Japan",
        ],
        scopeTitle: "What this website development service covers",
        scopeDescription: "The work is shaped around launch clarity, stronger conversion paths, and technical decisions that support long-term SEO instead of cleanup later.",
        scopeItems: [
            "Custom UI/UX for landing pages and business websites",
            "Responsive front-end development across desktop and mobile breakpoints",
            "Technical SEO foundations including metadata, semantic headings, and internal linking",
            "Content hierarchy and CTA placement designed to improve lead quality",
            "Launch support for key service, campaign, and conversion pages",
            "Ongoing refinement areas based on performance, search, and conversion data",
        ],
        highlights: [
            {
                title: "SEO-friendly websites from day one",
                description: "Semantic sections, clean metadata, and structured page copy help search engines understand the offer before you start chasing fixes later.",
            },
            {
                title: "Messaging that explains value fast",
                description: "We tighten the first screen, page hierarchy, and supporting sections so visitors can understand the service and the next step quickly.",
            },
            {
                title: "Launch-ready execution",
                description: "The build process is kept lean so the site feels polished, responsive, and credible without turning into a long-running design exercise.",
            },
        ],
        faqs: [
            {
                question: "What type of companies hire you for website development?",
                answer: "Most projects come from service businesses, startup teams, and brands that need a stronger marketing site, clearer messaging, and better conversion paths.",
            },
            {
                question: "Can you improve SEO while building the website?",
                answer: "Yes. Metadata, heading structure, crawlable page sections, internal links, and keyword-aware content planning can all be handled during the build.",
            },
            {
                question: "Do you only design or also develop the site?",
                answer: "The work covers both design and development, so the same team can shape the UI, structure the content, and deliver a production-ready website.",
            },
        ],
        relatedLinks: [
            {href: "/digital-marketing-services", label: "Digital marketing services"},
            {href: "/website-development-noida", label: "Website development in Noida"},
            {href: "/website-development-india", label: "Website development in India"},
            {href: "/app-development-noida", label: "App development in Noida"},
        ],
        primaryCtaLabel: "Book a consultation",
        secondaryAction: {
            kind: "audit",
            label: "Get free audit",
        },
    },
    {
        slug: "digital-marketing-services",
        image: "/images/img-digital-marketing.svg",
        eyebrow: "Digital marketing services",
        title: "Digital marketing services for social media, brand growth, and paid ads",
        intro: "Adamant supports brands that need sharper visibility after launch with social media handling, brand boosting, paid ads, and campaign direction. The work connects SEO-friendly website structure with digital marketing channels so traffic has a clearer place to land and convert.",
        metaTitle: "Digital Marketing Services | Social Media & Paid Ads | Adamant",
        metaDescription: "Adamant provides digital marketing services for social media management, brand boosting, paid ads, and SEO-friendly growth campaigns across India, the USA, UK, Japan, and global markets.",
        keywords: [
            "digital marketing services",
            "social media management",
            "brand boosting services",
            "paid ads management",
            "digital marketing USA UK Japan",
            "SEO-friendly digital marketing",
        ],
        scopeTitle: "What this digital marketing service covers",
        scopeDescription: "The work focuses on improving visibility, attracting better-fit traffic, and keeping campaigns connected to the website, landing pages, and conversion goals.",
        scopeItems: [
            "Social media handling for consistent brand presence and content planning",
            "Brand boosting campaigns shaped around positioning, trust, and reach",
            "Paid ads setup and campaign management for lead generation and awareness",
            "Audience targeting, offer messaging, and landing page alignment",
            "SEO-friendly campaign structure that supports search visibility and conversion tracking",
            "Performance review areas for improving traffic quality, engagement, and inquiries",
        ],
        highlights: [
            {
                title: "Social media handled with clearer direction",
                description: "Posts, campaign themes, and content priorities are planned around the brand message instead of publishing disconnected updates.",
            },
            {
                title: "Paid ads connected to conversion paths",
                description: "Ad campaigns work better when targeting, landing pages, CTA placement, and offer messaging are shaped together from the start.",
            },
            {
                title: "Global market support",
                description: "Campaign direction can support audiences across India, the USA, UK, Japan, and other markets without losing the brand's core positioning.",
            },
        ],
        faqs: [
            {
                question: "What digital marketing services do you provide?",
                answer: "The work can cover social media management, content planning, brand visibility campaigns, paid ads setup, campaign management, audience targeting, and landing page alignment.",
            },
            {
                question: "Can digital marketing be combined with website development?",
                answer: "Yes. That is usually the strongest setup because campaign messaging, SEO structure, landing pages, and conversion paths can be planned as one system.",
            },
            {
                question: "Do you support international campaigns?",
                answer: "Yes. Campaign planning can support India, the USA, UK, Japan, and global markets depending on the audience, budget, offer, and business goals.",
            },
        ],
        relatedLinks: [
            {href: "/website-development", label: "Global SEO-friendly website development"},
            {href: "/website-development-india", label: "Website development in India"},
            {href: "/website-development-noida", label: "Website development in Noida"},
        ],
        primaryCtaLabel: "Plan a campaign",
        secondaryAction: {
            kind: "link",
            label: "Explore services",
            href: "/#services",
        },
    },
    {
        slug: "website-development-noida",
        image: "/images/img-web-dev.png",
        eyebrow: "Noida website development",
        title: "Website development company in Noida for fast, conversion-ready launches",
        intro: "Need a website development company in Noida that can tighten your messaging, build SEO-friendly websites, and move quickly with your team? Adamant supports local businesses, startups, and service brands that want a sharper online presence without bloated timelines.",
        metaTitle: "Website Development Company in Noida | Adamant",
        metaDescription: "Looking for a website development company in Noida? Adamant builds SEO-friendly websites with better messaging, stronger technical structure, and conversion-focused UX for local businesses and startups.",
        keywords: [
            "website development company in Noida",
            "SEO-friendly websites",
            "Noida web development company",
        ],
        scopeTitle: "What Noida teams typically need from the build",
        scopeDescription: "Local service pages usually need stronger conversion copy, location-aware landing pages, and a technical setup that supports both paid traffic and organic search growth.",
        scopeItems: [
            "Homepage and service page redesigns for local lead generation",
            "Location landing pages that support Noida and nearby market targeting",
            "SEO-ready content structure for website development, app development, and service pages",
            "Conversion-focused sections for trust, proof, FAQs, and calls to action",
            "Responsive development that holds up across low-end mobile devices and desktop",
            "Clean delivery process for founders and small teams that need momentum",
        ],
        highlights: [
            {
                title: "Built for local search intent",
                description: "The page structure can support city, region, and service combinations so you are not relying on a single generic homepage to rank for everything.",
            },
            {
                title: "Lead generation is baked in",
                description: "CTA placement, FAQ sections, and trust-building content are shaped around booking more qualified inquiries instead of just increasing traffic.",
            },
            {
                title: "Clear handoff and delivery",
                description: "The project stays practical, with focused decisions on scope, copy direction, and page structure so local teams can move quickly.",
            },
        ],
        faqs: [
            {
                question: "Do you work with businesses only in Noida?",
                answer: "No. The page is positioned for Noida search demand, but the work can support teams across NCR and other Indian markets as well.",
            },
            {
                question: "Can you create local landing pages for multiple services?",
                answer: "Yes. Separate pages for website development, app development, and industry-specific services are often the fastest path to better local search coverage.",
            },
            {
                question: "Will the site be easy to update after launch?",
                answer: "That is part of the plan. The structure is meant to stay manageable so you can keep adding service pages, FAQs, and supporting content over time.",
            },
        ],
        relatedLinks: [
            {href: "/website-development", label: "Website development company"},
            {href: "/digital-marketing-services", label: "Digital marketing services"},
            {href: "/website-development-india", label: "Website development in India"},
            {href: "/app-development-noida", label: "App development in Noida"},
        ],
        primaryCtaLabel: "Book a consultation",
        secondaryAction: {
            kind: "audit",
            label: "Get free audit",
        },
    },
    {
        slug: "website-development-india",
        image: "/images/img-web-dev.png",
        eyebrow: "India website development",
        title: "Website development company in India for modern business websites",
        intro: "Adamant works with Indian startups and service businesses that need a website development company in India capable of combining premium design, clear copy, and practical technical SEO. The goal is simple: launch a website that feels credible quickly and supports growth after launch.",
        metaTitle: "Website Development Company in India | Adamant",
        metaDescription: "Adamant is a website development company in India building modern business websites with cleaner UX, stronger content structure, and SEO-friendly technical foundations.",
        keywords: [
            "website development company in India",
            "SEO-friendly websites",
            "business website development India",
        ],
        scopeTitle: "What Indian teams usually need from the website",
        scopeDescription: "The strongest results come from combining better positioning, cleaner design, and technical structure that makes the site easier to understand for both users and search engines.",
        scopeItems: [
            "Business websites that explain the offer more clearly and credibly",
            "Service landing pages for India-wide and city-specific search demand",
            "Semantic content structure that supports organic visibility",
            "Responsive UX that feels polished across mobile, tablet, and desktop",
            "Conversion-ready forms, contact touchpoints, and CTA strategy",
            "A build process that can support quick launches for small to mid-size teams",
        ],
        highlights: [
            {
                title: "Stronger first impressions",
                description: "A cleaner website helps the brand look more credible, explains the offer faster, and gives sales conversations better starting momentum.",
            },
            {
                title: "SEO structure without keyword stuffing",
                description: "Headings, internal links, metadata, FAQs, and service pages are planned around search demand while keeping the experience readable.",
            },
            {
                title: "Designed for sustained growth",
                description: "The site can expand into more city pages, more services, and more content without collapsing into a messy or inconsistent structure.",
            },
        ],
        faqs: [
            {
                question: "Can you support national SEO targeting from one website?",
                answer: "Yes, but it usually works best when the homepage is supported by separate service and location pages instead of forcing every keyword into one page.",
            },
            {
                question: "Is this for startups only?",
                answer: "No. The work also fits agencies, consultants, product companies, and service businesses that need a more serious digital presence.",
            },
            {
                question: "How early should content be planned?",
                answer: "Early. Page structure, headings, keyword targets, and CTA strategy work best when they are shaped during the build, not after launch.",
            },
        ],
        relatedLinks: [
            {href: "/website-development", label: "Website development company"},
            {href: "/digital-marketing-services", label: "Digital marketing services"},
            {href: "/website-development-noida", label: "Website development in Noida"},
            {href: "/app-development-noida", label: "App development in Noida"},
        ],
        primaryCtaLabel: "Book a consultation",
        secondaryAction: {
            kind: "audit",
            label: "Get free audit",
        },
    },
    {
        slug: "app-development-noida",
        image: "/images/img-app-dev.png",
        eyebrow: "Noida app development",
        title: "App development company in Noida for product teams and growing businesses",
        intro: "If you need an app development company in Noida that can take a product from concept to launch, Adamant combines UX thinking, cross-platform product design, and delivery support for teams that want a sharper mobile experience from the start.",
        metaTitle: "App Development Company in Noida | Adamant",
        metaDescription: "Adamant is an app development company in Noida helping businesses launch mobile products with clearer UX, stronger onboarding flows, and cleaner execution across design and development.",
        keywords: [
            "app development company in Noida",
            "mobile app development Noida",
            "cross-platform app development",
        ],
        scopeTitle: "What this app development service includes",
        scopeDescription: "The work focuses on product clarity, smoother user journeys, and cross-platform delivery choices that help a mobile product feel deliberate instead of stitched together.",
        scopeItems: [
            "Product discovery and UX flows for core user journeys",
            "Cross-platform mobile app UI and interaction design",
            "Onboarding, dashboard, and conversion flow planning",
            "Support for app launch pages and product positioning",
            "Design-development collaboration for faster implementation",
            "Post-launch iteration areas based on user behavior and product goals",
        ],
        highlights: [
            {
                title: "UX-first product thinking",
                description: "The app is shaped around user flow clarity so onboarding, navigation, and activation are easier to understand from the first session.",
            },
            {
                title: "Built for launch momentum",
                description: "The scope stays focused on what the product needs to ship, which helps founders and teams avoid overbuilding the first version.",
            },
            {
                title: "Aligned with business goals",
                description: "The mobile experience is mapped to growth, retention, and conversion goals instead of existing as a purely visual exercise.",
            },
        ],
        faqs: [
            {
                question: "Do you handle both app design and development support?",
                answer: "Yes. The process covers product thinking, UX direction, interface design, and the development coordination needed to move toward launch.",
            },
            {
                question: "Is this only for startups?",
                answer: "No. The work also fits established businesses that need a customer app, internal workflow product, or a more polished mobile experience.",
            },
            {
                question: "Can you also help with the website around the app launch?",
                answer: "Yes. Product launches usually perform better when the website, landing pages, and app positioning are shaped together instead of separately.",
            },
        ],
        relatedLinks: [
            {href: "/website-development", label: "Website development company"},
            {href: "/digital-marketing-services", label: "Digital marketing services"},
            {href: "/website-development-noida", label: "Website development in Noida"},
            {href: "/website-development-india", label: "Website development in India"},
        ],
        primaryCtaLabel: "Book a consultation",
        secondaryAction: {
            kind: "link",
            label: "Explore services",
            href: "/#services",
        },
    },
];

export const SERVICE_LANDING_PAGES = Object.fromEntries(
    SERVICE_LANDING_PAGE_LIST.map((page) => [page.slug, page]),
) as Record<string, ServiceLandingPageConfig>;

export function getServiceLandingPage(slug: string) {
    return SERVICE_LANDING_PAGES[slug] ?? null;
}

export function buildServiceLandingMetadata(page: ServiceLandingPageConfig): Metadata {
    const siteUrl = getSiteUrl();
    const url = `${siteUrl}/${page.slug}`;

    return {
        title: {
            absolute: page.metaTitle,
        },
        description: page.metaDescription,
        keywords: page.keywords,
        alternates: {
            canonical: `/${page.slug}`,
        },
        openGraph: buildOpenGraphMetadata({
            title: page.metaTitle,
            description: page.metaDescription,
            pagePath: url,
            imagePath: page.image,
            alt: page.title,
        }),
        twitter: buildTwitterMetadata({
            title: page.metaTitle,
            description: page.metaDescription,
            imagePath: page.image,
        }),
    };
}
