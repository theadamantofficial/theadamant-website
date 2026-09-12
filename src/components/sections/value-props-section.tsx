import {MousePointerClick, Search, ShieldCheck} from "lucide-react";
import {Reveal, StaggerGroup, StaggerItem} from "@/components/ui/reveal";
import {SiteCopy} from "@/lib/site-copy";
import {SectionDepth} from "@/components/visuals/section-depth";
import {MascotHeading} from "@/components/visuals/section-character";
export default function ValuePropsSection({copy}: {copy: SiteCopy["valueProps"]}) {
    const icons = [MousePointerClick, Search, ShieldCheck];
    return <section className="section-shell py-8 sm:py-12" aria-labelledby="value-props-heading">
        <SectionDepth variant="values"/>
        <Reveal className="glass-panel p-6 sm:p-8">
            <MascotHeading mood="looking-back" side="right">
                <p className="section-kicker">{copy.kicker}</p>
                <h2 id="value-props-heading" className="section-title">{copy.title}</h2>
                <p className="section-copy">{copy.description}</p>
            </MascotHeading>
            <StaggerGroup className="mt-10 grid gap-4 lg:grid-cols-3">
                {copy.items.map(({title, description}, index) => {
                    const Icon = icons[index] ?? ShieldCheck;
                    return <StaggerItem key={title}>
                        <article className="lift-card value-card relative h-full overflow-hidden rounded-[1.75rem] border border-black/8 bg-white/72 p-6 dark:border-white/10 dark:bg-white/5">
                            <div className="value-icon flex h-11 w-11 items-center justify-center rounded-full bg-foreground text-background"><Icon className="h-5 w-5"/></div>
                            <h3 className="mt-5 text-xl font-semibold tracking-tight text-foreground">{title}</h3>
                            <p className="mt-3 text-sm leading-6 text-foreground/68">{description}</p>
                        </article>
                    </StaggerItem>;
                })}
            </StaggerGroup>
        </Reveal>
    </section>;
}
