import {Minus, Plus} from "lucide-react";

export const faqItems = [
    {
        question: "What kind of projects does The Adamant handle?",
        answer: "The Adamant focuses on UI/UX design, website development, and mobile app experiences for brands that want a sharper digital presence and a stronger first impression.",
    },
    {
        question: "Can the website be made more SEO-friendly from the beginning?",
        answer: "Yes. Strong metadata, crawlable section structure, useful supporting copy, internal anchor links, and FAQ content can all be built into the site early instead of being added later as cleanup.",
    },
    {
        question: "Why does homepage structure matter so much?",
        answer: "The homepage usually decides whether a new visitor keeps scrolling or leaves. Clear hierarchy, focused messaging, and visible next steps help users understand value quickly and move toward contact.",
    },
    {
        question: "Does design affect conversions as much as development?",
        answer: "It does when the design improves clarity. Better layout, pacing, contrast, and call-to-action placement reduce hesitation and make the site feel more credible, which supports conversion.",
    },
];

export default function FaqSection() {
    return (
        <section id="faq" className="section-shell py-24" aria-labelledby="faq-heading">
            <div className="max-w-3xl">
                <p className="section-kicker">FAQ</p>
                <h2 id="faq-heading" className="section-title">
                    Questions people often have before they reach out.
                </h2>
                <p className="section-copy">
                    These answers also strengthen the page semantically by giving search engines clearer context around your services and how the site is meant to help.
                </p>
            </div>

            <div className="mt-10 space-y-4">
                {faqItems.map((item) => (
                    <details key={item.question} className="glass-panel group overflow-hidden p-6">
                        <summary className="flex list-none items-center justify-between gap-4 text-left text-lg font-semibold tracking-tight text-foreground">
                            {item.question}
                            <span className="flex h-9 w-9 items-center justify-center rounded-full border border-black/10 bg-white/70 dark:border-white/10 dark:bg-white/5">
                                <Plus className="h-4 w-4 group-open:hidden"/>
                                <Minus className="hidden h-4 w-4 group-open:block"/>
                            </span>
                        </summary>
                        <p className="mt-4 max-w-3xl text-sm leading-7 text-foreground/68">
                            {item.answer}
                        </p>
                    </details>
                ))}
            </div>
        </section>
    );
}
