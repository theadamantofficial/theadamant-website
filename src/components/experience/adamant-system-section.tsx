import Link from "next/link";
import type {SiteCopy} from "@/lib/site-copy";
import {MascotHeading} from "@/components/visuals/section-character";
import {SectionDepth} from "@/components/visuals/section-depth";
import SystemVisual from "@/components/visuals/system-visual";
const MODULES = [
    {name: "BUILD", detail: "Turn the brief into a fast website, mobile app, SaaS product, or digital experience people can understand and use.", number: "01"},
    {name: "GROW", detail: "Help the right people discover your business through SEO, useful content, social media, landing pages, and paid campaigns.", number: "02"},
    {name: "AUTOMATE", detail: "Give repetitive work a smarter way forward with AI workflows, CRM processes, integrations, and practical automation.", number: "03"},
    {name: "CONNECT", detail: "Make your website, app, marketing, analytics, CRM, WhatsApp, and business tools share the information your team needs.", number: "04"},
    {name: "SCALE", detail: "Keep the design system, technical SEO, content structure, performance, and product foundations ready for what comes next.", number: "05"},
];
export default function AdamantSystemSection({services}: {services: SiteCopy["services"]}) {
    return <section id="adamant-system" className="capability-lab" aria-labelledby="adamant-system-title">
        <SectionDepth variant="services"/>
        <div className="capability-lab-layout">
            <div className="capability-lab-intro">
                <MascotHeading mood="creative" side="left">
                    <p className="section-kicker">ADAMANT · SYSTEM ONLINE</p>
                    <h2 id="adamant-system-title">One system.<br/><em>Every capability connected.</em></h2>
                    <p>Good ideas need more than separate tools. Adamant Technologies brings strategy, UI/UX design, website development, mobile app development, SaaS, SEO, automation, analytics, and digital marketing into a connected system that moves with your business.</p>
                </MascotHeading>
                <Link className="capability-lab-cta" href="#services">Find your next move <span aria-hidden="true">↗</span></Link>
            </div>
            <SystemVisual/>
        </div>
        <div className="capability-module-grid">
            {MODULES.map(module => <article key={module.name} className="capability-module">
                <span>{module.number}<i aria-hidden="true"/></span>
                <h3>{module.name}</h3><p>{module.detail}</p>
            </article>)}
        </div>
        <div className="capability-lab-footer"><span>Technology that moves your business forward.</span>
            <span>{services.items.filter(item => !item.proofHighlights?.length).map(item => item.title).join(" / ")}</span>
        </div>
    </section>;
}
