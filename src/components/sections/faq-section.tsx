import {Minus, Plus} from "lucide-react";
import {Reveal, StaggerGroup, StaggerItem} from "@/components/ui/reveal";
import {SiteCopy} from "@/lib/site-copy";

export default function FaqSection({copy}: { copy: SiteCopy["faq"] }) {
    return (
        <section id="faq" className="section-shell py-24" aria-labelledby="faq-heading">
            <Reveal className="max-w-3xl">
                <p className="section-kicker">{copy.kicker}</p>
                <h2 id="faq-heading" className="section-title">
                    {copy.title}
                </h2>
                <p className="section-copy">
                    {copy.description}
                </p>
            </Reveal>

            <StaggerGroup className="mt-10 space-y-4">
                {copy.items.map((item) => (
                    <StaggerItem key={item.question}>
                        <details className="glass-panel group lift-card overflow-hidden p-6">
                            <summary className="flex list-none items-center justify-between gap-4 text-left text-lg font-semibold tracking-tight text-foreground">
                                {item.question}
                                <span className="flex h-9 w-9 items-center justify-center rounded-full border border-black/10 bg-white/70 transition duration-300 group-open:rotate-180 dark:border-white/10 dark:bg-white/5">
                                    <Plus className="h-4 w-4 group-open:hidden"/>
                                    <Minus className="hidden h-4 w-4 group-open:block"/>
                                </span>
                            </summary>
                            <p className="mt-4 max-w-3xl text-sm leading-7 text-foreground/68">
                                {item.answer}
                            </p>
                        </details>
                    </StaggerItem>
                ))}
            </StaggerGroup>
        </section>
    );
}
