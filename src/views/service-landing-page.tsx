import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import {ArrowRight, CheckCircle2, Globe, MapPin, Smartphone} from "lucide-react";
import {Navbar} from "@/components/layouts/navbar";
import Footer from "@/components/layouts/footer";
import ContactUsSection from "@/components/sections/contact-us-section";
import {OpenAuditButton} from "@/components/ui/open-audit-button";
import {DEFAULT_SITE_LOCALE} from "@/lib/site-locale";
import {getSiteCopy} from "@/lib/site-copy";
import {getSiteUrl} from "@/lib/site-url";
import {ServiceLandingPageConfig} from "@/lib/service-landing-pages";

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
        name: `The Adamant - ${page.metaTitle}`,
        url: pageUrl,
        description: page.metaDescription,
        image: `${siteUrl}${page.image}`,
        areaServed: buildAreaServed(page.slug),
        serviceType: page.title,
        provider: {
            "@type": "Organization",
            name: "The Adamant",
            url: siteUrl,
        },
    };

    return (
        <main className="relative min-h-screen overflow-hidden">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{__html: JSON.stringify(pageSchema)}}
            />

            <Navbar copy={copy.navbar} locale={DEFAULT_SITE_LOCALE}/>
            {page.secondaryAction.kind === "audit" && <WebsiteAuditFab locale={DEFAULT_SITE_LOCALE}/>}
            <SeoChatFab/>

            <section className="relative px-6 pb-16 pt-28 sm:px-8 lg:px-12">
                <div className="section-shell grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
                    <div className="max-w-3xl">
                        <p className="section-kicker">{page.eyebrow}</p>
                        <h1 className="section-title mt-6 max-w-4xl">{page.title}</h1>
                        <p className="section-copy mt-6 max-w-3xl">
                            {page.intro}
                        </p>

                        <div className="mt-8 flex flex-wrap gap-3">
                            <Link href="#contact" className="button-primary">
                                {page.primaryCtaLabel}
                                <ArrowRight className="h-4 w-4"/>
                            </Link>
                            {page.secondaryAction.kind === "audit" ? (
                                <OpenAuditButton>
                                    {page.secondaryAction.label}
                                </OpenAuditButton>
                            ) : (
                                <Link href={page.secondaryAction.href ?? "/#services"} className="button-secondary">
                                    {page.secondaryAction.label}
                                </Link>
                            )}
                        </div>

                        <div className="mt-8 flex flex-wrap gap-3">
                            <span className="feature-chip">
                                <Globe className="h-4 w-4"/>
                                SEO-ready structure
                            </span>
                            <span className="feature-chip">
                                <CheckCircle2 className="h-4 w-4"/>
                                Conversion-focused UX
                            </span>
                            <span className="feature-chip">
                                {page.slug.includes("app") ? <Smartphone className="h-4 w-4"/> : <MapPin className="h-4 w-4"/>}
                                {page.slug.includes("noida") ? "Noida-focused positioning" : "Launch-ready delivery"}
                            </span>
                        </div>
                    </div>

                    <div className="glass-panel overflow-hidden p-4 sm:p-5">
                        <div className="relative overflow-hidden rounded-[1.8rem] border border-black/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(241,233,219,0.86))] p-5 dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(20,23,26,0.95),rgba(15,18,20,0.92))]">
                            <div className="mb-4 flex items-center justify-between text-sm text-foreground/62">
                                <span>Service focus</span>
                                <span>{page.eyebrow}</span>
                            </div>
                            <div className="relative h-[22rem] overflow-hidden rounded-[1.5rem] border border-black/6 bg-white/70 dark:border-white/10 dark:bg-white/5">
                                <Image
                                    src={page.image}
                                    alt={page.title}
                                    fill
                                    className="object-cover"
                                    sizes="(max-width: 1024px) 100vw, 45vw"
                                    priority
                                />
                            </div>
                            <div className="mt-5 rounded-[1.5rem] border border-black/8 bg-white/78 p-5 dark:border-white/10 dark:bg-white/5">
                                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-foreground/52">
                                    Why this page exists
                                </p>
                                <p className="mt-3 text-sm leading-7 text-foreground/68">
                                    Separate service pages help search engines understand the difference between general
                                    brand messaging and specific offers such as website development, location-based
                                    landing pages, and mobile app services.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="section-shell pb-12">
                <div className="glass-panel p-7 sm:p-8">
                    <div className="max-w-3xl">
                        <p className="section-kicker">Why teams choose this service</p>
                        <h2 className="section-title">What makes this landing page useful for SEO and conversion</h2>
                        <p className="section-copy">
                            The content is built to explain the offer clearly, target the right intent, and make the next action obvious instead of burying everything inside a generic homepage.
                        </p>
                    </div>

                    <div className="mt-8 grid gap-4 lg:grid-cols-3">
                        {page.highlights.map((item) => (
                            <article key={item.title} className="lift-card rounded-[1.6rem] border border-black/8 bg-white/72 p-6 dark:border-white/10 dark:bg-white/5">
                                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-foreground text-background">
                                    <CheckCircle2 className="h-5 w-5"/>
                                </div>
                                <h3 className="mt-5 text-xl font-semibold tracking-tight text-foreground">{item.title}</h3>
                                <p className="mt-3 text-sm leading-6 text-foreground/68">{item.description}</p>
                            </article>
                        ))}
                    </div>
                </div>
            </section>

            <section className="section-shell py-12">
                <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
                    <div className="glass-panel p-7 sm:p-8">
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

                    <div className="glass-panel p-7 sm:p-8">
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
                </div>
            </section>

            <section className="section-shell pb-12 pt-12">
                <div className="max-w-3xl">
                    <p className="section-kicker">FAQ</p>
                    <h2 className="section-title">Questions that usually come up before the first call</h2>
                    <p className="section-copy">
                        FAQ content helps both search engines and buyers understand how the service works, what it includes, and whether the page matches the project they want to discuss.
                    </p>
                </div>

                <div className="mt-8 space-y-4">
                    {page.faqs.map((faq) => (
                        <details key={faq.question} className="glass-panel overflow-hidden p-6">
                            <summary className="cursor-pointer list-none text-lg font-semibold tracking-tight text-foreground">
                                {faq.question}
                            </summary>
                            <p className="mt-4 max-w-3xl text-sm leading-7 text-foreground/68">
                                {faq.answer}
                            </p>
                        </details>
                    ))}
                </div>
            </section>

            <ContactUsSection copy={copy.contact}/>
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

    return {
        "@type": "Country",
        name: "India",
    };
}
