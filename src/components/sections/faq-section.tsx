import {Reveal} from "@/components/ui/reveal";
import {AnimatedFaqList} from "@/components/ui/animated-faq-list";
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

            <AnimatedFaqList items={copy.items} className="mt-10" idPrefix="homepage-faq"/>
        </section>
    );
}
