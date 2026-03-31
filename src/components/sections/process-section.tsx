import {Compass, PencilRuler, Code2, Rocket} from "lucide-react";

const steps = [
    {
        number: "01",
        title: "Clarify the positioning",
        description: "Define the audience, offer, and message so the page speaks clearly instead of sounding generic.",
        icon: Compass,
    },
    {
        number: "02",
        title: "Shape the experience",
        description: "Turn that positioning into a design system, content hierarchy, and interaction pattern that feels deliberate.",
        icon: PencilRuler,
    },
    {
        number: "03",
        title: "Build for performance",
        description: "Develop the site with responsive layouts, cleaner structure, and practical SEO improvements already in place.",
        icon: Code2,
    },
    {
        number: "04",
        title: "Launch with momentum",
        description: "Refine the final touchpoints so the page is ready to attract, persuade, and convert the right visitors.",
        icon: Rocket,
    },
];

export default function ProcessSection() {
    return (
        <section id="process" className="section-shell py-24" aria-labelledby="process-heading">
            <div className="max-w-3xl">
                <p className="section-kicker">Process</p>
                <h2 id="process-heading" className="section-title">
                    A simple path from rough presence to a sharper digital brand.
                </h2>
                <p className="section-copy">
                    Early-stage websites improve fastest when strategy, design, development, and SEO are treated as one system instead of separate tasks.
                </p>
            </div>

            <div className="mt-10 grid gap-4 lg:grid-cols-4">
                {steps.map(({number, title, description, icon: Icon}) => (
                    <article key={number} className="glass-panel p-6">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold tracking-[0.24em] text-foreground/45">{number}</span>
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-foreground text-background">
                                <Icon className="h-5 w-5"/>
                            </div>
                        </div>

                        <h3 className="mt-8 text-xl font-semibold tracking-tight text-foreground">{title}</h3>
                        <p className="mt-3 text-sm leading-6 text-foreground/68">{description}</p>
                    </article>
                ))}
            </div>
        </section>
    );
}
