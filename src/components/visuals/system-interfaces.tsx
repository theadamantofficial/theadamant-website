"use client";

import {useEffect, useRef} from "react";

/** Lightweight DOM/WebGL-adjacent product layers emerging from the hero monitor. */
export default function SystemInterfaces() {
    const ref = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const node = ref.current;if (!node || !window.matchMedia("(pointer:fine)").matches) return;
        const move=(event:PointerEvent)=>{const x=(event.clientX/innerWidth-.5)*2;const y=(event.clientY/innerHeight-.5)*2;node.style.setProperty("--px",`${x}`);node.style.setProperty("--py",`${y}`);};
        window.addEventListener("pointermove",move,{passive:true});return()=>window.removeEventListener("pointermove",move);
    }, []);
    return <div ref={ref} className="system-interfaces" aria-hidden="true">
        <div className="system-screen system-screen-main"><span>ADAMANT / LAB</span><strong>Systems in motion</strong><i/><i/><i/></div>
        <div className="system-screen system-screen-side"><span>LIVE / 04</span><b>+38%</b><small>visibility</small></div>
        <div className="system-phone"><span>01</span><b>BUILD</b><i/><i/></div>
    </div>;
}
