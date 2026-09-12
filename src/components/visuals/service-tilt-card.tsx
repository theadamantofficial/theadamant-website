"use client";
import {type ReactNode, useEffect, useRef} from "react";
import {useMotionCapability} from "@/hooks/use-motion-capability";
export default function ServiceTiltCard({children}: {children: ReactNode}) {
    const ref = useRef<HTMLElement>(null), frame = useRef(0), bounds = useRef<DOMRect | null>(null);
    const {capability} = useMotionCapability();
    const reset = () => {cancelAnimationFrame(frame.current); frame.current = 0; bounds.current = null; ref.current?.style.removeProperty("--tilt-x"); ref.current?.style.removeProperty("--tilt-y");};
    useEffect(() => () => cancelAnimationFrame(frame.current), []);
    return <article ref={ref} className="service-prism-card service-tilt-card"
        onPointerEnter={event => {if (capability === "full" && event.pointerType === "mouse") bounds.current = event.currentTarget.getBoundingClientRect();}}
        onPointerMove={event => {
            const rect = bounds.current;
            if (!rect || capability !== "full") return;
            const x = ((event.clientX - rect.left) / rect.width - .5) * 7;
            const y = ((event.clientY - rect.top) / rect.height - .5) * -7;
            cancelAnimationFrame(frame.current);
            frame.current = requestAnimationFrame(() => {frame.current = 0; ref.current?.style.setProperty("--tilt-x", String(y) + "deg"); ref.current?.style.setProperty("--tilt-y", String(x) + "deg");});
        }} onPointerLeave={reset} onPointerCancel={reset}>{children}</article>;
}
