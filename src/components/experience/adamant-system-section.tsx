"use client";

import {type CSSProperties, useEffect, useRef, useState} from "react";
import Image from "next/image";
import {SiteCopy} from "@/lib/site-copy";

const MODULES = [
    {name: "BUILD", detail: "Websites · Applications · UI/UX", className: "system-build"},
    {name: "GROW", detail: "SEO · Content · Digital marketing", className: "system-grow"},
    {name: "AUTOMATE", detail: "AI · Workflows · Business automation", className: "system-automate"},
    {name: "CONNECT", detail: "CRM · APIs · Integrations", className: "system-connect"},
    {name: "SCALE", detail: "Backend · Infrastructure · Analytics", className: "system-scale"},
];

export default function AdamantSystemSection({services}: {services: SiteCopy["services"]}) {
    const sectionRef = useRef<HTMLElement>(null);
    const worldRef = useRef<HTMLDivElement>(null);
    const [active, setActive] = useState(0);
    const [isInViewport, setIsInViewport] = useState(false);

    useEffect(() => {
        const section = sectionRef.current;
        if (!section) return;
        const observer = new IntersectionObserver(([entry]) => setIsInViewport(entry.isIntersecting), {
            rootMargin: "160px 0px",
        });
        observer.observe(section);
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        const section = sectionRef.current;
        const world = worldRef.current;
        if (!section || !world || !isInViewport) return;
        let frame = 0;
        const update = () => {
            const distance = section.offsetHeight - innerHeight;
            const progress = Math.max(0, Math.min(1, -section.getBoundingClientRect().top / Math.max(1, distance)));
            world.style.setProperty("--system-progress", String(progress));
            const next = Math.min(MODULES.length - 1, Math.floor(progress * MODULES.length));
            setActive(value => value === next ? value : next);
        };
        const schedule = () => {cancelAnimationFrame(frame); frame = requestAnimationFrame(update);};
        update(); window.addEventListener("scroll", schedule, {passive: true}); window.addEventListener("resize", schedule);
        return () => {cancelAnimationFrame(frame); window.removeEventListener("scroll", schedule); window.removeEventListener("resize", schedule);};
    }, [isInViewport]);

    return <section ref={sectionRef} id="adamant-system" className="adamant-system-track" aria-labelledby="adamant-system-title">
        <div ref={worldRef} className="adamant-system-world">
            <div className="system-bezel" aria-hidden="true"/>
            <div className="system-grid" aria-hidden="true"/>
            <header className="system-heading">
                <p>ADAMANT® · SYSTEM ONLINE</p>
                <h2 id="adamant-system-title">One system.<br/><em>Every capability connected.</em></h2>
                <span>{services.description}</span>
            </header>
            <svg className="system-signal-map" viewBox="0 0 1000 620" preserveAspectRatio="none" aria-hidden="true">
                <path d="M75 305 C180 80 340 115 495 305 S790 535 925 300"/>
                <path d="M170 505 C310 360 380 450 500 307 S730 100 850 145"/>
                <circle cx="500" cy="307" r="8"/>
            </svg>
            <div className="system-core" aria-hidden="true"><i/><i/><i/></div>
            <div className="system-modules">
                {MODULES.map((module, index) => <article key={module.name} className={`system-module ${module.className} ${active === index ? "is-active" : ""}`} style={{"--module-index": index} as CSSProperties} aria-current={active === index ? "step" : undefined}>
                    <span>{String(index + 1).padStart(2, "0")}</span><h3>{module.name}</h3><p>{module.detail}</p><i/>
                </article>)}
            </div>
            <div className="system-inventory" aria-label="Existing Adamant services">
                {services.items.map(item => <span key={item.title}>{item.title}</span>)}
            </div>
            <div className="system-guide" aria-hidden="true">
                <Image src="/images/adamant-avatar/builder.webp" alt="" fill sizes="260px"/>
                <span>ADAMANT GUIDE <b>ONLINE</b></span>
            </div>
            <p className="system-forward-copy">Technology is only useful<br/>when it moves your business forward.</p>
            <div className="system-scroll-status"><span>{String(active + 1).padStart(2, "0")} / 05</span><i><b style={{width: `${(active + 1) * 20}%`}}/></i><span>SCROLL TO TRAVEL</span></div>
        </div>
    </section>;
}
