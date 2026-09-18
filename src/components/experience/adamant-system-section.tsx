import Link from "next/link";
import type {SiteCopy} from "@/lib/site-copy";
import type {SiteLocale} from "@/lib/site-locale";
import {MascotHeading} from "@/components/visuals/section-character";
import {SectionDepth} from "@/components/visuals/section-depth";
import SystemVisual from "@/components/visuals/system-visual";
import {getLocalizedUiCopy} from "@/lib/localized-ui-copy";
export default function AdamantSystemSection({services, locale}: {services: SiteCopy["services"]; locale: SiteLocale}) {
    const copy = getLocalizedUiCopy(locale);
    return <section id="adamant-system" className="capability-lab" aria-labelledby="adamant-system-title">
        <SectionDepth variant="services"/>
        <div className="capability-lab-layout">
            <div className="capability-lab-intro">
                <MascotHeading mood="creative" side="left">
                    <p className="section-kicker">{copy.system.kicker}</p>
                    <h2 id="adamant-system-title" dangerouslySetInnerHTML={{__html: copy.system.title}}/>
                    <p>{copy.system.description}</p>
                </MascotHeading>
                <Link className="capability-lab-cta" href="#services">{copy.system.cta} <span aria-hidden="true">↗</span></Link>
            </div>
            <SystemVisual/>
        </div>
        <div className="capability-module-grid">
            {copy.system.modules.map((module, index) => <article key={module.name} className="capability-module">
                <span>{String(index + 1).padStart(2, "0")}<i aria-hidden="true"/></span>
                <h3>{module.name}</h3><p>{module.detail}</p>
            </article>)}
        </div>
        <div className="capability-lab-footer"><span>{copy.system.footer}</span>
            <span>{services.items.filter(item => !item.proofHighlights?.length).map(item => item.title).join(" / ")}</span>
        </div>
    </section>;
}
