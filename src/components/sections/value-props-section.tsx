import {MousePointerClick, Search, ShieldCheck} from "lucide-react";
import {Reveal, StaggerGroup, StaggerItem} from "@/components/ui/reveal";
import {SiteCopy} from "@/lib/site-copy";

export default function ValuePropsSection({copy}: { copy: SiteCopy["valueProps"] }) {
    const icons = [MousePointerClick, Search, ShieldCheck];

    return (
        <section className="section-shell py-8 sm:py-12" aria-labelledby="value-props-heading">
            <Reveal className="glass-panel p-6 sm:p-8">
                <div className="max-w-3xl">
                    <p className="section-kicker">{copy.kicker}</p>
                    <h2 id="value-props-heading" className="section-title">
                        {copy.title}
                    </h2>
                    <p className="section-copy">
                        {copy.description}
                    </p>
                </div>

                <StaggerGroup className="mt-10 grid gap-4 lg:grid-cols-3">
                    {copy.items.map(({title, description}, index) => {
                        const Icon = icons[index];
                        return (
                        <StaggerItem key={title}>
                            <article className="lift-card rounded-[1.75rem] border border-black/8 bg-white/72 p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
                            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-foreground text-background">
                                <Icon className="h-5 w-5"/>
                            </div>
                            <h3 className="mt-5 text-xl font-semibold tracking-tight text-foreground">{title}</h3>
                            <p className="mt-3 text-sm leading-6 text-foreground/68">{description}</p>
                            </article>
                        </StaggerItem>
                        );
                    })}
                </StaggerGroup>
            </Reveal>
        </section>
    );
}
