import Link from "next/link";
import type {SiteCopy} from "@/lib/site-copy";
import {MascotHeading} from "@/components/visuals/section-character";
import {SectionDepth} from "@/components/visuals/section-depth";
import SystemVisual from "@/components/visuals/system-visual";
const MODULES = [
    {name: "BUILD", detail: "Turn the brief into a product people can use.", number: "01"},
    {name: "GROW", detail: "Help the right people discover what you do.", number: "02"},
    {name: "AUTOMATE", detail: "Give repetitive work a smarter way forward.", number: "03"},
    {name: "CONNECT", detail: "Make your tools share the same information.", number: "04"},
    {name: "SCALE", detail: "Keep the foundations ready for what comes next.", number: "05"},
];
export default function AdamantSystemSection({services}: {services: SiteCopy["services"]}) {
    return <section id="adamant-system" className="capability-lab" aria-labelledby="adamant-system-title">
        <SectionDepth variant="services"/>
        <div className="capability-lab-layout">
            <div className="capability-lab-intro">
                <MascotHeading mood="creative" side="left">
                    <p className="section-kicker">ADAMANT · SYSTEM ONLINE</p>
                    <h2 id="adamant-system-title">One system.<br/><em>Every capability connected.</em></h2>
                    <p>Good ideas need more than separate tools. We bring design, engineering and growth into a connected system that moves with your business.</p>
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
