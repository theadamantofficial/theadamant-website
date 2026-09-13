"use client";

import Image from "next/image";
import type {ReactNode, PointerEvent as ReactPointerEvent} from "react";
import {useRef} from "react";
export type MascotMood = "thinking" | "walking-tablet" | "champion" | "phone-wave" | "thumbs-up" | "waving" | "looking-back" | "idea" | "creative" | "builder";
export function SectionCharacter({mood, side = "right", className = "", interactive = false}: {mood: MascotMood; side?: "left" | "right"; className?: string; interactive?: boolean}) {
    const studioPose = mood === "creative" || mood === "builder";
    const pose = studioPose ? mood + "-guide" : mood;
    const source = studioPose
        ? "/images/adamant-character/" + pose + ".webp"
        : "/images/adamant-mascot/" + pose + "-cutout.webp";
    const start = useRef({x: 0, rotation: 0});
    const rotate = useRef(0);
    const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
        if (!interactive) return;
        start.current = {x: event.clientX, rotation: rotate.current};
        event.currentTarget.setPointerCapture(event.pointerId);
        event.currentTarget.dataset.dragging = "true";
    };
    const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
        if (!interactive || !event.currentTarget.hasPointerCapture(event.pointerId)) return;
        rotate.current = start.current.rotation + (event.clientX - start.current.x) * .65;
        event.currentTarget.style.setProperty("--mascot-rotate-y", rotate.current + "deg");
    };
    const onPointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
        if (!interactive) return;
        if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
        event.currentTarget.dataset.dragging = "false";
    };
    return <div className={"section-character section-character-" + side + " mascot-pose-" + pose + " " + className} aria-hidden="true"
        onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={onPointerUp}>
        <Image src={source} alt="" width={studioPose ? 1184 : 1122} height={studioPose ? 1328 : 1402} quality={90}
            sizes={interactive ? "(max-width: 600px) 175px, 220px" : "(max-width: 600px) 74px, (max-width: 1000px) 110px, 156px"} className="mascot-image"/>
    </div>;
}
export function MascotHeading({mood, side, children}: {mood: MascotMood; side: "left" | "right"; children: ReactNode}) {
    return <div className={"mascot-heading mascot-heading-" + side}>
        <div className="mascot-heading-copy">{children}</div>
        <SectionCharacter mood={mood} side={side}/>
    </div>;
}
