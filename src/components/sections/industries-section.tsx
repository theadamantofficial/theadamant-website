import Link from "next/link";
import {
    BriefcaseBusiness,
    Building2,
    Camera,
    GraduationCap,
    HeartPulse,
    Landmark,
    Megaphone,
    ShoppingBag,
    Truck,
    Utensils,
} from "lucide-react";
import type {LucideIcon} from "lucide-react";
import type {SiteLocale} from "@/lib/site-locale";

const INDUSTRIES: Array<{name: string; description: string; icon: LucideIcon}> = [
    {name: "Technology and SaaS", description: "Websites, products, dashboards, and launch systems for software teams.", icon: BriefcaseBusiness},
    {name: "Professional services", description: "Clear positioning, lead-generation journeys, and useful content for expert businesses.", icon: Landmark},
    {name: "Education and training", description: "Learning platforms, course websites, admissions journeys, and content systems.", icon: GraduationCap},
    {name: "Healthcare and wellness", description: "Accessible digital experiences built around trust, clarity, and real customer questions.", icon: HeartPulse},
    {name: "Real estate and construction", description: "Project pages, property journeys, location pages, and enquiry-focused experiences.", icon: Building2},
    {name: "Ecommerce and retail", description: "Catalogs, Shopify stores, product journeys, campaigns, and conversion improvements.", icon: ShoppingBag},
    {name: "Travel, hospitality, and food", description: "Booking, discovery, ordering, and brand experiences for travel and hospitality businesses.", icon: Utensils},
    {name: "Photography and creative", description: "Portfolio websites, galleries, booking flows, personal brands, and creator platforms.", icon: Camera},
    {name: "Finance and insurance", description: "Clear, secure product experiences for financial services and insurance teams.", icon: Megaphone},
    {name: "Logistics and transportation", description: "Operational tools, tracking experiences, and websites that make complex services easier to understand.", icon: Truck},
];

export default function IndustriesSection({locale}: {locale: SiteLocale}) {
    if (locale !== "en") {
        return null;
    }

    return (
        <section className="section-shell py-16 sm:py-24" aria-labelledby="industries-heading">
            <div className="rounded-[2rem] border border-foreground/10 bg-foreground/[0.03] p-6 sm:p-8 lg:p-12">
                <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                    <div className="max-w-3xl">
                        <p className="section-kicker">Industries we work with</p>
                        <h2 id="industries-heading" className="section-title">Digital solutions for almost every kind of business</h2>
                        <p className="mt-5 text-base leading-8 text-foreground/70">
                            Every industry has different customers, decisions, and expectations. We shape the website, app, SaaS product, automation, SEO, or marketing system around the way your business actually works.
                        </p>
                    </div>
                    <Link href="/industries-served" className="button-secondary shrink-0">Explore all industries</Link>
                </div>

                <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {INDUSTRIES.map(({name, description, icon: Icon}) => (
                        <article key={name} className="rounded-3xl border border-foreground/10 bg-background/60 p-5">
                            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                                <Icon className="h-5 w-5" aria-hidden="true"/>
                            </span>
                            <h3 className="mt-5 font-semibold tracking-tight">{name}</h3>
                            <p className="mt-2 text-sm leading-6 text-foreground/65">{description}</p>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
}
