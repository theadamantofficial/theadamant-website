"use client";

import Link from "next/link";
import {ArrowDown} from "lucide-react";
import {useEffect, useRef, useState} from "react";
import {SiteCopy} from "@/lib/site-copy";
import {getLocalizedPath, SiteLocale} from "@/lib/site-locale";
import {useMotionCapability} from "@/hooks/use-motion-capability";

export default function HeroSection({copy, locale}: {copy: SiteCopy["hero"]; locale: SiteLocale}) {
    const {capability} = useMotionCapability();
    const sectionRef = useRef<HTMLElement>(null);
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
    return (
        <section ref={sectionRef} className="workspace-scroll-track" data-motion={capability} data-motion-active={isHeroVisible && introComplete && capability !== "reduced"} aria-labelledby="hero-heading">
            <div className={`workspace-hero ${introComplete ? "workspace-intro-complete" : ""}`}>
                <div className="workspace-heading">
                    <p className="workspace-label"><span/> {copy.kicker}</p>
                    <h1 id="hero-heading">{copy.title}</h1>
                    <p className="workspace-intro">{copy.description}</p>
                </div>
                <div className="workspace-scene" aria-hidden="true">
                    <div className="workspace-static-art">
                        <div className="workspace-static-glow"/>
                        <div className="workspace-static-grid"/>
                        <div className="workspace-static-window workspace-static-window-back"/>
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
