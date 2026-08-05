"use client";

import Image from "next/image";
import Link from "next/link";
import {ArrowRight, CheckCircle2, ChevronDown, Globe, MapPin, Smartphone} from "lucide-react";
import {motion, useScroll, useTransform} from "motion/react";
import {useRef} from "react";
import {OpenAuditButton} from "@/components/ui/open-audit-button";
import {ServiceLandingPageConfig} from "@/lib/service-landing-pages";
import {useMotionCapability} from "@/hooks/use-motion-capability";

const smoothEase = [0.22, 1, 0.36, 1] as const;

const contentVariants = {
    hidden: {},
    show: {
        transition: {
            staggerChildren: 0.1,
        },
    },
};

const itemVariants = {
    hidden: {opacity: 0, y: 24},
    show: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.62,
            ease: smoothEase,
        },
    },
};

export function ServiceLandingHero({page}: {page: ServiceLandingPageConfig}) {
    const sectionRef = useRef<HTMLElement>(null);
    const {capability} = useMotionCapability();
    const {scrollYProgress} = useScroll({
        target: sectionRef,
        offset: ["start start", "end start"],
    });
    const visualY = useTransform(scrollYProgress, [0, 1], [0, -30]);
    const visualScale = useTransform(scrollYProgress, [0, 1], [1, 0.975]);
    const MarketChipIcon = getMarketChipIcon(page.slug);
    const marketChipLabel = getMarketChipLabel(page.slug);
    const fullMotion = capability === "full";
    const reduceMotion = capability === "reduced";

    return (
        <section
            ref={sectionRef}
            className="relative px-6 pb-16 pt-28 sm:px-8 lg:px-12"
            aria-labelledby="service-landing-heading"
        >
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_12%,rgba(13,92,99,0.15),transparent_30%),radial-gradient(circle_at_86%_18%,rgba(214,106,69,0.12),transparent_28%)]"/>
            <div className="section-shell relative grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
                <motion.div
                    className="motion-reveal max-w-3xl"
                    initial={reduceMotion ? false : "hidden"}
                    animate="show"
                    variants={contentVariants}
                >
                    <motion.p className="section-kicker motion-reveal" variants={itemVariants}>
                        {page.eyebrow}
                    </motion.p>
                    <motion.h1
                        id="service-landing-heading"
                        className="section-title motion-reveal mt-6 max-w-4xl"
                        variants={itemVariants}
                    >
                        {page.title}
                    </motion.h1>
                    <motion.p className="section-copy motion-reveal mt-6 max-w-3xl" variants={itemVariants}>
                        {page.intro}
                    </motion.p>

                    <motion.div className="motion-reveal mt-8 flex flex-wrap gap-3" variants={itemVariants}>
                        <Link href="#contact" className="button-primary">
                            {page.primaryCtaLabel}
                            <ArrowRight className="h-4 w-4"/>
                        </Link>
                        {page.secondaryAction.kind === "audit" ? (
                            <OpenAuditButton>
                                {page.secondaryAction.label}
                            </OpenAuditButton>
                        ) : (
                            <Link href={page.secondaryAction.href ?? "/#services"} className="button-secondary">
                                {page.secondaryAction.label}
                            </Link>
                        )}
                    </motion.div>

                    <motion.div className="motion-reveal mt-8 flex flex-wrap gap-3" variants={itemVariants}>
                        <span className="feature-chip">
                            <Globe className="h-4 w-4"/>
                            SEO-ready structure
                        </span>
                        <span className="feature-chip">
                            <CheckCircle2 className="h-4 w-4"/>
                            Conversion-focused UX
                        </span>
                        <span className="feature-chip">
                            <MarketChipIcon className="h-4 w-4"/>
                            {marketChipLabel}
                        </span>
                    </motion.div>
                </motion.div>

                <motion.div
                    className="glass-panel motion-reveal overflow-hidden p-4 sm:p-5"
                    initial={reduceMotion ? false : {
                        opacity: 0,
                        scale: 1.025,
                        clipPath: "inset(5% 5% 5% 5% round 2rem)",
                    }}
                    animate={{
                        opacity: 1,
                        scale: 1,
                        clipPath: "inset(0% 0% 0% 0% round 2rem)",
                    }}
                    transition={{duration: fullMotion ? 0.85 : 0.35, delay: 0.12, ease: smoothEase}}
                    style={{
                        y: fullMotion ? visualY : 0,
                        scale: fullMotion ? visualScale : 1,
                    }}
                >
                    <div className="relative overflow-hidden rounded-[1.8rem] border border-black/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(241,233,219,0.86))] p-5 dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(20,23,26,0.95),rgba(15,18,20,0.92))]">
                        <div className="mb-4 flex items-center justify-between text-sm text-foreground/62">
                            <span>Service focus</span>
                            <span>{page.eyebrow}</span>
                        </div>
                        <div className="relative h-[22rem] overflow-hidden rounded-[1.5rem] border border-black/6 bg-white/70 dark:border-white/10 dark:bg-white/5">
                            <Image
                                src={page.image}
                                alt={page.title}
                                fill
                                className="object-cover"
                                sizes="(max-width: 1024px) 100vw, 45vw"
                                priority
                            />
                        </div>
                        <div className="mt-5 rounded-[1.5rem] border border-black/8 bg-white/78 p-5 dark:border-white/10 dark:bg-white/5">
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-foreground/52">
                                Why this page exists
                            </p>
                            <p className="mt-3 text-sm leading-7 text-foreground/68">
                                Separate service pages help search engines understand the difference between general
                                brand messaging and specific offers such as website development, location-based
                                landing pages, digital marketing services, and mobile app services.
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>

            <motion.div
                aria-hidden="true"
                className="relative mt-8 flex justify-center"
                animate={fullMotion ? {y: [0, 7, 0]} : undefined}
                transition={fullMotion ? {duration: 2.2, repeat: Infinity, ease: "easeInOut"} : undefined}
            >
                <span className="flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white/70 text-foreground/62 shadow-sm backdrop-blur-md dark:border-white/10 dark:bg-white/5">
                    <ChevronDown className="h-4 w-4"/>
                </span>
            </motion.div>
        </section>
    );
}

function getMarketChipLabel(slug: string) {
    if (slug.includes("noida")) {
        return "Noida-focused positioning";
    }

    if (slug.includes("digital-marketing")) {
        return "Global campaign support";
    }

    return "Global launch-ready delivery";
}

function getMarketChipIcon(slug: string) {
    if (slug.includes("app")) {
        return Smartphone;
    }

    if (slug.includes("noida")) {
        return MapPin;
    }

    return Globe;
}
