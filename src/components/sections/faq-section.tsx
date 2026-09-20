import {Reveal} from "@/components/ui/reveal";
import {AnimatedFaqList} from "@/components/ui/animated-faq-list";
import {SiteCopy} from "@/lib/site-copy";
import {SectionDepth} from "@/components/visuals/section-depth";
import {MascotHeading} from "@/components/visuals/section-character";

export default function FaqSection({copy}: { copy: SiteCopy["faq"] }) {
    const featuredAnswers = copy.items.slice(0, 3);
    const remainingAnswers = copy.items.slice(3);

    return (
        <section id="faq" className="section-shell py-24" aria-labelledby="faq-heading">
            <SectionDepth variant="faq"/>
            <MascotHeading mood="thinking" side="left">
            <Reveal className="max-w-3xl">
                <p className="section-kicker">{copy.kicker}</p>
                <h2 id="faq-heading" className="section-title">
                    {copy.title}
                </h2>
                <p className="section-copy">
                    {copy.description}
                </p>
            </Reveal>
            </MascotHeading>

            <div className="mt-10 grid gap-4 lg:grid-cols-3">
                {featuredAnswers.map((item) => (
                    <article key={item.question} className="glass-panel p-6">
                        <h3 className="text-lg font-semibold tracking-tight text-foreground">{item.question}</h3>
                        <p className="mt-4 text-sm leading-7 text-foreground/70">{item.answer}</p>
                    </article>
                ))}
            </div>
            <AnimatedFaqList items={remainingAnswers} className="mt-4" idPrefix="homepage-faq"/>
        </section>
    );
}
