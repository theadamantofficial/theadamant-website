"use client";

import {Compass, PencilRuler, Code2, Rocket} from "lucide-react";
import {Reveal, StaggerGroup, StaggerItem} from "@/components/ui/reveal";
import {SiteCopy} from "@/lib/site-copy";
import {motion, useScroll, useTransform, MotionValue} from "motion/react";
import {useRef, ReactNode} from "react";
import {useMotionCapability} from "@/hooks/use-motion-capability";
import {SectionDepth} from "@/components/visuals/section-depth";

export default function ProcessSection({copy}: { copy: SiteCopy["process"] }) {
    const sectionRef = useRef<HTMLElement>(null);
    const icons = [Compass, PencilRuler, Code2, Rocket];
    const {capability} = useMotionCapability();
    const {scrollYProgress} = useScroll({
        target: sectionRef,
        offset: ["start 78%", "end 48%"],
    });

    return (
        <section ref={sectionRef} id="process" className="section-shell py-24" aria-labelledby="process-heading">
            <SectionDepth variant="process"/>
            <Reveal className="max-w-3xl">
                <p className="section-kicker">{copy.kicker}</p>
                <h2 id="process-heading" className="section-title">
                    {copy.title}
                </h2>
                <p className="section-copy">
                    {copy.description}
                </p>
            </Reveal>

            <div className="mt-10 h-1 overflow-hidden rounded-full bg-foreground/8">
                <motion.div
                    className="h-full origin-left rounded-full bg-gradient-to-r from-primary via-primary to-accent"
                    style={{scaleX: capability === "reduced" ? 1 : scrollYProgress}}
                />
            </div>
            <div className="process-signal-line" aria-hidden="true"/>

            <StaggerGroup className="mt-5 grid gap-4 lg:auto-rows-fr lg:grid-cols-4">
                {copy.steps.map(({number, title, description}, index) => {
                    const Icon = icons[index];
                    return (
                    <StaggerItem key={number} className="h-full [perspective:900px]">
                        <ProcessDepth progress={scrollYProgress} index={index} count={copy.steps.length} enabled={capability === "full"}>
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
                        </ProcessDepth>
                    </StaggerItem>
                    );
                })}
            </StaggerGroup>
        </section>
    );
}

function ProcessDepth({progress,index,count,enabled,children}: {progress:MotionValue<number>;index:number;count:number;enabled:boolean;children:ReactNode}) {
    const rotateX=useTransform(progress,[index/(count+1),(index+1)/(count+1)],[28,0]);
    const y=useTransform(progress,[index/(count+1),(index+1)/(count+1)],[40,0]);
    return <motion.div className="process-depth" style={enabled?{rotateX,y}:undefined}>{children}</motion.div>;
}
