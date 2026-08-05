"use client";

import {motion, useScroll, useSpring, useTransform} from "motion/react";
import {ReactNode, useRef} from "react";
import {useMotionCapability} from "@/hooks/use-motion-capability";
import {cn} from "@/lib/utils";

const glideEase = [0.22, 1, 0.36, 1] as const;

export function ServiceLandingProgress() {
    const {capability, isReady} = useMotionCapability();
    const {scrollYProgress} = useScroll();
    const smoothProgress = useSpring(scrollYProgress, {
        stiffness: 110,
        damping: 24,
        mass: 0.28,
    });
    const journeyY = useTransform(smoothProgress, [0, 1], [0, 132]);

    if (!isReady || capability === "reduced") {
        return null;
    }

    return (
        <div aria-hidden="true" className="pointer-events-none">
            <div
                className="fixed inset-x-0 top-0 z-[70] h-[3px] bg-foreground/6"
                data-service-scroll-progress=""
            >
                <motion.div
                    className="h-full origin-left bg-gradient-to-r from-primary via-[#58b7b3] to-accent"
                    style={{scaleX: smoothProgress}}
                />
            </div>

            {capability === "full" && (
                <div className="fixed right-5 top-1/2 z-40 hidden -translate-y-1/2 rounded-full border border-black/8 bg-white/72 px-3 py-4 shadow-lg backdrop-blur-xl dark:border-white/10 dark:bg-black/35 xl:block">
                    <div className="relative h-36 w-px bg-foreground/14">
                        <motion.div
                            className="absolute inset-x-0 top-0 h-full origin-top bg-gradient-to-b from-primary to-accent"
                            style={{scaleY: smoothProgress}}
                        />
                        <motion.div
                            className="absolute -left-[0.28rem] top-0 h-2.5 w-2.5 rounded-full border-2 border-background bg-primary shadow-[0_0_16px_rgba(88,183,179,0.75)]"
                            style={{y: journeyY}}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

export function ServiceGlideSection({
    children,
    className,
    id,
    ariaLabelledby,
}: {
    children: ReactNode;
    className?: string;
    id?: string;
    ariaLabelledby?: string;
}) {
    const sectionRef = useRef<HTMLElement>(null);
    const {capability, isReady} = useMotionCapability();
    const {scrollYProgress} = useScroll({
        target: sectionRef,
        offset: ["start 94%", "end 8%"],
    });
    const sectionY = useTransform(scrollYProgress, [0, 0.2, 0.78, 1], [58, 0, 0, -34]);
    const sectionOpacity = useTransform(scrollYProgress, [0, 0.18, 0.8, 1], [0.62, 1, 1, 0.76]);
    const liteOpacity = useTransform(scrollYProgress, [0, 0.16, 0.84, 1], [0.82, 1, 1, 0.9]);
    const sectionScale = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0.985, 1, 1, 0.992]);
    const hasRichMotion = isReady && capability === "full";
    const hasLiteMotion = isReady && capability === "lite";

    return (
        <section
            ref={sectionRef}
            id={id}
            className={cn("relative", className)}
            aria-labelledby={ariaLabelledby}
            data-service-glide-section=""
        >
            <motion.div
                style={hasRichMotion
                    ? {y: sectionY, opacity: sectionOpacity, scale: sectionScale}
                    : hasLiteMotion
                        ? {opacity: liteOpacity}
                        : undefined}
                transition={{duration: 0.5, ease: glideEase}}
            >
                {children}
            </motion.div>
        </section>
    );
}
