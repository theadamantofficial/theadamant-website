"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import Image from "next/image";
import {ArrowDown, Volume2, VolumeX} from "lucide-react";
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
    const audioRef = useRef<{context: AudioContext; oscillators: OscillatorNode[]} | null>(null);
    const [audioOn, setAudioOn] = useState(false);
    const enhanced = isReady && capability === "full";
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
    useEffect(() => () => {
        audioRef.current?.oscillators.forEach((oscillator) => oscillator.stop());
        void audioRef.current?.context.close();
    }, []);
    const toggleAudio = () => {
        if (audioRef.current) {
            audioRef.current.oscillators.forEach((oscillator) => oscillator.stop());
            void audioRef.current.context.close();
            audioRef.current = null;
            setAudioOn(false);
            return;
        }
        const context = new AudioContext();
        const master = context.createGain();
        master.gain.value = .018;
        master.connect(context.destination);
        const oscillators = [82.41, 123.47].map((frequency, index) => {
            const oscillator = context.createOscillator();
            const gain = context.createGain();
            oscillator.type = index ? "sine" : "triangle";
            oscillator.frequency.value = frequency;
            gain.gain.value = index ? .28 : .42;
            oscillator.connect(gain).connect(master);
            oscillator.start();
            return oscillator;
        });
        audioRef.current = {context, oscillators};
        setAudioOn(true);
    };

    return (
        <section ref={sectionRef} className="workspace-scroll-track" data-motion={capability} aria-labelledby="hero-heading">
            <div ref={heroRef} className="workspace-hero">
                <div className="workspace-heading">
                    <p className="workspace-label"><span/> INDEPENDENT DIGITAL STUDIO</p>
                    <h1 id="hero-heading">{locale === "en" ? <>Serious about<br/><em>the unexpected.</em></> : copy.title}</h1>
                    <p className="workspace-intro">We design. We build. We make a little noise.<br/>Scroll through a world of bold digital ideas.</p>
                </div>
                <div className="workspace-edition" aria-hidden="true"><span>ADAMANT®</span><span>INTERACTIVE STUDIO — VOL. 01</span></div>
                <div className="workspace-scene">
                    <div className="workspace-fallback" aria-hidden="true">
                        <div className="fallback-monitor"><span>ADAMANT</span><div className="fallback-film"/><p>Firm in vision. Bold in action.</p></div>
                        <div className="fallback-neck"/><div className="fallback-base"/><div className="fallback-desk"/>
                    </div>
                    {enhanced && <StudioRoom onEnter={zoomIn} progressRef={progressRef} paused={false} resetKey={0} palette={0}/>}
                </div>
                <div className="workspace-bottom">
                    <span />
                    <div className="workspace-controls">
                        <Link href={getLocalizedPath(locale,"services")} className="workspace-scroll">Explore services <ArrowDown size={14}/></Link>
                    </div>
                </div>
                <div className="workspace-film-caption"><span>01 / THE SPARK</span><p>Firm in vision.<br/><em>Bold in action.</em></p><small>Keep scrolling. There’s more to the story. ↓</small></div>
                <div className={`workspace-audio-avatar ${audioOn ? "is-listening" : ""}`} aria-hidden="true">
                    <Image src="/images/adamant-avatar/listening.png" alt="" fill sizes="220px"/>
                    <span>STUDIO FREQUENCY</span>
                </div>
                <button className="workspace-film-sound" type="button" onClick={toggleAudio} aria-label={audioOn ? "Mute studio ambience" : "Play studio ambience"} aria-pressed={audioOn}>
                    {audioOn ? <Volume2 size={17}/> : <VolumeX size={17}/>}
                </button>
                <div className="workspace-footer"><span>FIRM IN VISION. BOLD IN ACTION.</span><span>BUILT IN INDIA. CONNECTED TO THE WORLD.</span></div>
            </div>
        </section>
    );
}
