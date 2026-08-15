"use client";

import {BackgroundRippleEffect} from "@/components/ui/background-ripple-effect";
import Link from "next/link";
import dynamic from "next/dynamic";
import {ArrowRight, LayoutTemplate, Search, Sparkles, Volume2, VolumeX, Zap} from "lucide-react";
import {motion, useScroll, useTransform} from "motion/react";
import {useRef, useState} from "react";
import {SiteCopy} from "@/lib/site-copy";
import {getLocalizedPath, SiteLocale} from "@/lib/site-locale";
import {OpenAuditButton} from "@/components/ui/open-audit-button";
import {useMotionCapability} from "@/hooks/use-motion-capability";

const smoothEase = [0.22, 1, 0.36, 1] as const;
const DotLottieReact = dynamic(
    () => import("@lottiefiles/dotlottie-react").then((module) => module.DotLottieReact),
    {
        ssr: false,
        loading: () => <div className="hero-background-sphere-fallback"/>,
    },
);

export default function HeroSection({
    copy,
    locale,
}: {
    copy: SiteCopy["hero"];
    locale: SiteLocale;
}) {
    const sectionRef = useRef<HTMLElement>(null);
    const introVideoRef = useRef<HTMLVideoElement>(null);
    const [isVideoMuted, setIsVideoMuted] = useState(true);
    const {capability, isReady} = useMotionCapability();
    const showEnhancedVisuals = isReady && capability === "full";
    const {scrollYProgress} = useScroll({
        target: sectionRef,
        offset: ["start start", "end start"],
    });
    const copyY = useTransform(scrollYProgress, [0, 1], [0, -34]);
    const copyOpacity = useTransform(scrollYProgress, [0, 0.78, 1], [1, 1, 0.72]);
    const visualY = useTransform(scrollYProgress, [0, 1], [0, 44]);
    const visualScale = useTransform(scrollYProgress, [0, 1], [1, 0.965]);
    const visualRotate = useTransform(scrollYProgress, [0, 1], [0, -1.2]);
    const featureCardIcons = [LayoutTemplate, Search, Zap];

    const enableVideoSound = () => {
        const video = introVideoRef.current;

        if (!video) {
            return;
        }

        video.muted = false;
        setIsVideoMuted(false);
        void video.play().catch(() => {
            video.muted = true;
            setIsVideoMuted(true);
        });
    };

    const muteVideo = () => {
        const video = introVideoRef.current;

        if (!video) {
            return;
        }

        video.muted = true;
        setIsVideoMuted(true);
    };

    const toggleVideoSound = () => {
        if (isVideoMuted) {
            enableVideoSound();
            return;
        }

        muteVideo();
    };

    return <section
        ref={sectionRef}
        className={`hero-section px-6 pb-20 pt-28 sm:px-8 lg:px-12 ${showEnhancedVisuals ? "" : "motion-effects-paused"}`}
        aria-labelledby="hero-heading"
    >
        <BackgroundRippleEffect/>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(13,92,99,0.18),transparent_32%),radial-gradient(circle_at_80%_20%,rgba(214,106,69,0.14),transparent_26%)]"/>
        <motion.div
            className="ambient-orb ambient-orb-left"
            animate={showEnhancedVisuals ? {x: [0, 28, 0], y: [0, 16, 0], scale: [1, 1.08, 1]} : undefined}
            transition={showEnhancedVisuals ? {duration: 12, repeat: Infinity, ease: "easeInOut"} : undefined}
        />
        <motion.div
            className="ambient-orb ambient-orb-right"
            animate={showEnhancedVisuals ? {x: [0, -22, 0], y: [0, -18, 0], scale: [1, 0.94, 1]} : undefined}
            transition={showEnhancedVisuals ? {duration: 14, repeat: Infinity, ease: "easeInOut"} : undefined}
        />
        <div className="hero-background-sphere" aria-hidden="true">
            {showEnhancedVisuals ? (
                <DotLottieReact
                    src="/animations/tech-sphere.lottie"
                    loop
                    autoplay
                    className="h-full w-full"
                />
            ) : (
                <div className="hero-background-sphere-fallback"/>
            )}
        </div>

        <div className="section-shell relative z-10 grid items-center gap-16 pb-10 pt-8 lg:grid-cols-[1.12fr_0.88fr] lg:pt-16">
            <motion.div
                className="max-w-3xl"
                style={showEnhancedVisuals ? {y: copyY, opacity: copyOpacity} : undefined}
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
                    className="section-kicker motion-reveal"
                    variants={heroItemVariants}
                >
                    <Sparkles className="h-4 w-4"/>
                    {copy.kicker}
                </motion.p>

                {copy.tagline && (
                    <motion.p
                        className="motion-reveal mt-4 text-sm font-semibold uppercase tracking-[0.28em] text-foreground/60"
                        variants={heroItemVariants}
                    >
                        {copy.tagline}
                    </motion.p>
                )}

                <motion.h1
                    id="hero-heading"
                    className="hero-heading motion-reveal mt-8"
                    variants={heroItemVariants}
                >
                    {copy.title}
                </motion.h1>

                <motion.p className="hero-sub-heading motion-reveal mt-6" variants={heroItemVariants}>
                    {copy.description}
                </motion.p>

                <motion.div className="motion-reveal mt-8 flex flex-wrap gap-4" variants={heroItemVariants}>
                    <Link href={getLocalizedPath(locale, "contact")} className="button-primary">
                        {copy.primaryCta}
                        <ArrowRight className="h-4 w-4"/>
                    </Link>

                    {locale === "en" && (
                        <OpenAuditButton>
                            Get free audit
                        </OpenAuditButton>
                    )}

                    <Link href={getLocalizedPath(locale, "services")} className="button-secondary">
                        {copy.secondaryCta}
                    </Link>
                </motion.div>

                <motion.div className="motion-reveal mt-10 grid gap-3 sm:grid-cols-3" variants={heroItemVariants}>
                    {copy.positioningPoints.map((point, index) => (
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
                className="motion-reveal relative"
                initial={{opacity: 0, x: 28, rotate: 1.5}}
                animate={{opacity: 1, x: 0, rotate: 0}}
                transition={{duration: 0.85, delay: 0.2, ease: smoothEase}}
            >
                <motion.div
                    style={showEnhancedVisuals
                        ? {y: visualY, scale: visualScale, rotate: visualRotate}
                        : undefined}
                >
                    <motion.div
                        className="hero-preview-panel relative overflow-hidden p-5 sm:p-6"
                        whileHover={showEnhancedVisuals ? {y: -6} : undefined}
                        transition={{duration: 0.3, ease: "easeOut"}}
                    >
                    <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-foreground/25 to-transparent"/>

                    <div className="flex items-center justify-between text-sm text-foreground/65">
                        <span>{copy.previewEyebrowLeft}</span>
                        <span>{copy.previewEyebrowRight}</span>
                    </div>

                    <div
                        className="hero-visual-shell group mt-6 aspect-video"
                        onMouseEnter={enableVideoSound}
                        onMouseLeave={muteVideo}
                    >
                        <video
                            ref={introVideoRef}
                            className="absolute inset-0 h-full w-full object-cover"
                            poster="/videos/adamant-logo-reveal-poster.jpg"
                            autoPlay
                            loop
                            muted={isVideoMuted}
                            playsInline
                            preload="auto"
                            controlsList="nodownload noplaybackrate"
                            disablePictureInPicture
                            aria-label="Adamant logo film"
                        >
                            <source src="/videos/adamant-logo-reveal.mp4" type="video/mp4"/>
                            Your browser does not support HTML5 video.
                        </video>
                        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(3,28,32,0.08),transparent_62%,rgba(3,28,32,0.3))]"/>
                        <button
                            type="button"
                            className="hero-video-sound-toggle"
                            onClick={toggleVideoSound}
                            aria-label={isVideoMuted ? "Turn logo film sound on" : "Turn logo film sound off"}
                            aria-pressed={!isVideoMuted}
                        >
                            {isVideoMuted
                                ? <VolumeX className="h-4 w-4"/>
                                : <Volume2 className="h-4 w-4"/>}
                        </button>
                    </div>

                    <div className="mt-6 grid gap-3 md:grid-cols-2">
                        {copy.featureCards.map((card, index) => {
                            const Icon = featureCardIcons[index];

                            return (
                            <motion.div
                                key={card.title}
                                className={`hero-mini-card lift-card ${index === copy.featureCards.length - 1 ? "md:col-span-2" : ""}`}
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
            </motion.div>
        </div>
    </section>;
}

const heroItemVariants = {
    hidden: {opacity: 0, y: 26},
    show: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.72,
            ease: smoothEase,
        },
    },
};
