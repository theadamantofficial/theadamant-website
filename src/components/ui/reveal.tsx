"use client";
import {type HTMLAttributes, type ReactNode, type CSSProperties, useEffect, useRef} from "react";
import {cn} from "@/lib/utils";
type Props = HTMLAttributes<HTMLDivElement> & {children: ReactNode; delay?: number};
/** One-shot native transforms; no scroll subscriptions per card. */
export function Reveal({children, className, delay = 0, style, ...props}: Props) {
    const ref = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const node = ref.current;
        if (!node || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        let observer: IntersectionObserver | undefined;
        const observe = () => {
            observer?.disconnect();
            observer = new IntersectionObserver(([entry]) => {
                if (!entry.isIntersecting) return;
                node.dataset.arrived = "true";
                observer?.disconnect();
            }, {threshold: .08});
            observer.observe(node);
        };
        if (!document.querySelector(".peel-reveal")) observe();
        window.addEventListener("adamant:intro-complete", observe, {once: true});
        return () => {observer?.disconnect(); window.removeEventListener("adamant:intro-complete", observe);};
    }, []);
    return <div ref={ref} className={cn("native-reveal", className)} style={{"--reveal-delay": String(delay) + "s", ...style} as CSSProperties} {...props}>{children}</div>;
}
export function StaggerGroup({children, className, ...props}: Props) {
    return <Reveal className={cn("native-stagger", className)} {...props}>{children}</Reveal>;
}
export function StaggerItem({children, className, delay: _delay, ...props}: Props) {
    void _delay;
    return <div className={cn("native-stagger-item", className)} {...props}>{children}</div>;
}
