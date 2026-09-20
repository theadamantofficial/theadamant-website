import type {Metadata} from "next";
import Link from "next/link";
import {getSiteUrl} from "@/lib/site-url";
import {
    BUSINESS_ADDRESS,
    BUSINESS_ADDRESS_SCHEMA,
    BUSINESS_NAME,
    BUSINESS_PHONE,
    BUSINESS_PHONE_HREF,
    LEGAL_BUSINESS_NAME,
} from "@/lib/business";

export const metadata: Metadata = {
    title: {
        absolute: "About Adamant Technologies",
    },
    description: "Learn about JSSS Adamant Technologies Private Limited, a DPIIT-recognized Indian technology company building websites, mobile apps, SaaS products, and digital growth systems.",
    alternates: {
        canonical: "/about",
    },
};

export default function AboutPage() {
    const siteUrl = getSiteUrl();
    const organizationSchema = {
        "@context": "https://schema.org",
        "@type": "Organization",
        "@id": `${siteUrl}/#organization`,
        name: BUSINESS_NAME,
        alternateName: "Adamant",
        legalName: LEGAL_BUSINESS_NAME,
        url: siteUrl,
        description: "DPIIT-recognized Indian technology company building websites, mobile apps, SaaS products, and digital marketing systems.",
        foundingDate: "2026-04-27",
        telephone: BUSINESS_PHONE,
        address: BUSINESS_ADDRESS_SCHEMA,
        logo: `${siteUrl}/vectors/logo-the-adamant.svg`,
        identifier: {
            "@type": "PropertyValue",
            propertyID: "DPIIT Certificate Number",
            value: "DIPP260656",
        },
        sameAs: [
            "https://www.instagram.com/theadamantofficial/",
            "https://www.linkedin.com/company/the-adamant",
            "https://x.com/theadamantofc",
            "https://medium.com/@theadamant",
        ],
    };
    const aboutPageSchema = {
        "@context": "https://schema.org",
        "@type": "AboutPage",
        "@id": `${siteUrl}/about#webpage`,
        url: `${siteUrl}/about`,
        name: "About Adamant Technologies",
        mainEntity: {"@id": `${siteUrl}/#organization`},
    };

    return (
        <main className="min-h-screen bg-background px-6 py-24 text-foreground sm:px-10 lg:px-16">
            <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(organizationSchema)}}/>
            <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(aboutPageSchema)}}/>
            <div className="mx-auto max-w-4xl">
                <p className="section-kicker">About Adamant Technologies</p>
                <h1 className="mt-5 max-w-3xl text-4xl font-semibold tracking-tight sm:text-6xl">
                    Technology built around clearer decisions and stronger digital growth.
                </h1>
                <p className="mt-8 max-w-3xl text-lg leading-8 text-foreground/70">
                    JSSS Adamant Technologies Private Limited is an Indian technology company creating websites, mobile apps, SaaS products, and digital marketing systems for startups, service businesses, and growing brands.
                </p>

                <div className="mt-16 grid gap-6 md:grid-cols-3">
                    {[
                        ["Web and product development", "SEO-friendly websites, product interfaces, and mobile experiences designed for real business goals."],
                        ["Digital growth", "Search, social, content, and paid campaigns connected to a clear conversion path."],
                        ["Recognized and accountable", "A DPIIT-recognized startup with published company credentials and a transparent project process."],
                    ].map(([title, description]) => (
                        <article key={title} className="rounded-3xl border border-foreground/10 bg-foreground/[0.03] p-6">
                            <h2 className="text-xl font-semibold">{title}</h2>
                            <p className="mt-3 text-sm leading-6 text-foreground/65">{description}</p>
                        </article>
                    ))}
                </div>

                <section className="mt-16 max-w-3xl">
                    <h2 className="text-3xl font-semibold tracking-tight">A practical partner from first brief to measurable growth</h2>
                    <p className="mt-5 leading-8 text-foreground/70">
                        Our work starts with the business context behind a request: who needs the product, what they are searching for, what makes the decision difficult, and which action matters after the visit. From there, we shape the information architecture, content, interface, technical implementation, and launch plan together.
                    </p>
                    <p className="mt-5 leading-8 text-foreground/70">
                        That approach helps a website do more than look polished. It gives search engines clearer evidence about the company and its services, gives customers better answers, and gives the team a foundation it can improve with real performance data.
                    </p>
                </section>

                <section className="mt-16 rounded-3xl border border-foreground/10 bg-foreground/[0.03] p-6 sm:p-8" aria-labelledby="company-facts-heading">
                    <h2 id="company-facts-heading" className="text-2xl font-semibold tracking-tight">Company facts and verification</h2>
                    <dl className="mt-6 grid gap-5 text-sm sm:grid-cols-2">
                        <div><dt className="font-semibold text-foreground/55">Trading name</dt><dd className="mt-1">{BUSINESS_NAME}</dd></div>
                        <div><dt className="font-semibold text-foreground/55">Registered company</dt><dd className="mt-1">{LEGAL_BUSINESS_NAME}</dd></div>
                        <div><dt className="font-semibold text-foreground/55">Incorporated</dt><dd className="mt-1">27 April 2026, India</dd></div>
                        <div><dt className="font-semibold text-foreground/55">DPIIT recognition</dt><dd className="mt-1">DIPP260656</dd></div>
                        <div><dt className="font-semibold text-foreground/55">Registered address</dt><dd className="mt-1">{BUSINESS_ADDRESS}</dd></div>
                        <div><dt className="font-semibold text-foreground/55">Phone</dt><dd className="mt-1"><a href={BUSINESS_PHONE_HREF} className="text-primary underline underline-offset-4">{BUSINESS_PHONE}</a></dd></div>
                    </dl>
                    <p className="mt-6 text-sm leading-7 text-foreground/70">
                        <Link href="/certificates/startup-india-dpiit-recognition.pdf" target="_blank" rel="noopener noreferrer" className="font-semibold text-primary underline underline-offset-4">View the DPIIT recognition certificate</Link> or verify recognition through the <a href="https://www.startupindia.gov.in/content/sih/en/startupgov/validate-startup-recognition.html" target="_blank" rel="noopener noreferrer" className="font-semibold text-primary underline underline-offset-4">official Startup India portal</a>.
                    </p>
                </section>

                <div className="mt-16 flex flex-wrap gap-4">
                    <Link href="/#contact" className="button-primary">Start a project</Link>
                    <Link href="/website-development" className="button-secondary">Explore website development</Link>
                </div>
            </div>
        </main>
    );
}
