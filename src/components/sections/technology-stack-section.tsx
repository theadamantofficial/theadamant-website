import {
    Bot,
    Cloud,
    Cpu,
    Database,
    GitBranch,
    Globe2,
    Palette,
    Search,
    Server,
    ShoppingBag,
    Sparkles,
    Store,
    Workflow,
    Zap,
    Code2,
    Container,
    Figma,
    Megaphone,
    Smartphone,
} from "lucide-react";
import Image from "next/image";
import type {LucideIcon} from "lucide-react";
import type {SiteLocale} from "@/lib/site-locale";

type StackGroup = {
    label: string;
    icon: LucideIcon;
    items: string[];
};

const STACK_GROUPS: StackGroup[] = [
    {label: "Web And Apps", icon: Code2, items: ["React.js", "Next.js", "Node.js", "Laravel", "PHP", "Python", "Java", ".NET", "Vue.js", "Angular", "TypeScript"]},
    {label: "Mobile Products", icon: Smartphone, items: ["Flutter", "Kotlin", "Android", "iOS", "React Native"]},
    {label: "SaaS And Data", icon: Database, items: ["SaaS products", "Web applications", "MongoDB", "PostgreSQL", "Firebase", "Supabase", "API integrations"]},
    {label: "Cloud And Delivery", icon: Cloud, items: ["AWS", "Azure", "Google Cloud", "Docker", "Kubernetes", "Vercel", "DevOps"]},
    {label: "Commerce And Growth", icon: Megaphone, items: ["Shopify", "Technical SEO", "Digital marketing", "Paid campaigns", "Analytics"]},
    {label: "Design And Collaboration", icon: Palette, items: ["Figma", "Adobe XD", "UI/UX design", "Git", "GitHub", "Bitbucket"]},
    {label: "AI And Automation", icon: Sparkles, items: ["OpenAI", "ChatGPT", "Claude", "n8n", "Generative AI", "AI automation"]},
];

const STACK_LOGOS: Record<string, string> = {
    "React.js": "/vectors/logo-react.svg",
    "Next.js": "/vectors/logo-nextjs.svg",
    "Flutter": "/vectors/logo-flutter.svg",
    "Android": "/vectors/logo-android.svg",
    "iOS": "/vectors/logo-apple.svg",
    "Figma": "/vectors/logo-figma.svg",
};

function StackIcon({label}: {label: string}) {
    const logoPath = STACK_LOGOS[label];
    if (logoPath) {
        return <Image src={logoPath} alt={`${label} logo`} width={14} height={14} className="h-3.5 w-3.5 object-contain"/>;
    }

    const Icon = label.includes("SEO") || label === "Analytics"
        ? Search
        : label.includes("Cloud") || ["AWS", "Azure", "Vercel"].includes(label)
            ? Cloud
            : ["MongoDB", "PostgreSQL", "Firebase", "Supabase"].includes(label)
                ? Database
                : ["Git", "GitHub", "Bitbucket"].includes(label)
                    ? GitBranch
                    : ["Shopify", "Ecommerce website development"].includes(label)
                        ? ShoppingBag
                        : ["OpenAI", "ChatGPT", "Claude", "Generative AI"].includes(label)
                            ? Bot
                            : label === "n8n" || label === "AI automation"
                                ? Workflow
                                : ["Docker", "Kubernetes", "DevOps"].includes(label)
                                    ? Server
                                    : ["Figma", "Adobe XD", "UI/UX design"].includes(label)
                                        ? Palette
                                        : ["SaaS products", "Web applications", "API integrations"].includes(label)
                                            ? Globe2
                                            : ["Flutter", "Kotlin", "Android", "iOS", "React Native"].includes(label)
                                                ? Smartphone
                                                : ["Shopify", "Technical SEO", "Digital marketing", "Paid campaigns"].includes(label)
                                                    ? Store
                                                    : label.includes("AI")
                                                        ? Sparkles
                                                        : label.includes("development") || label.includes("Java") || label.includes("PHP") || label.includes("Python")
                                                            ? Code2
                                                            : label.includes("TypeScript") || label.includes("React") || label.includes("Vue") || label.includes("Angular")
                                                                ? Cpu
                                                                : Zap;

    return <Icon className="h-3.5 w-3.5 text-primary/80" aria-hidden="true"/>;
}

export default function TechnologyStackSection({locale}: {locale: SiteLocale}) {
    if (locale !== "en") {
        return null;
    }

    return (
        <section className="section-shell py-16 sm:py-24" aria-labelledby="technology-stack-heading">
            <div className="rounded-[2rem] border border-foreground/10 bg-foreground/[0.03] p-6 sm:p-8 lg:p-12">
                <div className="max-w-3xl">
                    <p className="section-kicker">Tools We Work With</p>
                    <h2 id="technology-stack-heading" className="section-title">The Right Stack For The Job</h2>
                    <p className="mt-5 text-base leading-8 text-foreground/70">
                        We choose tools around the product, the team, and the stage of the project. Here are some of the technologies we use across websites, apps, SaaS products, design systems, marketing, and AI-enabled workflows.
                    </p>
                </div>

                <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {STACK_GROUPS.map(({label, icon: Icon, items}) => (
                        <article key={label} className="rounded-3xl border border-foreground/10 bg-background/60 p-5">
                            <div className="flex items-center gap-3">
                                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                                    <Icon className="h-5 w-5" aria-hidden="true"/>
                                </span>
                                <h3 className="font-semibold tracking-tight">{label}</h3>
                            </div>
                            <ul className="mt-5 flex flex-wrap gap-2" aria-label={`${label} technologies`}>
                                {items.map((item) => (
                                    <li key={item} className="inline-flex items-center gap-1.5 rounded-full border border-foreground/10 bg-background px-3 py-1.5 text-xs font-medium text-foreground/72">
                                        <StackIcon label={item}/>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </article>
                    ))}
                </div>

                <div className="mt-5 flex flex-wrap gap-3 text-xs text-foreground/58">
                    <span className="inline-flex items-center gap-1.5"><Figma className="h-3.5 w-3.5"/> Design-led delivery</span>
                    <span className="inline-flex items-center gap-1.5"><GitBranch className="h-3.5 w-3.5"/> Version-controlled builds</span>
                    <span className="inline-flex items-center gap-1.5"><Container className="h-3.5 w-3.5"/> Deployable infrastructure</span>
                    <span className="inline-flex items-center gap-1.5"><Search className="h-3.5 w-3.5"/> Search-ready foundations</span>
                </div>
            </div>
        </section>
    );
}
