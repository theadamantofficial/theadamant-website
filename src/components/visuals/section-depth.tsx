"use client";

import {motion, useScroll, useTransform} from "motion/react";
import {useRef} from "react";

type DepthVariant = "credentials" | "proof" | "values" | "services" | "process" | "faq" | "contact" | "footer";

/** Shared low-cost 3D layer for the homepage chapters. It gives each section a distinct object language. */
export function SectionDepth({variant}: {variant: DepthVariant}) {
    const sectionRef = useRef<HTMLDivElement>(null);
    const {scrollYProgress} = useScroll({target: sectionRef, offset: ["start end", "end start"]});
    const y = useTransform(scrollYProgress, [0, 1], [70, -70]);
    const rotate = useTransform(scrollYProgress, [0, 1], [-14, 16]);
    const drift = useTransform(scrollYProgress, [0, 1], [-35, 35]);

    return (
        <div ref={sectionRef} className={`section-depth section-depth-${variant}`} aria-hidden="true">
            <motion.div className="depth-object depth-object-main" style={{y, rotate}} />
            <motion.div className="depth-object depth-object-orbit" style={{y: drift, rotate: rotate}} />
            <motion.div className="depth-object depth-object-dot" style={{y: drift}} />
            <motion.div className="depth-core" style={{y: drift, rotate}}><span/></motion.div>
            <div className="depth-connector" />
        </div>
    );
}
