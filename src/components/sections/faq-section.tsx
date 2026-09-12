import {Reveal} from "@/components/ui/reveal";
import {AnimatedFaqList} from "@/components/ui/animated-faq-list";
import {SiteCopy} from "@/lib/site-copy";
import {SectionDepth} from "@/components/visuals/section-depth";
import {MascotHeading} from "@/components/visuals/section-character";

export default function FaqSection({copy}: { copy: SiteCopy["faq"] }) {
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

            <AnimatedFaqList items={copy.items} className="mt-10" idPrefix="homepage-faq"/>
        </section>
    );
}
