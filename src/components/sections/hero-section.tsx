"use client";

import {BackgroundRippleEffect} from "@/components/ui/background-ripple-effect";
import {DotLottieReact} from "@lottiefiles/dotlottie-react";
import Link from "next/link";
import {ArrowRight, Sparkles} from "lucide-react";

export default function HeroSection() {
    const positioningPoints = [
        "Clear messaging that explains value in seconds",
        "Semantic structure that helps search engines understand the page",
        "Responsive layouts built to feel polished on every device",
    ];

    const featureCards = [
        {
            title: "Attention-first design",
            description: "Strong hierarchy, sharp copy, and confident visuals that pull users deeper into the page.",
        },
        {
            title: "SEO foundations",
            description: "Metadata, crawlable headings, FAQ content, and keyword-rich sections baked in from the start.",
        },
        {
            title: "Fast-moving execution",
            description: "From concept to launch-ready build without bloated layouts or vague messaging.",
        },
    ];

    return <section className="hero-section px-6 pb-20 pt-28 sm:px-8 lg:px-12" aria-labelledby="hero-heading">
        <BackgroundRippleEffect/>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(13,92,99,0.18),transparent_32%),radial-gradient(circle_at_80%_20%,rgba(214,106,69,0.14),transparent_26%)]"/>

        <div className="section-shell relative z-10 grid items-center gap-16 pb-10 pt-8 lg:grid-cols-[1.12fr_0.88fr] lg:pt-16">
            <div className="max-w-3xl">
                <p className="section-kicker">
                    <Sparkles className="h-4 w-4"/>
                    Design, development, and SEO-ready structure
                </p>

                <h1 id="hero-heading" className="hero-heading mt-8 animate-fadeIn">
                    Make the first screen impossible to ignore.
                </h1>

                <p className="hero-sub-heading mt-6">
                    The Adamant creates websites, UX systems, and mobile experiences that look premium, explain your offer clearly, and give search engines the structure they need from day one.
                </p>

                <div className="mt-8 flex flex-wrap gap-4">
                    <Link href="#contact" className="button-primary">
                        Start your project
                        <ArrowRight className="h-4 w-4"/>
                    </Link>

                    <Link href="#services" className="button-secondary">
                        Explore services
                    </Link>
                </div>

                <div className="mt-10 grid gap-3 sm:grid-cols-3">
                    {positioningPoints.map((point) => (
                        <div key={point} className="feature-chip min-h-20 items-start rounded-3xl px-4 py-4 text-left text-sm leading-6">
                            <span className="mt-1 h-2.5 w-2.5 rounded-full bg-accent"/>
                            <span>{point}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="relative">
                <div className="glass-panel relative overflow-hidden p-5 sm:p-6">
                    <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-foreground/25 to-transparent"/>

                    <div className="flex items-center justify-between text-sm text-foreground/65">
                        <span>Launch-ready digital presence</span>
                        <span>Strategy to shipping</span>
                    </div>

                    <div className="mt-6 overflow-hidden rounded-[1.75rem] border border-black/10 bg-[#d7ede8]/70 dark:border-white/10 dark:bg-[#103233]/60">
                        <DotLottieReact
                            src="/animations/tech-sphere.lottie"
                            loop
                            autoplay
                            className="h-[320px] w-full animate-float"
                        />
                    </div>

                    <div className="mt-6 grid gap-3 sm:grid-cols-3">
                        {featureCards.map((card) => (
                            <div key={card.title} className="rounded-[1.5rem] border border-black/8 bg-white/70 p-4 dark:border-white/10 dark:bg-white/5">
                                <p className="text-sm font-semibold text-foreground">{card.title}</p>
                                <p className="mt-2 text-sm leading-6 text-foreground/68">{card.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    </section>;
}
