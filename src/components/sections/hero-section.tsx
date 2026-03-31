"use client";

import {BackgroundRippleEffect} from "@/components/ui/background-ripple-effect";
import {DotLottieReact} from "@lottiefiles/dotlottie-react";
import Link from "next/link";
import {ArrowRight, LayoutTemplate, Search, Sparkles, Zap} from "lucide-react";
import {motion} from "motion/react";

const smoothEase = [0.22, 1, 0.36, 1] as const;

export default function HeroSection() {
    const positioningPoints = [
        "Clear messaging that explains value in seconds",
        "Semantic structure that helps search engines understand the page",
        "Responsive layouts built to feel polished on every device",
    ];

    const featureCards = [
        {
            title: "Attention-first design",
            description: "Hierarchy, contrast, and motion that guide the eye fast.",
            icon: LayoutTemplate,
        },
        {
            title: "SEO foundations",
            description: "Metadata, semantic sections, and search-readable copy.",
            icon: Search,
        },
        {
            title: "Fast-moving execution",
            description: "Launch momentum without bloated layouts or vague messaging.",
            icon: Zap,
        },
    ];

    const floatingBadges = [
        {
            label: "Modern motion",
            className: "-left-3 top-6 hidden md:flex",
            animation: {y: [0, -8, 0], x: [0, 5, 0]},
        },
        {
            label: "Search-ready",
            className: "right-4 top-5 hidden sm:flex",
            animation: {y: [0, 8, 0], x: [0, -4, 0]},
        },
        {
            label: "Conversion-led",
            className: "bottom-5 left-5 hidden lg:flex",
            animation: {y: [0, -10, 0]},
        },
    ];

    return <section className="hero-section px-6 pb-20 pt-28 sm:px-8 lg:px-12" aria-labelledby="hero-heading">
        <BackgroundRippleEffect/>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(13,92,99,0.18),transparent_32%),radial-gradient(circle_at_80%_20%,rgba(214,106,69,0.14),transparent_26%)]"/>
        <motion.div
            className="ambient-orb ambient-orb-left"
            animate={{x: [0, 28, 0], y: [0, 16, 0], scale: [1, 1.08, 1]}}
            transition={{duration: 12, repeat: Infinity, ease: "easeInOut"}}
        />
        <motion.div
            className="ambient-orb ambient-orb-right"
            animate={{x: [0, -22, 0], y: [0, -18, 0], scale: [1, 0.94, 1]}}
            transition={{duration: 14, repeat: Infinity, ease: "easeInOut"}}
        />

        <div className="section-shell relative z-10 grid items-center gap-16 pb-10 pt-8 lg:grid-cols-[1.12fr_0.88fr] lg:pt-16">
            <motion.div
                className="max-w-3xl"
                initial="hidden"
                animate="show"
                variants={{
                    hidden: {},
                    show: {
                        transition: {
                            staggerChildren: 0.12,
                        },
                    },
                }}
            >
                <motion.p
                    className="section-kicker"
                    variants={heroItemVariants}
                >
                    <Sparkles className="h-4 w-4"/>
                    Design, development, and SEO-ready structure
                </motion.p>

                <motion.h1
                    id="hero-heading"
                    className="hero-heading mt-8"
                    variants={heroItemVariants}
                >
                    Make the first screen impossible to ignore.
                </motion.h1>

                <motion.p className="hero-sub-heading mt-6" variants={heroItemVariants}>
                    The Adamant creates websites, UX systems, and mobile experiences that look premium, explain your offer clearly, and give search engines the structure they need from day one.
                </motion.p>

                <motion.div className="mt-8 flex flex-wrap gap-4" variants={heroItemVariants}>
                    <Link href="#contact" className="button-primary">
                        Start your project
                        <ArrowRight className="h-4 w-4"/>
                    </Link>

                    <Link href="#services" className="button-secondary">
                        Explore services
                    </Link>
                </motion.div>

                <motion.div className="mt-10 grid gap-3 sm:grid-cols-3" variants={heroItemVariants}>
                    {positioningPoints.map((point, index) => (
                        <motion.div
                            key={point}
                            className="feature-chip min-h-20 items-start rounded-3xl px-4 py-4 text-left text-sm leading-6"
                            initial={{opacity: 0, y: 18}}
                            animate={{opacity: 1, y: 0}}
                            transition={{delay: 0.5 + index * 0.1, duration: 0.55, ease: smoothEase}}
                        >
                            <span className="mt-1 h-2.5 w-2.5 rounded-full bg-accent"/>
                            <span>{point}</span>
                        </motion.div>
                    ))}
                </motion.div>
            </motion.div>

            <motion.div
                className="relative"
                initial={{opacity: 0, x: 28, rotate: 1.5}}
                animate={{opacity: 1, x: 0, rotate: 0}}
                transition={{duration: 0.85, delay: 0.2, ease: smoothEase}}
            >
                <motion.div
                    className="hero-preview-panel relative overflow-hidden p-5 sm:p-6"
                    whileHover={{y: -6}}
                    transition={{duration: 0.3, ease: "easeOut"}}
                >
                    <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-foreground/25 to-transparent"/>

                    <div className="flex items-center justify-between text-sm text-foreground/65">
                        <span>Launch-ready digital presence</span>
                        <span>Strategy to shipping</span>
                    </div>

                    <div className="hero-visual-shell mt-6">
                        <div className="hero-visual-grid"/>
                        <div className="hero-visual-glow"/>
                        <div className="hero-visual-ring"/>
                        {floatingBadges.map((badge, index) => (
                            <motion.div
                                key={badge.label}
                                className={`hero-floating-chip ${badge.className}`}
                                animate={badge.animation}
                                transition={{duration: 5.5 + index, repeat: Infinity, ease: "easeInOut"}}
                            >
                                {badge.label}
                            </motion.div>
                        ))}
                        <DotLottieReact
                            src="/animations/tech-sphere.lottie"
                            loop
                            autoplay
                            className="relative z-10 h-[320px] w-full animate-float"
                        />
                    </div>

                    <div className="mt-6 grid gap-3 md:grid-cols-2">
                        {featureCards.map((card, index) => {
                            const Icon = card.icon;

                            return (
                            <motion.div
                                key={card.title}
                                className={`hero-mini-card lift-card ${index === featureCards.length - 1 ? "md:col-span-2" : ""}`}
                                initial={{opacity: 0, y: 18}}
                                animate={{opacity: 1, y: 0}}
                                transition={{delay: 0.45 + index * 0.12, duration: 0.55, ease: smoothEase}}
                            >
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-foreground text-background dark:bg-primary dark:text-primary-foreground">
                                    <Icon className="h-4.5 w-4.5"/>
                                </div>
                                <p className="text-sm font-semibold text-foreground">{card.title}</p>
                                <p className="mt-2 text-sm leading-6 text-foreground/68">{card.description}</p>
                            </motion.div>
                            );
                        })}
                    </div>
                </motion.div>
            </motion.div>
        </div>
    </section>;
}

const heroItemVariants = {
    hidden: {opacity: 0, y: 26, filter: "blur(8px)"},
    show: {
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        transition: {
            duration: 0.72,
            ease: smoothEase,
        },
    },
};
