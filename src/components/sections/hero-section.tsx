"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import Image from "next/image";
import {ArrowDown} from "lucide-react";
import {useEffect, useRef, useState} from "react";
import {SiteCopy} from "@/lib/site-copy";
import {getLocalizedPath, SiteLocale} from "@/lib/site-locale";
import {useMotionCapability} from "@/hooks/use-motion-capability";

const StudioRoom = dynamic(() => import("@/components/visuals/studio-room"), {ssr: false});

export default function HeroSection({copy, locale}: {copy: SiteCopy["hero"]; locale: SiteLocale}) {
    const {capability, isReady} = useMotionCapability();
    const sectionRef = useRef<HTMLElement>(null);
    const heroRef = useRef<HTMLDivElement>(null);
    const progressRef = useRef(0);
    const [introComplete, setIntroComplete] = useState(false);
    const [isHeroVisible, setIsHeroVisible] = useState(true);
    const enhanced = isReady && capability === "full";
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
    const zoomIn = () => {
        const section = sectionRef.current;
        if (section) window.scrollTo({top: section.offsetTop + section.offsetHeight - innerHeight, behavior: capability === "reduced" ? "instant" : "smooth"});
    };
    useEffect(() => {
        const section = sectionRef.current;
        const hero = heroRef.current;
        if (!section || !hero) return;
        let frame = 0;
        const update = () => {
            const distance = section.offsetHeight - innerHeight;
            const progress = Math.min(1, Math.max(0, -section.getBoundingClientRect().top / Math.max(1, distance)));
            progressRef.current = progress;
            hero.style.setProperty("--studio-progress", String(progress));
            hero.dataset.zoomed = String(progress > .35);
        };
        const schedule = () => {cancelAnimationFrame(frame);frame = requestAnimationFrame(update);};
        window.addEventListener("scroll", schedule, {passive:true});
        window.addEventListener("resize", schedule);
        update();
        return () => {cancelAnimationFrame(frame);window.removeEventListener("scroll",schedule);window.removeEventListener("resize",schedule);};
    }, []);

    return (
        <section ref={sectionRef} className="workspace-scroll-track" data-motion={capability} aria-labelledby="hero-heading">
            <div ref={heroRef} className={`workspace-hero ${introComplete ? "workspace-intro-complete" : ""}`}>
                <div className="workspace-heading">
                    <p className="workspace-label"><span/> INDEPENDENT DIGITAL STUDIO</p>
                    <h1 id="hero-heading">{locale === "en" ? <>Serious about<br/><em>the unexpected.</em></> : copy.title}</h1>
                    <p className="workspace-intro">We design. We build. We make a little noise.<br/>Scroll through a world of bold digital ideas.</p>
                </div>
                <div className="workspace-scene">
                    <div className="workspace-fallback" aria-hidden="true">
                        <div className="fallback-monitor"><span>ADAMANT</span><div className="fallback-film"/><p>Firm in vision. Bold in action.</p></div>
                        <div className="fallback-neck"/><div className="fallback-base"/><div className="fallback-desk"/>
                    </div>
                    {enhanced && introComplete && isHeroVisible && <StudioRoom onEnter={zoomIn} progressRef={progressRef} paused={false} resetKey={0} palette={0}/>}
                </div>
                <div className="workspace-bottom">
                    <span />
                    <div className="workspace-controls">
                        <Link href={getLocalizedPath(locale,"services")} className="workspace-scroll">Explore services <ArrowDown size={14}/></Link>
                    </div>
                </div>
                <div className="workspace-audio-avatar" aria-hidden="true">
                    <Image src="/images/adamant-avatar/listening.webp" alt="" fill sizes="220px"/>
                </div>
                <div className="workspace-footer"><span>FIRM IN VISION. BOLD IN ACTION.</span><span>BUILT IN INDIA. CONNECTED TO THE WORLD.</span></div>
            </div>
        </section>
    );
}
