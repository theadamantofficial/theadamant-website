"use client";

import Image from "next/image";
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
        offset: ["start 70%", "end 40%"],
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
                    className="services-story-stage relative h-[42svh] min-h-[19rem] max-h-[30rem] overflow-hidden rounded-[2rem] border border-black/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.9),rgba(237,229,218,0.82))] shadow-[0_38px_90px_-52px_rgba(15,23,42,0.58)] dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(18,21,23,0.98),rgba(10,14,16,0.95))] lg:h-[calc(100svh-9rem)] lg:max-h-[46rem]"
                    aria-hidden="true"
                >
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(13,92,99,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(13,92,99,0.06)_1px,transparent_1px)] bg-[size:42px_42px] [mask-image:radial-gradient(circle_at_center,black,transparent_82%)] dark:opacity-60"/>
                    <div className={`absolute inset-0 bg-gradient-to-br ${visualAccents[displayedIndex % visualAccents.length]}`}/>

                    <div className="absolute inset-x-5 top-5 z-20 flex items-center justify-between gap-4 sm:inset-x-6 sm:top-6">
                        <p className="max-w-[70%] truncate text-xs font-semibold uppercase tracking-[0.2em] text-foreground/62">
                            {items[displayedIndex]?.title}
                        </p>
                        <p className="text-xs font-semibold tabular-nums tracking-[0.18em] text-foreground/48">
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

                    <div className="absolute inset-x-5 bottom-24 top-20 overflow-hidden rounded-[1.5rem] border border-black/8 bg-white/55 dark:border-white/10 dark:bg-black/20 sm:inset-x-6 sm:bottom-28 sm:top-24">
                        {items.map((service, index) => {
                            const isActive = index === displayedIndex;

                            return (
                                <motion.div
                                    key={service.title}
                                    className="absolute inset-0"
                                    initial={false}
                                    animate={{
                                        opacity: isActive ? 1 : 0,
                                        scale: isFullMotion && isActive ? 1 : 0.965,
                                        clipPath: isFullMotion && isActive
                                            ? "inset(0% 0% 0% 0% round 1.5rem)"
                                            : "inset(3% 3% 3% 3% round 1.5rem)",
                                    }}
                                    transition={{
                                        duration: isFullMotion ? 0.55 : 0.12,
                                        ease: smoothEase,
                                    }}
                                    aria-hidden={!isActive}
                                >
                                    <Image
                                        src={service.image}
                                        alt=""
                                        fill
                                        className="object-cover"
                                        sizes="(max-width: 1024px) 100vw, 44vw"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/42 via-transparent to-transparent"/>
                                </motion.div>
                            );
                        })}
                    </div>

                    <div className="absolute inset-x-5 bottom-5 z-20 sm:inset-x-6 sm:bottom-6">
                        <p className="line-clamp-2 text-sm leading-6 text-foreground/70 sm:text-base">
                            {items[displayedIndex]?.description}
                        </p>
                    </div>
                </div>
            </div>

            <div className={isReduced ? "grid gap-4" : "grid"}>
                {items.map((service, index) => {
                    const isActive = index === activeIndex;

                    return (
                        <div
                            key={service.title}
                            className={isReduced
                                ? "flex min-h-0 items-center py-1"
                                : "flex min-h-[58svh] items-center py-8 lg:min-h-[72svh] lg:py-12"}
                        >
                            <motion.article
                                className={`relative w-full overflow-hidden rounded-[1.8rem] border bg-white/76 p-6 shadow-[0_28px_65px_-48px_rgba(15,23,42,0.56)] backdrop-blur-xl transition-colors dark:bg-white/[0.05] sm:p-8 ${
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
                                    opacity: isActive ? 1 : 0.58,
                                    y: isActive ? 0 : 18,
                                    scale: isFullMotion && isActive ? 1 : 0.985,
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
                                    <span className="text-xs font-semibold uppercase tracking-[0.24em] text-foreground/45">
                                        {String(index + 1).padStart(2, "0")}
                                    </span>
                                    <span className={`h-2.5 w-2.5 rounded-full transition-colors ${isActive && !isReduced ? "bg-primary" : "bg-foreground/16"}`}/>
                                </div>
                                <h3 className="mt-7 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                                    {service.title}
                                </h3>
                                <p className="mt-4 text-base leading-7 text-foreground/72">
                                    {service.description}
                                </p>
                                <div className="mt-6 rounded-[1.35rem] border border-black/8 bg-black/[0.035] p-5 dark:border-white/10 dark:bg-white/[0.035]">
                                    <p className="text-sm leading-7 text-foreground/66">
                                        {service.detail}
                                    </p>
                                </div>
                            </motion.article>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
