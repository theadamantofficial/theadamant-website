"use client";

import {MousePointerClick, Search, ShieldCheck} from "lucide-react";
import {motion} from "motion/react";
import {Reveal, StaggerGroup, StaggerItem} from "@/components/ui/reveal";
import {SiteCopy} from "@/lib/site-copy";
import {useMotionCapability} from "@/hooks/use-motion-capability";

const cardVariants = {
    rest: {y: 0, scale: 1},
    hover: {y: -8, scale: 1.012},
};

const iconVariants = {
    rest: {rotate: 0, scale: 1},
    hover: {rotate: -7, scale: 1.08},
};

const glowVariants = {
    rest: {opacity: 0.22, scale: 0.72},
    hover: {opacity: 0.55, scale: 1.2},
};

export default function ValuePropsSection({copy}: { copy: SiteCopy["valueProps"] }) {
    const {capability, isReady} = useMotionCapability();
    const hasRichMotion = isReady && capability === "full";
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
                            <motion.article
                                className="lift-card group relative h-full overflow-hidden rounded-[1.75rem] border border-black/8 bg-white/72 p-6 shadow-sm dark:border-white/10 dark:bg-white/5"
                                initial="rest"
                                animate="rest"
                                whileHover={hasRichMotion ? "hover" : undefined}
                                whileTap={hasRichMotion ? {scale: 0.992} : undefined}
                                variants={cardVariants}
                                transition={{duration: 0.32, ease: [0.22, 1, 0.36, 1]}}
                            >
                                <motion.div
                                    aria-hidden="true"
                                    className="pointer-events-none absolute -right-14 -top-16 h-36 w-36 rounded-full bg-[radial-gradient(circle,rgba(214,106,69,0.2),transparent_68%)] dark:bg-[radial-gradient(circle,rgba(88,183,179,0.16),transparent_68%)]"
                                    variants={glowVariants}
                                />
                                <motion.div
                                    className="relative flex h-11 w-11 items-center justify-center rounded-full bg-foreground text-background"
                                    variants={iconVariants}
                                    transition={{duration: 0.32, ease: [0.22, 1, 0.36, 1]}}
                                >
                                    <Icon className="h-5 w-5"/>
                                </motion.div>
                                <h3 className="relative mt-5 text-xl font-semibold tracking-tight text-foreground">{title}</h3>
                                <p className="relative mt-3 text-sm leading-6 text-foreground/68">{description}</p>
                                <motion.div
                                    aria-hidden="true"
                                    className="absolute inset-x-6 bottom-0 h-px origin-left bg-gradient-to-r from-primary via-accent to-transparent"
                                    initial={{scaleX: 0}}
                                    variants={{rest: {scaleX: 0}, hover: {scaleX: 1}}}
                                    transition={{duration: 0.45, ease: [0.22, 1, 0.36, 1]}}
                                />
                            </motion.article>
                        </StaggerItem>
                        );
                    })}
                </StaggerGroup>
            </Reveal>
        </section>
    );
}
