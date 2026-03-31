import {Compass, PencilRuler, Code2, Rocket} from "lucide-react";
import {Reveal, StaggerGroup, StaggerItem} from "@/components/ui/reveal";
import {SiteCopy} from "@/lib/site-copy";

export default function ProcessSection({copy}: { copy: SiteCopy["process"] }) {
    const icons = [Compass, PencilRuler, Code2, Rocket];

    return (
        <section id="process" className="section-shell py-24" aria-labelledby="process-heading">
            <Reveal className="max-w-3xl">
                <p className="section-kicker">{copy.kicker}</p>
                <h2 id="process-heading" className="section-title">
                    {copy.title}
                </h2>
                <p className="section-copy">
                    {copy.description}
                </p>
            </Reveal>

            <StaggerGroup className="mt-10 grid gap-4 lg:auto-rows-fr lg:grid-cols-4">
                {copy.steps.map(({number, title, description}, index) => {
                    const Icon = icons[index];
                    return (
                    <StaggerItem key={number} className="h-full">
                        <article className="glass-panel lift-card flex h-full flex-col p-6">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold tracking-[0.24em] text-foreground/45">{number}</span>
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-foreground text-background">
                                <Icon className="h-5 w-5"/>
                            </div>
                        </div>

                        <h3 className="mt-8 text-xl font-semibold tracking-tight text-foreground">{title}</h3>
                        <p className="mt-3 flex-1 text-sm leading-6 text-foreground/68">{description}</p>
                        </article>
                    </StaggerItem>
                    );
                })}
            </StaggerGroup>
        </section>
    );
}
