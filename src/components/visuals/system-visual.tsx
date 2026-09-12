"use client";
import dynamic from "next/dynamic";
import {useEffect, useRef, useState} from "react";
import {useMotionCapability} from "@/hooks/use-motion-capability";
const Scene = dynamic(() => import("./system-scene"), {ssr: false});
export default function SystemVisual() {
    const ref = useRef<HTMLDivElement>(null);
    const [visible, setVisible] = useState(false), [introComplete, setIntroComplete] = useState(false);
    const {capability, isReady} = useMotionCapability();
    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting));
        if (ref.current) observer.observe(ref.current);
        const complete = () => setIntroComplete(true);
        if (document.documentElement.dataset.introComplete === "true") complete();
        window.addEventListener("adamant:intro-complete", complete);
        return () => {observer.disconnect(); window.removeEventListener("adamant:intro-complete", complete);};
    }, []);
    return <div ref={ref} className="capability-visual" aria-hidden="true">
        <div className="capability-static-core"><i/><i/><i/><b/></div>
        {visible && introComplete && isReady && capability === "full" && <Scene/>}
        <span className="capability-visual-label">IDEAS IN ORBIT · ONE CONNECTED SYSTEM</span>
    </div>;
}
