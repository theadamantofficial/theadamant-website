"use client";

import Image from "next/image";
import type {ReactNode} from "react";
import dynamic from "next/dynamic";
const ContactMascot = dynamic(() => import("./contact-mascot"), {ssr: false});
export type MascotMood = "thinking" | "walking-tablet" | "champion" | "phone-wave" | "thumbs-up" | "waving" | "looking-back" | "idea" | "creative" | "builder";
export function SectionCharacter({mood, side = "right", className = "", interactive = false}: {mood: MascotMood; side?: "left" | "right"; className?: string; interactive?: boolean}) {
    const studioPose = mood === "creative" || mood === "builder";
    const pose = studioPose ? mood + "-guide" : mood;
    const source = studioPose
        ? "/images/adamant-character/" + pose + ".webp"
        : "/images/adamant-mascot/" + pose + "-cutout.webp";
    const classes = "section-character section-character-" + side + " mascot-pose-" + pose + " " + className;
    if (interactive) return <ContactMascot className={classes} source={source}/>;
    return <div className={classes} aria-hidden="true">
        <Image src={source} alt={`Adamant ${mood} mascot illustration`} width={studioPose ? 1184 : 1122} height={studioPose ? 1328 : 1402} quality={90}
            sizes={interactive ? "(max-width: 600px) 175px, 220px" : "(max-width: 600px) 74px, (max-width: 1000px) 110px, 156px"} className="mascot-image"/>
    </div>;
}
export function MascotHeading({mood, side, children}: {mood: MascotMood; side: "left" | "right"; children: ReactNode}) {
    return <div className={"mascot-heading mascot-heading-" + side}>
        <div className="mascot-heading-copy">{children}</div>
        <SectionCharacter mood={mood} side={side}/>
    </div>;
}
