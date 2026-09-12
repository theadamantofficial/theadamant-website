import {Reveal} from "@/components/ui/reveal";
import type {SiteCopy} from "@/lib/site-copy";
import Link from "next/link";
import {getLocalizedPagePath, type SiteLocale} from "@/lib/site-locale";
import {SectionDepth} from "@/components/visuals/section-depth";
import {MascotHeading} from "@/components/visuals/section-character";
import ServiceTiltCard from "@/components/visuals/service-tilt-card";

const DETAILS = [
    {timeline: "Typical scope: 2–4 weeks", proof: ["Clickable prototype", "Responsive design system"], cta: "Plan the experience", path: "contact"},
    {timeline: "Typical scope: 4–8 weeks", proof: ["SEO and performance handoff", "Editable content setup"], cta: "Scope a website", path: "website-development"},
    {timeline: "Typical scope: 8–14 weeks", proof: ["iOS + Android delivery plan", "Testable release milestones"], cta: "Discuss your app", path: "app-development-noida"},
    {timeline: "First plan: about 10 days", proof: ["Creative and channel plan", "Measurement and reporting setup"], cta: "Build a growth plan", path: "digital-marketing-services"},
];
export default function ServicesSection({copy, locale}: {copy: SiteCopy["services"]; locale: SiteLocale}) {
    return <section id="services" className="section-shell service-showcase py-16 sm:py-20" aria-labelledby="services-heading">
        <SectionDepth variant="services"/>
        <MascotHeading mood="idea" side="left">
            <Reveal className="max-w-3xl">
                <p className="section-kicker">{copy.kicker}</p>
                <h2 id="services-heading" className="section-title">{locale === "en" ? <>Different challenges.<br/>Purpose-built answers.</> : copy.title}</h2>
                <p className="section-copy">{locale === "en" ? "Choose the part you need today. Each engagement has its own deliverables, a clear scope and a next step." : copy.description}</p>
            </Reveal>
        </MascotHeading>
        <div className="service-prism-grid mt-12">
            {copy.items.map((service, index) => {
                const detail = DETAILS[index % DETAILS.length];
                const href = detail.path === "contact" ? "#contact" : getLocalizedPagePath(locale, detail.path);
                return <ServiceTiltCard key={service.title}>
                    <div className={"service-art service-art-" + index} aria-hidden="true">
                        <div className="service-art-platform"/><div className="service-art-object"><i/><i/><i/><i/><b/><span/></div>
                        <span className="service-art-caption">{["DESIGN / CLARITY", "ENGINEER / LAUNCH", "MOBILE / EVERYWHERE", "GROWTH / MOMENTUM"][index % 4]}</span>
                    </div>
                    <div className="service-prism-content">
                        <p className="service-prism-number">0{index + 1}</p>
                        <h3>{service.title}</h3><p>{service.description}</p>
                        {locale === "en" && <><div className="service-prism-meta"><span>Scope-based quote</span><span>{detail.timeline}</span></div>
                            <ul className="service-deliverables" aria-label="Included deliverables">{detail.proof.map(point => <li key={point}>✓ {point}</li>)}</ul>
                            {(index === 0 || index === 1 || index === 3) && <Link className="service-proof-link" href="https://aetherseo.com/en" target="_blank" rel="noreferrer">See our product: AetherSEO ↗</Link>}
                        </>}
                        <Link href={href} className="service-prism-cta">{locale === "en" ? detail.cta : service.ctaLabel ?? copy.kicker} →</Link>
                    </div>
                </ServiceTiltCard>;
            })}
        </div>
    </section>;
}
