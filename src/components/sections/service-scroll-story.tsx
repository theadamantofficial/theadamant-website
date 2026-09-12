"use client";

import Image from "next/image";
import Link from "next/link";
import {motion, useMotionValueEvent, useScroll} from "motion/react";
import {useRef, useState} from "react";
import {SiteCopy} from "@/lib/site-copy";
import {getScrollStage} from "@/lib/motion-capability";
import {useMotionCapability} from "@/hooks/use-motion-capability";

const smoothEase = [0.22, 1, 0.36, 1] as const;

const visualAccents = [
    "from-primary/28 via-primary/8 to-transparent",
    "from-accent/24 via-accent/8 to-transparent",
    "from-[#c69f62]/28 via-[#c69f62]/8 to-transparent",
    "from-[#6c8f7b]/28 via-[#6c8f7b]/8 to-transparent",
];

const SERVICE_OFFERS: Record<string, {startingAt: string; timeline: string; proof: string[]; cta: string; href: string}> = {
    "UI/UX Design": {startingAt: "Starting at ₹45k", timeline: "2–4 weeks", proof: ["Clickable prototype before build", "Journey map and conversion review"], cta: "Plan the experience", href: "/#contact"},
    "Website Development": {startingAt: "Starting at ₹75k", timeline: "4–8 weeks", proof: ["Performance and technical SEO checklist", "Reusable content blocks for your team"], cta: "Scope a website", href: "/website-development"},
    "Mobile App Development": {startingAt: "Starting at ₹1.5L", timeline: "8–14 weeks", proof: ["Shared iOS and Android codebase", "Testable onboarding and release plan"], cta: "Discuss an app", href: "/app-development-noida"},
    "Digital Marketing": {startingAt: "Starting at ₹30k / month", timeline: "First plan in 10 days", proof: ["Channel plan tied to landing pages", "Weekly creative and performance review"], cta: "Build a growth plan", href: "/digital-marketing-services"},
};

export function ServiceScrollStory({
    items,
}: {
    items: SiteCopy["services"]["items"];
}) {
    const storyRef = useRef<HTMLDivElement>(null);
    const [activeIndex, setActiveIndex] = useState(0);
    const {capability} = useMotionCapability();
    const {scrollYProgress} = useScroll({
        target: storyRef,
        offset: ["start 25%", "end 80%"],
    });

    useMotionValueEvent(scrollYProgress, "change", (latest) => {
        const nextIndex = getScrollStage(latest, items.length);

        setActiveIndex((currentIndex) => currentIndex === nextIndex ? currentIndex : nextIndex);
    });

    if (items.length === 0) {
        return null;
    }

    const isReduced = capability === "reduced";
    const isFullMotion = capability === "full";
    const displayedIndex = isReduced ? 0 : activeIndex;

    return (
        <div
            ref={storyRef}
            className="mt-10 grid items-start gap-7 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:gap-12"
            data-motion-capability={capability}
        >
            <div className={isReduced ? "relative" : "sticky top-24 z-10 lg:top-28"}>
                <div
                    className="services-story-stage relative h-[42svh] min-h-[19rem] max-h-[30rem] overflow-hidden rounded-[2rem] border border-[var(--border-visible)] bg-[linear-gradient(180deg,rgba(255,255,255,0.9),rgba(237,229,218,0.82))] shadow-[0_38px_90px_-52px_rgba(15,23,42,0.58)] dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(18,21,23,0.98),rgba(10,14,16,0.95))] lg:h-[calc(100svh-9rem)] lg:max-h-[46rem]"
                    aria-hidden="true"
                >
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(13,92,99,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(13,92,99,0.06)_1px,transparent_1px)] bg-[size:42px_42px] opacity-80 [mask-image:radial-gradient(circle_at_center,black,transparent_82%)] dark:opacity-60"/>
                    <div className={`absolute inset-0 bg-gradient-to-br ${visualAccents[displayedIndex % visualAccents.length]}`}/>

                    <div className="absolute inset-x-5 top-5 z-20 flex items-center justify-between gap-4 sm:inset-x-6 sm:top-6">
                        <p className="max-w-[70%] truncate text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-primary)]">
                            {items[displayedIndex]?.title}
                        </p>
                        <p className="text-xs font-semibold tabular-nums tracking-[0.18em] text-[var(--text-secondary)]">
                            {String(displayedIndex + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}
                        </p>
                    </div>

                    <div className="absolute inset-x-5 top-14 z-20 h-px overflow-hidden rounded-full bg-foreground/10 sm:inset-x-6 sm:top-16">
                        <motion.div
                            className="h-full origin-left bg-primary dark:bg-primary"
                            animate={{scaleX: (displayedIndex + 1) / items.length}}
                            transition={isFullMotion ? {duration: 0.45, ease: smoothEase} : {duration: 0}}
                        />
                    </div>

                    <div className="service-sculpture-frame">
                        <div className="service-sculpture-fallback">
                            <Image
                                src={items[displayedIndex].image}
                                alt={items[displayedIndex].imageAlt ?? `${items[displayedIndex].title} illustration`}
                                fill
                                className="object-contain"
                                sizes="(max-width: 1024px) 85vw, (max-width: 1440px) 44vw, 640px"
                            />
                        </div>
                    </div>

                    <div className="absolute inset-x-5 bottom-5 z-20 sm:inset-x-6 sm:bottom-6">
                        <p className="line-clamp-2 text-sm leading-6 text-[var(--text-secondary)] sm:text-base">
                            {items[displayedIndex]?.description}
                        </p>
                    </div>
                </div>
            </div>

            <div className={isReduced ? "grid gap-4" : "grid"}>
                {items.map((service, index) => {
                    const isActive = index === activeIndex;
                    const offer = SERVICE_OFFERS[service.title];

                    return (
                        <div
                            key={service.title}
                            className={isReduced
                                ? "flex min-h-0 items-center py-1"
                                : "flex min-h-[58svh] items-center py-8 lg:min-h-[72svh] lg:py-12"}
                        >
                            <motion.article
                                className={`service-spatial-card relative w-full border border-transparent p-6 transition-colors sm:p-8 ${
                                    !isReduced && isActive
                                        ? "border-primary/35"
                                        : "border-black/10 dark:border-white/10"
                                }`}
                                initial={false}
                                animate={isReduced ? {
                                    opacity: 1,
                                    y: 0,
                                    scale: 1,
                                } : {
                                    opacity: isActive ? 1 : 0.82,
                                    y: isActive ? 0 : 8,
                                    scale: isFullMotion && isActive ? 1 : 0.99,
                                }}
                                transition={{duration: isFullMotion ? 0.4 : 0.12, ease: smoothEase}}
                                aria-current={!isReduced && isActive ? "step" : undefined}
                            >
                                <div className="absolute inset-y-6 left-0 w-1 rounded-r-full bg-primary/18">
                                    <motion.div
                                        className="h-full origin-top rounded-r-full bg-primary"
                                        animate={{scaleY: !isReduced && isActive ? 1 : 0}}
                                        transition={{duration: isFullMotion ? 0.42 : 0}}
                                    />
                                </div>

                                <div className="flex items-center justify-between gap-4">
                                    <span className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--text-tertiary)]">
                                        {String(index + 1).padStart(2, "0")}
                                    </span>
                                    <span className={`h-2.5 w-2.5 rounded-full transition-colors ${isActive && !isReduced ? "bg-primary" : "bg-[var(--text-tertiary)]"}`}/>
                                </div>
                                <h3 className="mt-7 text-2xl font-semibold tracking-tight text-[var(--text-primary)] sm:text-3xl">
                                    {service.title}
                                </h3>
                                <p className="mt-4 text-base leading-7 text-[var(--text-secondary)]">
                                    {service.description}
                                </p>
                                <div className="service-detail-plane mt-6 border-l border-primary/35 p-5">
                                    <p className="text-sm leading-7 text-[var(--text-secondary)]">
                                        {service.detail}
                                    </p>
                                </div>
                                {offer && <div className="mt-6 border-t border-black/8 pt-5 dark:border-white/10">
                                    <div className="flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-tertiary)]">
                                        <span>{offer.startingAt}</span><span aria-hidden="true">·</span><span>{offer.timeline}</span>
                                    </div>
                                    <ul className="mt-4 grid gap-2 text-sm leading-6 text-[var(--text-secondary)]">
                                        {offer.proof.map((point) => <li key={point}>✓ {point}</li>)}
                                    </ul>
                                    <Link href={offer.href} className="mt-5 inline-flex text-sm font-semibold text-primary underline decoration-primary/35 underline-offset-4">
                                        {offer.cta} →
                                    </Link>
                                </div>}
                            </motion.article>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
