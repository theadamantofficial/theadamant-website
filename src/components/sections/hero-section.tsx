"use client";

import Link from "next/link";
import Image from "next/image";
import {ArrowDown} from "lucide-react";
import {useEffect, useRef, useState} from "react";
import {SiteCopy} from "@/lib/site-copy";
import {getLocalizedPath, SiteLocale} from "@/lib/site-locale";
import {useMotionCapability} from "@/hooks/use-motion-capability";

export default function HeroSection({copy, locale}: {copy: SiteCopy["hero"]; locale: SiteLocale}) {
    const {capability} = useMotionCapability();
    const sectionRef = useRef<HTMLElement>(null);
    const heroRef = useRef<HTMLDivElement>(null);
    const progressRef = useRef(0);
    const [introComplete, setIntroComplete] = useState(false);
    const [isHeroVisible, setIsHeroVisible] = useState(true);
    useEffect(() => {
        const complete = () => setIntroComplete(true);
        if (document.documentElement.dataset.introComplete === "true") complete();
        window.addEventListener("adamant:intro-complete", complete);
        return () => window.removeEventListener("adamant:intro-complete", complete);
    }, []);
    useEffect(() => {
        const section = sectionRef.current;
        if (!section) return;
        const observer = new IntersectionObserver(([entry]) => setIsHeroVisible(entry.isIntersecting), {rootMargin: "160px 0px"});
        observer.observe(section);
        return () => observer.disconnect();
    }, []);
    useEffect(() => {
        const section = sectionRef.current;
        const hero = heroRef.current;
        if (!section || !hero || !isHeroVisible || !introComplete || capability === "reduced") return;
        let frame = 0;
        const update = () => {
            const distance = section.offsetHeight - innerHeight;
            const progress = Math.min(1, Math.max(0, -section.getBoundingClientRect().top / Math.max(1, distance)));
            progressRef.current = progress;
            hero.style.setProperty("--studio-progress", String(progress));
            hero.dataset.zoomed = String(progress > .35);
        };
        const schedule = () => {if (!frame) frame = requestAnimationFrame(() => {frame = 0; update();});};
        window.addEventListener("scroll", schedule, {passive:true});
        window.addEventListener("resize", schedule);
        update();
        return () => {cancelAnimationFrame(frame);window.removeEventListener("scroll",schedule);window.removeEventListener("resize",schedule);};
    }, [isHeroVisible, introComplete, capability]);

    return (
        <section ref={sectionRef} className="workspace-scroll-track" data-motion={capability} data-motion-active={isHeroVisible && introComplete && capability !== "reduced"} aria-labelledby="hero-heading">
            <div ref={heroRef} className={`workspace-hero ${introComplete ? "workspace-intro-complete" : ""}`}>
                <div className="workspace-heading">
                    <p className="workspace-label"><span/> {copy.kicker}</p>
                    <h1 id="hero-heading">{copy.title}</h1>
                    <p className="workspace-intro">{copy.description}</p>
                </div>
                <div className="workspace-scene">
                    <div className="workspace-static-art" aria-label="Adamant website, app, and digital product design workspace">
                        <div className="workspace-static-glow"/>
                        <div className="workspace-static-grid"/>
                        <div className="workspace-static-window workspace-static-window-back" aria-hidden="true"/>
                        <div className="workspace-static-window workspace-static-window-front">
                            <div className="workspace-static-window-bar"><span/><span/><span/><b>Adamant Studio</b></div>
                            <div className="workspace-static-window-body">
                                <div className="workspace-static-sidebar"><i/><i/><i/><i/></div>
                                <div className="workspace-static-dashboard">
                                    <span className="workspace-static-eyebrow">Build With Clarity</span>
                                    <strong>Websites, Apps<br/>And Digital Growth.</strong>
                                    <div className="workspace-static-lines"><i/><i/><i/></div>
                                </div>
                            </div>
                        </div>
                        <Image
                            src="/images/adamant-character/builder-guide.webp"
                            alt="Adamant designer building websites, apps, and digital products"
                            width={1184}
                            height={1328}
                            sizes="(max-width: 600px) 250px, (max-width: 1000px) 330px, 430px"
                            quality={75}
                            priority
                            className="workspace-static-character"
                        />
                        <div className="workspace-static-chip workspace-static-chip-top">Web · Apps · SaaS <b>↗</b></div>
                        <div className="workspace-static-chip workspace-static-chip-bottom">SEO · AI · Automation</div>
                    </div>
                </div>
                <div className="workspace-bottom">
                    <span />
                    <div className="workspace-controls">
                        <Link href={getLocalizedPath(locale,"services")} className="workspace-scroll">{copy.secondaryCta} <ArrowDown size={14}/></Link>
                    </div>
                </div>
                <div className="workspace-footer"><span>{copy.tagline}</span><span>{copy.previewEyebrowRight}</span></div>
            </div>
        </section>
    );
}
