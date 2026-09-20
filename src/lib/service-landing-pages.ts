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
    external?: boolean;
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
        intro: "Adamant designs and builds business websites for teams in India, the USA, the UK, Japan, South Africa, and other markets. We focus on clear messaging, quick load times, and a straightforward user experience instead of forcing every project into the same template.",
        metaTitle: "Global Website Development Company | Adamant",
        metaDescription: "Adamant designs and develops fast, search-friendly business websites for companies in India, the USA, the UK, Japan, South Africa, and other global markets.",
        keywords: [
            "global website development company",
            "website design and development company",
            "custom website development services",
            "website development agency for small businesses",
            "website development for startups",
            "business website design and development",
            "SEO-friendly website development",
            "responsive website development services",
            "website redesign and development",
            "ecommerce website development services",
            "WordPress website development services",
            "web application development company",
            "hire a website developer",
            "website development cost",
            "website development pricing",
            "website development company near me",
            "best website development company",
            "top website development company",
            "website development company in the USA",
            "website development company in California",
            "website development company in the UK",
            "website development company in Japan",
            "website development company in Tokyo",
            "website development company in South Africa",
            "website development company in Australia",
            "website development company in Canada",
            "website development company in the UAE",
            "website development company in Singapore",
            "website development company in New Zealand",
            "website development company in Ireland",
            "website development company in Germany",
            "website development company in France",
            "website development company in Italy",
            "website development company in Spain",
            "website development company in the Netherlands",
            "website development company in Belgium",
            "website development company in Sweden",
            "website development company in Norway",
            "website development company in Denmark",
            "website development company in Switzerland",
            "website development company in Austria",
            "website development company in Poland",
            "website development company in Portugal",
            "website development company in Brazil",
            "website development company in Mexico",
            "website development company in Argentina",
            "website development company in Chile",
            "website development company in Colombia",
            "website development company in Nigeria",
            "website development company in Kenya",
            "website development company in Egypt",
            "website development company in Israel",
            "website development company in Saudi Arabia",
            "website development company in Qatar",
            "website development company in Malaysia",
            "website development company in Indonesia",
            "website development company in Thailand",
            "website development company in Vietnam",
            "website development company in the Philippines",
            "website development company in South Korea",
            "website development company in Hong Kong",
            "SaaS development company",
            "SaaS application development",
            "web application development company",
            "mobile app development company",
            "Flutter app development",
            "Kotlin app development",
            "Android app development",
            "iOS app development",
            "Node.js development company",
            "React.js development company",
            "Next.js development company",
            "Laravel development company",
            "Shopify development company",
            "MongoDB application development",
            "AWS cloud development",
            "Google Cloud development",
            "Docker deployment services",
            "DevOps development services",
            "SEO services for websites",
            "digital marketing services",
            "technical SEO services",
            "AI application development",
            "OpenAI integration services",
            "ChatGPT integration services",
            "Claude AI integration",
            "n8n automation services",
            "generative AI development company",
            "AI automation services",
            "Figma UI UX design",
            "Adobe XD UI UX design",
            "UI UX design and development",
            "Git and GitHub development workflow",
            "Bitbucket development workflow",
            "PHP web development",
            "Python web development",
            "Java application development",
            ".NET application development",
            "Vue.js development company",
            "Angular development company",
            "TypeScript development company",
            "PostgreSQL application development",
            "Firebase application development",
            "Supabase application development",
            "Kubernetes deployment services",
            "Azure cloud development",
            "Google Cloud Platform development",
            "Vercel deployment services",
            "API integration services",
            "backend development company",
            "frontend development company",
            "full stack development company",
        ],
        scopeTitle: "What this website development service covers",
        scopeDescription: "Every project starts with the same practical questions: who is the site for, what should visitors do next, and what needs to work well after launch?",
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
                title: "A solid foundation from day one",
                description: "Clear page structure, useful copy, and sensible technical choices make the site easier to use and easier to improve over time.",
            },
            {
                title: "Messaging that explains value fast",
                description: "We tighten the first screen, page hierarchy, and supporting sections so visitors can understand the service and the next step quickly.",
            },
            {
                title: "A smoother route to launch",
                description: "We keep the work focused so the site feels polished and reliable without turning a straightforward project into a long design exercise.",
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
            {
                question: "How do you build websites for teams in different countries?",
                answer: "We agree on the audience, market, scope, milestones, and review process before design begins. For international websites, we plan language or country pages around real customer needs, with clear navigation and search-ready technical structure.",
            },
        ],
        relatedLinks: [
            {href: "/technical-seo-services", label: "Technical SEO services for international websites"},
            {href: "/digital-marketing-services", label: "Digital marketing services"},
            {href: "/ecommerce-website-development", label: "Ecommerce website development"},
            {href: "/wordpress-development-company", label: "WordPress website development"},
            {href: "/saas-development-company", label: "SaaS product development"},
            {href: "/app-development-india", label: "Mobile app development in India"},
            {href: "/website-development-india", label: "Website development in India"},
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
                description: "Campaign direction can support audiences across India, the USA, UK, Japan, South Africa, and other markets without losing the brand's core positioning.",
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
            {href: "/technical-seo-services", label: "Technical SEO and content strategy"},
            {href: "/ecommerce-website-development", label: "Ecommerce website development"},
            {href: "/website-development-india", label: "Website development in India"},
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

const ADDITIONAL_SERVICE_LANDING_PAGES: ServiceLandingPageConfig[] = [
    {
        slug: "ai-automation-services",
        image: "/images/img-app-dev.png",
        eyebrow: "AI automation services",
        title: "AI automation company helping teams turn repetitive work into reliable systems",
        intro: "Adamant designs practical AI automation workflows for growing businesses, from lead qualification and support assistants to internal operations, content workflows, and connected business tools.",
        metaTitle: "AI Automation Company in India | Adamant",
        metaDescription: "Adamant builds practical AI automation systems for growing businesses, connecting assistants, workflows, APIs, and business data without losing human oversight.",
        keywords: ["AI automation company India", "AI automation services", "business process automation", "AI workflow automation", "AI integration services"],
        scopeTitle: "What AI automation services cover",
        scopeDescription: "The right automation starts with a valuable workflow and clear controls, not with adding AI where it does not improve the customer or team experience.",
        scopeItems: ["Workflow and opportunity discovery", "AI assistant and prompt design", "CRM, forms, email, and API integrations", "Human review and escalation paths", "Data handling and operational safeguards", "Measurement and ongoing workflow refinement"],
        highlights: [
            {title: "Useful automation first", description: "We prioritize repetitive, measurable workflows where automation can save time or improve response quality."},
            {title: "Connected to your tools", description: "AI workflows can connect with existing forms, CRMs, communication tools, APIs, and internal systems."},
            {title: "Human control stays visible", description: "Review steps, fallback paths, and clear ownership help teams use automation confidently."},
        ],
        faqs: [
            {question: "What can AI automation improve?", answer: "Common opportunities include lead routing, support triage, document workflows, internal knowledge search, reporting, and repetitive content operations."},
            {question: "Can AI connect to our existing CRM?", answer: "Yes. The workflow can be designed around the CRM, forms, APIs, and communication tools your team already uses."},
            {question: "Do you replace human review?", answer: "No. Sensitive or high-impact workflows should include appropriate human review, escalation, and clear failure handling."},
        ],
        relatedLinks: [
            {href: "/saas-development-company", label: "SaaS development company"},
            {href: "/website-development-india", label: "Website development in India"},
            {href: "/digital-marketing-services", label: "Digital marketing services"},
            {href: "/crm-development-services", label: "CRM development services"},
        ],
        primaryCtaLabel: "Plan an AI workflow",
        secondaryAction: {kind: "audit", label: "Get free audit"},
    },
    {
        slug: "crm-development-services",
        image: "/images/img-app-dev.png",
        eyebrow: "CRM development services",
        title: "CRM development company building clearer systems for leads, customers, and teams",
        intro: "Adamant designs and develops CRM systems that help teams capture enquiries, manage pipelines, coordinate follow-ups, and understand customer activity without forcing the business into an unsuitable workflow.",
        metaTitle: "CRM Development Company in India | Adamant",
        metaDescription: "Adamant builds custom CRM systems for lead management, sales pipelines, customer operations, integrations, reporting, and practical team workflows.",
        keywords: ["CRM development company India", "custom CRM development", "CRM software development", "sales pipeline software", "customer relationship management system"],
        scopeTitle: "What CRM development covers",
        scopeDescription: "A useful CRM mirrors how a team actually works while making the next action, ownership, and customer context easier to see.",
        scopeItems: ["Lead and enquiry capture", "Pipeline and lifecycle design", "Role-based dashboards and permissions", "Email, WhatsApp, payment, and API integrations", "Reporting and activity history", "Migration, training, and post-launch improvements"],
        highlights: [
            {title: "Workflows that match the team", description: "The system is shaped around real sales, support, and customer operations instead of generic fields nobody uses."},
            {title: "A clearer pipeline", description: "Ownership, status, follow-ups, and next actions remain visible across the customer journey."},
            {title: "Ready for integrations", description: "The CRM can connect to forms, messaging, payments, websites, and other systems that keep work moving."},
        ],
        faqs: [
            {question: "Can you build a CRM around our existing process?", answer: "Yes. We map the current process first, then design the data model, roles, pipeline stages, and screens around the team."},
            {question: "Can a CRM connect to our website and WhatsApp?", answer: "Yes. Lead capture, conversation history, notifications, and follow-up workflows can be connected where the relevant APIs allow it."},
            {question: "Do you migrate existing customer data?", answer: "Migration can be planned with field mapping, validation, permissions, and staged verification before the new workflow becomes the source of truth."},
        ],
        relatedLinks: [
            {href: "/ai-automation-services", label: "AI automation services"},
            {href: "/saas-development-company", label: "SaaS development company"},
            {href: "/website-development-india", label: "Website development in India"},
            {href: "/digital-marketing-services", label: "Digital marketing services"},
        ],
        primaryCtaLabel: "Plan a CRM system",
        secondaryAction: {kind: "audit", label: "Get free audit"},
    },
    {
        slug: "app-development-india",
        image: "/images/img-app-dev.png",
        eyebrow: "India app development",
        title: "Leading Mobile App Development Company in India",
        intro: "Adamant is a mobile app development company in India helping startups and businesses plan, design, and develop focused iOS and Android products with clearer user flows, practical release milestones, and a product experience shaped around real business goals.",
        metaTitle: "Leading Mobile App Development Company in India | Adamant",
        metaDescription: "Adamant is a leading mobile app development company in India building focused iOS and Android products with clear UX, practical release planning, and scalable foundations.",
        keywords: ["leading mobile app development company in India", "mobile app development company India", "app development company India", "iOS Android app development"],
        scopeTitle: "What the mobile app engagement covers",
        scopeDescription: "The work connects product strategy, interface design, development, testing, and launch planning so the first release stays focused.",
        scopeItems: ["Product discovery and user-flow mapping", "iOS and Android interface design", "Cross-platform or native development planning", "API and backend integration", "Testing, analytics, and release preparation", "Post-launch refinement priorities"],
        highlights: [
            {title: "A clearer first release", description: "The product scope stays focused on the user journey and business outcome instead of accumulating features without a launch plan."},
            {title: "Designed around adoption", description: "Onboarding, navigation, feedback, and key actions are shaped so users can understand the product quickly."},
            {title: "Built to improve", description: "The release creates a foundation for measured iteration rather than treating launch as the end of the product work."},
        ],
        faqs: [
            {question: "Do you build both iOS and Android apps?", answer: "The right delivery approach depends on the product, timeline, and team. We can plan native or cross-platform delivery around those constraints."},
            {question: "Can you help define the MVP?", answer: "Yes. Product goals, user flows, and launch priorities are clarified before development so the MVP remains useful and achievable."},
            {question: "Do you support app updates after launch?", answer: "Yes. Post-launch improvements can be prioritized using user feedback, analytics, and the next business milestones."},
        ],
        relatedLinks: [
            {href: "/app-development-noida", label: "App development in Noida"},
            {href: "/saas-development-company", label: "SaaS development company"},
            {href: "/crm-development-services", label: "Custom CRM development"},
            {href: "/ai-automation-services", label: "AI automation services"},
            {href: "/website-development-india", label: "Website development in India"},
        ],
        primaryCtaLabel: "Discuss an app",
        secondaryAction: {kind: "audit", label: "Get free audit"},
    },
    {
        slug: "web-design-company-india",
        image: "/images/img-web-dev.png",
        eyebrow: "India web design",
        title: "Web design company in India for clearer, higher-converting business websites",
        intro: "Adamant designs business websites around positioning, content hierarchy, trust, and action. The result is a polished experience that explains the offer before asking visitors to enquire.",
        metaTitle: "Web Design Company in India | Adamant",
        metaDescription: "Adamant is a web design company in India creating clear, responsive, conversion-focused websites for startups, service businesses, and growing brands.",
        keywords: ["web design company in India", "website design company India", "conversion-focused web design"],
        scopeTitle: "What the web design service covers",
        scopeDescription: "Good web design connects visual direction to the information a visitor needs before taking action.",
        scopeItems: ["Positioning and page hierarchy", "Responsive UI design", "Landing page and service page systems", "Conversion-focused CTA placement", "Accessible content and interaction patterns", "Developer-ready design handoff"],
        highlights: [
            {title: "Design that explains", description: "The page hierarchy makes the offer, proof, and next step easier to understand."},
            {title: "Responsive by default", description: "The experience is designed for the devices customers actually use, not only a desktop presentation."},
            {title: "Ready for SEO and development", description: "Visual decisions work alongside semantic content structure and practical implementation constraints."},
        ],
        faqs: [
            {question: "Do you provide design and development together?", answer: "Yes. Design and development can be handled together so the final website remains faithful to the intended experience."},
            {question: "Can you redesign an existing website?", answer: "Yes. A redesign can focus on messaging, information architecture, visual credibility, speed, and conversion paths."},
            {question: "Will the design work for search marketing?", answer: "Yes. Page structure, content hierarchy, internal links, and conversion paths can be planned for organic and paid traffic."},
        ],
        relatedLinks: [
            {href: "/website-development-india", label: "Website development in India"},
            {href: "/website-development-noida", label: "Website development in Noida"},
            {href: "/digital-marketing-services", label: "Digital marketing services"},
        ],
        primaryCtaLabel: "Plan a website",
        secondaryAction: {kind: "audit", label: "Get free audit"},
    },
    {
        slug: "saas-development-company",
        image: "/images/img-app-dev.png",
        eyebrow: "SaaS product development",
        title: "SaaS development company for focused, scalable digital products",
        intro: "Adamant helps founders and teams turn a product idea into a clearer SaaS experience with practical flows, focused scope, and a foundation that can evolve after the first release.",
        metaTitle: "SaaS Development Company | Product Strategy & Engineering | Adamant",
        metaDescription: "Adamant helps startups plan and build SaaS products with clear user flows, focused MVP scope, scalable foundations, and launch-ready product experiences.",
        keywords: ["SaaS development company", "SaaS product development", "SaaS MVP development"],
        scopeTitle: "What SaaS product development covers",
        scopeDescription: "The engagement connects product thinking, UX, engineering, and release planning around the first valuable customer outcome.",
        scopeItems: ["Product and MVP scope definition", "User roles and workflow mapping", "Dashboard and product UI design", "Frontend, backend, and API planning", "Authentication, billing, and integrations", "Analytics and post-launch iteration"],
        highlights: [
            {title: "Focused MVP decisions", description: "The first release is shaped around the smallest useful product, not an oversized feature list."},
            {title: "Workflows users can follow", description: "Complex product capabilities are turned into understandable steps, states, and feedback."},
            {title: "A foundation for scale", description: "Architecture and delivery decisions leave room for the product to grow responsibly."},
        ],
        faqs: [
            {question: "Can you help validate a SaaS idea?", answer: "Yes. We can clarify the target user, core workflow, MVP scope, and first release assumptions before implementation."},
            {question: "Do you build internal business tools?", answer: "Yes. SaaS-style workflows can also support internal operations, customer portals, and specialized business systems."},
            {question: "Can the product integrate with existing tools?", answer: "Integration planning can cover the APIs, data flows, authentication, and operational constraints involved."},
        ],
        relatedLinks: [
            {href: "/app-development-india", label: "Mobile app development in India"},
            {href: "/crm-development-services", label: "Custom CRM development"},
            {href: "/ai-automation-services", label: "AI workflow automation"},
            {href: "/website-development", label: "Global website development"},
            {href: "/about", label: "About Adamant Technologies"},
        ],
        primaryCtaLabel: "Discuss your product",
        secondaryAction: {kind: "link", label: "Explore services", href: "/#services"},
    },
    {
        slug: "ecommerce-website-development",
        image: "/images/img-web-dev.png",
        eyebrow: "Ecommerce website development",
        title: "Ecommerce website development for clearer shopping experiences",
        intro: "Adamant creates ecommerce experiences that make products easier to discover, compare, trust, and purchase across mobile and desktop.",
        metaTitle: "Ecommerce Website Development Company | Adamant",
        metaDescription: "Adamant builds responsive ecommerce websites with clearer product discovery, conversion-focused UX, technical SEO foundations, and practical growth paths.",
        keywords: ["ecommerce website development", "ecommerce web development company", "SEO ecommerce website"],
        scopeTitle: "What ecommerce development covers",
        scopeDescription: "The work focuses on the journey from discovery to checkout, with content and technical decisions that support both customers and search engines.",
        scopeItems: ["Storefront UX and product discovery", "Category and product page structure", "Mobile-first shopping flows", "Checkout and payment integration planning", "Technical SEO for products and categories", "Analytics and conversion improvement"],
        highlights: [
            {title: "Less friction to purchase", description: "Navigation, product information, trust signals, and CTAs are organized around the buying decision."},
            {title: "Search-ready catalog structure", description: "Categories and product content are planned to be useful for users and understandable to search engines."},
            {title: "Built for iteration", description: "Analytics and content systems make it easier to improve the store after launch."},
        ],
        faqs: [
            {question: "Can you improve an existing ecommerce store?", answer: "Yes. We can focus on navigation, product pages, performance, mobile UX, SEO structure, or conversion bottlenecks."},
            {question: "Do you support payment integrations?", answer: "Payment and commerce integrations can be planned around the platform, market, and operational requirements."},
            {question: "Is ecommerce SEO included?", answer: "Technical foundations and content structure can be included, with ongoing SEO treated as a measurable growth activity."},
        ],
        relatedLinks: [
            {href: "/website-development-india", label: "Website development in India"},
            {href: "/digital-marketing-services", label: "Digital marketing services"},
            {href: "/website-development", label: "Custom website development"},
            {href: "/wordpress-development-company", label: "WordPress website development"},
        ],
        primaryCtaLabel: "Plan an ecommerce build",
        secondaryAction: {kind: "audit", label: "Get free audit"},
    },
    {
        slug: "wordpress-development-company",
        image: "/images/img-web-dev.png",
        eyebrow: "WordPress development",
        title: "WordPress development company for manageable, search-ready websites",
        intro: "Adamant helps businesses create or improve WordPress websites with clearer content systems, responsive layouts, practical SEO foundations, and a publishing workflow the team can manage.",
        metaTitle: "WordPress Development Company | SEO-Friendly Websites | Adamant",
        metaDescription: "Adamant provides WordPress development for responsive, manageable business websites with clearer content structure, technical SEO, and conversion-focused UX.",
        keywords: ["WordPress development company", "WordPress website development", "SEO WordPress development"],
        scopeTitle: "What WordPress development covers",
        scopeDescription: "The goal is a site that is easy to publish, easy to understand, and not overloaded with unnecessary plugins or templates.",
        scopeItems: ["WordPress site architecture", "Custom responsive page design", "Service, blog, and landing page templates", "Technical SEO and performance foundations", "Forms, analytics, and integrations", "Content editor guidance and launch support"],
        highlights: [
            {title: "A site your team can operate", description: "Publishing and updating core content should not require a developer for every small change."},
            {title: "Less template bloat", description: "The build focuses on the pages and components the business actually needs."},
            {title: "Prepared for organic growth", description: "Content structure, metadata, internal linking, and performance are considered from the beginning."},
        ],
        faqs: [
            {question: "Can you redesign an existing WordPress website?", answer: "Yes. We can improve the structure, design, content hierarchy, performance, and conversion paths without losing useful content."},
            {question: "Will the team be able to edit the site?", answer: "The content model and editor experience can be planned so routine updates remain manageable."},
            {question: "Do you handle WordPress SEO?", answer: "Technical foundations can be included, alongside a content and internal-linking plan for ongoing organic growth."},
        ],
        relatedLinks: [
            {href: "/website-development-india", label: "Website development in India"},
            {href: "/web-design-company-india", label: "Web design company in India"},
            {href: "/technical-seo-services", label: "Technical SEO services"},
            {href: "/ecommerce-website-development", label: "Ecommerce website development"},
            {href: "/website-development", label: "Global website development"},
            {href: "/blog", label: "Read the Adamant blog"},
        ],
        primaryCtaLabel: "Improve your website",
        secondaryAction: {kind: "audit", label: "Get free audit"},
    },
    {
        slug: "technical-seo-services",
        image: "/images/img-digital-marketing.svg",
        eyebrow: "Technical SEO services",
        title: "Technical SEO services for international websites and growing businesses",
        intro: "Adamant helps teams improve the search foundations of business websites, ecommerce stores, and digital products. We connect crawl and indexing checks with search-intent mapping, useful service content, internal links, and measurement so the right pages can be found in the markets they serve.",
        metaTitle: "Technical SEO Services for International Websites | Adamant",
        metaDescription: "Improve crawlability, indexing, site structure, internal links, and search-intent content with Adamant's technical SEO services for international websites.",
        keywords: ["technical SEO services", "international website SEO", "SEO audit and implementation", "multilingual website SEO", "internal linking strategy", "service page SEO"],
        scopeTitle: "What technical SEO work covers",
        scopeDescription: "The first step is to find which technical and content issues keep important pages from being understood, discovered, or useful to visitors.",
        scopeItems: [
            "Crawl, indexability, sitemap, canonical, and redirect review",
            "Site architecture and descriptive internal-link planning",
            "Search-intent mapping for service, location, and product pages",
            "Metadata, headings, structured data, and image context",
            "Language and regional URL planning where multiple markets are served",
            "Search Console, analytics, and enquiry measurement",
        ],
        highlights: [
            {title: "Prioritize pages with a purpose", description: "We connect technical fixes to the services, audiences, and markets that matter to the business."},
            {title: "Make related content easier to find", description: "Clear page groups and contextual links help visitors move from broad questions to the right service or product."},
            {title: "Measure qualified discovery", description: "Search impressions and clicks are reviewed alongside landing-page engagement and enquiries, not rankings alone."},
        ],
        faqs: [
            {question: "What does a technical SEO audit include?", answer: "The scope can cover crawling, indexability, redirects, canonical URLs, sitemaps, page structure, internal links, metadata, structured data, mobile usability, and the pages most relevant to your search goals."},
            {question: "Can you improve SEO for more than one country or language?", answer: "Yes. We can plan distinct regional or language URLs, review localization and hreflang signals, and connect each version to useful content for its intended audience. The right setup depends on the markets and content available."},
            {question: "How do technical SEO and content strategy work together?", answer: "Technical checks help search engines reach and interpret a page. Search-intent research and clear content then help the page answer a useful question and guide a visitor to the next step."},
            {question: "How is progress measured?", answer: "We look at index coverage, relevant search queries, impressions, clicks, landing-page behavior, and qualified enquiries. SEO growth depends on competition and continued improvements, so no fixed ranking can be promised."},
        ],
        relatedLinks: [
            {href: "/website-development", label: "Global website development"},
            {href: "/digital-marketing-services", label: "Digital marketing services"},
            {href: "/ecommerce-website-development", label: "Ecommerce website development"},
            {href: "/wordpress-development-company", label: "WordPress website development"},
            {href: "/seo-company-noida", label: "SEO services in Noida"},
        ],
        primaryCtaLabel: "Plan an SEO review",
        secondaryAction: {kind: "audit", label: "Get free audit"},
    },
    {
        slug: "seo-company-noida",
        image: "/images/img-digital-marketing.svg",
        eyebrow: "Noida SEO services",
        title: "SEO company in Noida for technical foundations, content, and qualified visibility",
        intro: "Adamant helps Noida businesses build search visibility through better technical foundations, service-page strategy, content planning, and conversion paths that turn relevant visits into enquiries.",
        metaTitle: "SEO Company in Noida | Technical SEO & Content Strategy | Adamant",
        metaDescription: "Adamant provides SEO services in Noida covering technical SEO, service-page strategy, content planning, internal linking, and conversion-focused organic growth.",
        keywords: ["SEO company in Noida", "SEO services Noida", "technical SEO company Noida"],
        scopeTitle: "What Noida SEO work covers",
        scopeDescription: "SEO is treated as a connected system of crawlability, intent-matched pages, useful content, authority, and measurable conversion actions.",
        scopeItems: ["Technical crawl and indexing review", "Keyword and search-intent mapping", "Service and location page planning", "On-page metadata and heading improvements", "Internal linking and content briefs", "Search Console and conversion measurement"],
        highlights: [
            {title: "Target the right intent", description: "The plan separates broad research queries from high-intent service and location searches."},
            {title: "Improve the pages that matter", description: "Technical and content effort is prioritized around pages that can generate qualified enquiries."},
            {title: "Measure beyond rankings", description: "Search visibility is connected to clicks, enquiries, and the quality of incoming demand."},
        ],
        faqs: [
            {question: "How long does SEO take to work?", answer: "It depends on competition, authority, technical condition, and publishing consistency. Early gains often come from improving existing pages, while broader growth takes sustained work."},
            {question: "Do you work with businesses outside Noida?", answer: "Yes. The service is positioned for Noida search demand and can support Delhi NCR, India-wide, and international markets."},
            {question: "Can SEO and website development be handled together?", answer: "Yes. Building the page structure and technical foundations together usually avoids expensive cleanup later."},
        ],
        relatedLinks: [
            {href: "/website-development-noida", label: "Website development in Noida"},
            {href: "/technical-seo-services", label: "Technical SEO for international websites"},
            {href: "/digital-marketing-services", label: "Digital marketing services"},
            {href: "/website-development-india", label: "Website development in India"},
        ],
        primaryCtaLabel: "Plan an SEO engagement",
        secondaryAction: {kind: "audit", label: "Get free audit"},
    },
    {
        slug: "website-development-ghaziabad",
        image: "/images/img-web-dev.png",
        eyebrow: "Ghaziabad website development",
        title: "Website development company in Ghaziabad for growing local businesses",
        intro: "Adamant Technologies builds fast, SEO-ready business websites, web applications, and landing pages for startups and businesses in Ghaziabad and Delhi NCR. We combine clear messaging, responsive UX, and practical technical foundations so your website can support real enquiries.",
        metaTitle: "Website Development Company in Ghaziabad | Adamant Technologies",
        metaDescription: "Adamant Technologies builds fast, SEO-ready business websites, web applications, and landing pages for startups and businesses in Ghaziabad and Delhi NCR.",
        keywords: ["website development company in Ghaziabad", "web development company Ghaziabad", "website designer Ghaziabad", "Delhi NCR website development"],
        scopeTitle: "Website development for Ghaziabad businesses",
        scopeDescription: "A local business website needs to make the service, location, credibility, and next step obvious on mobile as well as desktop.",
        scopeItems: ["Business websites for local service companies and startups", "Location-aware service pages for Ghaziabad and Delhi NCR", "Responsive landing pages for campaigns and lead generation", "Technical SEO, metadata, headings, and internal links", "Forms, WhatsApp, email, and measurement touchpoints", "Launch support and a practical content editing workflow"],
        highlights: [
            {title: "Local context without keyword stuffing", description: "The page explains who the service is for and where it is available while keeping the copy useful for real buyers."},
            {title: "A clearer path to enquiry", description: "Service details, proof, FAQs, and contact actions are organized around the questions local customers ask before choosing a provider."},
            {title: "Built for the wider NCR market", description: "A Ghaziabad presence can connect naturally to relevant Delhi NCR and India-wide service pages without pretending every market is identical."},
        ],
        faqs: [
            {question: "Do you provide website development in Ghaziabad?", answer: "Yes. Adamant supports businesses and startups in Ghaziabad and the wider Delhi NCR region with website strategy, design, development, and launch support."},
            {question: "Can you build a website for a local service business?", answer: "Yes. The site can focus on service clarity, local trust, mobile conversion, enquiry handling, and pages that match the services customers are searching for."},
            {question: "Can you also support SEO after launch?", answer: "Yes. Technical improvements, service-page planning, content, internal linking, and Search Console measurement can continue after the website launches."},
        ],
        relatedLinks: [
            {href: "/website-development-noida", label: "Website development in Noida"},
            {href: "/website-development-delhi-ncr", label: "Website development in Delhi NCR"},
            {href: "/seo-company-noida", label: "SEO services in Noida"},
            {href: "/#contact", label: "Start a website project"},
        ],
        primaryCtaLabel: "Discuss your Ghaziabad website",
        secondaryAction: {kind: "audit", label: "Get free audit"},
    },
    {
        slug: "website-development-delhi-ncr",
        image: "/images/img-web-dev.png",
        eyebrow: "Delhi NCR website development",
        title: "Website development company for Delhi NCR businesses and startups",
        intro: "Adamant Technologies helps Delhi NCR businesses launch clearer websites, campaign landing pages, and web applications. The work is shaped around the audience, service area, commercial goal, and proof a customer needs before getting in touch.",
        metaTitle: "Website Development Company in Delhi NCR | Adamant Technologies",
        metaDescription: "Adamant Technologies builds responsive, SEO-ready websites, landing pages, and web applications for businesses and startups across Delhi NCR.",
        keywords: [
            "website development company in Delhi NCR",
            "web design and development company in Delhi",
            "website designer in Delhi NCR",
            "website development agency in Delhi",
            "business website development in Delhi",
            "website development for startups in Delhi",
            "website redesign company in Delhi",
            "SEO-friendly website development in Delhi",
            "ecommerce website development in Delhi",
            "WordPress website development in Delhi",
            "website development cost in Delhi",
            "website development company near Delhi",
            "best website development company in Delhi",
            "top website development companies in Delhi",
            "top 10 website development companies in Delhi",
            "top 10 website development companies in Delhi 2024",
            "top 10 website development companies in Delhi 2025",
            "top 10 website development companies in Delhi 2026",
            "top 10 website development companies in Delhi 2027",
        ],
        scopeTitle: "What Delhi NCR teams need from a website",
        scopeDescription: "Delhi NCR is a busy market with very different kinds of businesses. A useful website should explain what you do, who you help, where you work, and how someone can contact you.",
        scopeItems: ["Business websites and website redesigns", "Service and location pages for NCR audiences", "Landing pages for paid and organic campaigns", "Responsive, accessible layouts", "Technical SEO and analytics setup", "Helpful comparison and buying-guide content", "Ongoing content and conversion improvement"],
        highlights: [
            {title: "Positioning that works across NCR", description: "The website can communicate broad capability while keeping service and location pages specific enough to be useful."},
            {title: "Better pages for every stage", description: "Visitors can move from discovery to service details, proof, FAQs, and a clear enquiry action without getting lost."},
            {title: "Helpful information before people enquire", description: "Clear service details, examples, FAQs, and honest comparisons give potential customers the information they need before starting a conversation."},
            {title: "A foundation for national growth", description: "The same information architecture can expand beyond Delhi NCR when the business has genuine coverage and evidence to support it."},
        ],
        faqs: [
            {question: "Which Delhi NCR areas do you support?", answer: "Adamant can support teams across Delhi NCR, including businesses in Ghaziabad, Noida, and nearby markets, subject to the project scope and working arrangement."},
            {question: "Should every NCR area have its own page?", answer: "Only when the business genuinely serves that area and can provide useful, differentiated information. Thin duplicate city pages are not a sustainable SEO strategy."},
            {question: "Can you redesign an existing Delhi NCR business website?", answer: "Yes. A redesign can improve messaging, mobile UX, page structure, performance, technical SEO, and conversion paths while preserving valuable content."},
            {question: "How should I compare the top website development companies in Delhi?", answer: "Compare relevant experience, technical quality, accessibility, performance, communication, post-launch support, and evidence of results rather than relying on a list position alone."},
        ],
        relatedLinks: [
            {href: "/website-development-ghaziabad", label: "Website development in Ghaziabad"},
            {href: "/website-development-noida", label: "Website development in Noida"},
            {href: "/website-development-india", label: "Website development in India"},
            {href: "/digital-marketing-services", label: "Digital marketing services"},
            {href: "https://invoidea.com/blog/website-development-companies-in-delhi", label: "10 best website development companies in Delhi (2024)", external: true},
        ],
        primaryCtaLabel: "Plan your Delhi NCR website",
        secondaryAction: {kind: "audit", label: "Get free audit"},
    },
];

export const SERVICE_LANDING_PAGES = Object.fromEntries(
    [...SERVICE_LANDING_PAGE_LIST, ...ADDITIONAL_SERVICE_LANDING_PAGES].map((page) => [page.slug, page]),
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
