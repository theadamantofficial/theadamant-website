import {MousePointerClick, Search, ShieldCheck} from "lucide-react";

const valueProps = [
    {
        title: "Hook attention quickly",
        description: "Use stronger hierarchy, clearer copy, and more intentional visuals so visitors immediately understand the offer and feel the brand has substance.",
        icon: MousePointerClick,
    },
    {
        title: "Build SEO into the foundation",
        description: "Support search visibility with semantic sections, better metadata, FAQ content, internal anchors, and keyword-rich supporting copy.",
        icon: Search,
    },
    {
        title: "Earn trust before the first call",
        description: "Shape the page to feel more credible and premium, so users are more willing to keep scrolling, click through, and submit an inquiry.",
        icon: ShieldCheck,
    },
];

export default function ValuePropsSection() {
    return (
        <section className="section-shell py-8 sm:py-12" aria-labelledby="value-props-heading">
            <div className="glass-panel p-6 sm:p-8">
                <div className="max-w-3xl">
                    <p className="section-kicker">Why this works</p>
                    <h2 id="value-props-heading" className="section-title">
                        A better homepage should do more than look good.
                    </h2>
                    <p className="section-copy">
                        It should guide attention, explain value quickly, and create enough confidence that a new visitor wants to stay on the page. These improvements focus on exactly that.
                    </p>
                </div>

                <div className="mt-10 grid gap-4 lg:grid-cols-3">
                    {valueProps.map(({title, description, icon: Icon}) => (
                        <article key={title} className="rounded-[1.75rem] border border-black/8 bg-white/72 p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
                            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-foreground text-background">
                                <Icon className="h-5 w-5"/>
                            </div>
                            <h3 className="mt-5 text-xl font-semibold tracking-tight text-foreground">{title}</h3>
                            <p className="mt-3 text-sm leading-6 text-foreground/68">{description}</p>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
}
