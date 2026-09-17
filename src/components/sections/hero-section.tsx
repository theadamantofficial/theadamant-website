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
    const [sceneReady, setSceneReady] = useState(false);
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
    useEffect(() => {if (!isHeroVisible) setSceneReady(false);}, [isHeroVisible]);
    const zoomIn = () => {
        const section = sectionRef.current;
        if (section) window.scrollTo({top: section.offsetTop + section.offsetHeight - innerHeight, behavior: capability === "reduced" ? "instant" : "smooth"});
    };
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
                    <p className="workspace-label"><span/> INDEPENDENT DIGITAL STUDIO</p>
                    <h1 id="hero-heading">{locale === "en" ? <>Serious about<br/><em>the unexpected.</em></> : copy.title}</h1>
                    <p className="workspace-intro">{copy.description}</p>
                </div>
                <div className="workspace-scene">
                    {!sceneReady && <div className="workspace-mascot-loader" role={enhanced && introComplete ? "status" : undefined}>
                        <Image src="/images/adamant-character/builder-guide.webp" alt="Adamant builder guide illustration for website development and digital strategy" width={1184} height={1328} sizes="(max-width: 600px) 156px, 210px"/>
                        {enhanced && introComplete ? <><span className="mascot-loading-dots" aria-hidden="true"><i/><i/><i/></span><span className="sr-only">Preparing the studio</span></> : <p>Big ideas. Thoughtfully made.</p>}
                    </div>}
                    {enhanced && introComplete && isHeroVisible && <StudioRoom onReady={() => setSceneReady(true)} onEnter={zoomIn} progressRef={progressRef} paused={false} resetKey={0} palette={0}/>}
                </div>
                <div className="workspace-bottom">
                    <span />
                    <div className="workspace-controls">
                        <Link href={getLocalizedPath(locale,"services")} className="workspace-scroll">Explore services <ArrowDown size={14}/></Link>
                    </div>
                </div>
                <div className="workspace-footer"><span>FIRM IN VISION. BOLD IN ACTION.</span><span>BUILT IN INDIA. CONNECTED TO THE WORLD.</span></div>
            </div>
        </section>
    );
}
