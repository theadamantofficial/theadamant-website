"use client";
import {useEffect, useRef} from "react";
import {useMotionCapability} from "@/hooks/use-motion-capability";
import {registerViewportMotion} from "@/lib/viewport-motion";
type DepthVariant = "credentials" | "proof" | "values" | "services" | "process" | "faq" | "contact" | "footer";
export function SectionDepth({variant}: {variant: DepthVariant}) {
    const ref = useRef<HTMLDivElement>(null);
    const {capability} = useMotionCapability();
    useEffect(() => {
        const node = ref.current, section = node?.closest("section, footer") as HTMLElement | null;
        if (!node || !section) return;
        section.dataset.motion = capability;
        let remove: (() => void) | undefined;
        let inView = false;
        const sync = () => {
            const active = inView && !document.hidden && !section.inert;
            section.dataset.motionActive = String(active && capability !== "reduced");
            remove?.(); remove = undefined;
            if (active && capability === "full") {
                remove = registerViewportMotion({element: section, write: progress => {
                    section.style.setProperty("--chapter-progress", progress.toFixed(4));
                    node.style.setProperty("--depth-y", String(70 - progress * 140) + "px");
                    node.style.setProperty("--depth-drift", String(progress * 70 - 35) + "px");
                }});
            }
        };
        const observer = new IntersectionObserver(([entry]) => {inView = entry.isIntersecting; sync();});
        observer.observe(section);
        document.addEventListener("visibilitychange", sync);
        window.addEventListener("adamant:intro-complete", sync);
        sync();
        return () => {observer.disconnect(); remove?.(); document.removeEventListener("visibilitychange", sync); window.removeEventListener("adamant:intro-complete", sync);};
    }, [capability]);
    return <div ref={ref} className={"section-depth section-depth-" + variant} aria-hidden="true">
        <div className="depth-object depth-object-main"/>
        <div className="depth-object depth-object-orbit"/>
        <div className="depth-object depth-object-dot"/>
        <div className="depth-core"><span/></div>
        <div className="depth-connector"/>
    </div>;
}
