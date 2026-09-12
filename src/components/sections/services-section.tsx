"use client";

import {Reveal} from "@/components/ui/reveal";
import {SiteCopy} from "@/lib/site-copy";
import Link from "next/link";
import Image from "next/image";
import type {CSSProperties} from "react";
import {SiteLocale} from "@/lib/site-locale";
import {SectionDepth} from "@/components/visuals/section-depth";

const SERVICE_DETAILS: Record<string, {price: string; timeline: string; proof: string; cta: string; href: string}> = {
    "UI/UX Design": {price: "From ₹45k", timeline: "2–4 weeks", proof: "Prototype and journey map included", cta: "Plan the experience", href: "/#contact"},
    "Website Development": {price: "From ₹75k", timeline: "4–8 weeks", proof: "Performance and SEO handoff", cta: "Scope a website", href: "/website-development"},
    "Mobile App Development": {price: "From ₹1.5L", timeline: "8–14 weeks", proof: "Shared iOS + Android delivery", cta: "Discuss an app", href: "/app-development-noida"},
    "Digital Marketing": {price: "From ₹30k/mo", timeline: "Plan in 10 days", proof: "Weekly creative and performance review", cta: "Build a growth plan", href: "/digital-marketing-services"},
};

export default function ServicesSection({
    copy,
    locale,
}: {
    copy: SiteCopy["services"];
    locale: SiteLocale;
}) {
    void locale;
    return (
        <section id="services" className="section-shell service-showcase py-16 sm:py-20" aria-labelledby="services-heading">
            <SectionDepth variant="services"/>
            <Reveal className="max-w-3xl">
                <p className="section-kicker">{copy.kicker}</p>
                <h2 id="services-heading" className="section-title">
                    {copy.title}
                </h2>

                <p className="section-copy">
                    {copy.description}
                </p>

            </Reveal>
            <div className="service-prism-grid mt-12">
                {copy.items.map((service, index) => {
                    const detail = SERVICE_DETAILS[service.title];
                    return <article key={service.title} className="service-prism-card" style={{"--card-index": index} as CSSProperties}>
                        <div className="service-prism-image"><Image src={service.image} alt={service.imageAlt ?? service.title} fill sizes="(max-width: 700px) 90vw, (max-width: 1100px) 46vw, 24vw" className="object-contain p-7"/></div>
                        <div className="service-prism-content">
                            <p className="service-prism-number">0{index + 1}</p>
                            <h3>{service.title}</h3><p>{service.description}</p>
                            {detail && <><div className="service-prism-meta"><span>{detail.price}</span><span>{detail.timeline}</span></div><small>✓ {detail.proof}</small><Link href={detail.href} className="service-prism-cta">{detail.cta} →</Link></>}
                        </div>
                    </article>;
                })}
            </div>
        </section>
    );
}
