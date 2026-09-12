import Image from "next/image";
import type {ReactNode} from "react";
export type MascotMood = "thinking" | "walking-tablet" | "champion" | "phone-wave" | "thumbs-up" | "waving" | "looking-back" | "idea" | "creative" | "builder";
export function SectionCharacter({mood, side = "right"}: {mood: MascotMood; side?: "left" | "right"}) {
    const pose = mood === "creative" ? "idea" : mood === "builder" ? "walking-tablet" : mood;
    return <div className={"section-character section-character-" + side + " mascot-pose-" + pose} aria-hidden="true">
        <Image src={"/images/adamant-mascot/" + pose + ".webp"} alt="" width={420} height={525}
            sizes="(max-width: 600px) 74px, (max-width: 1000px) 110px, 156px" className="mascot-image"/>
    </div>;
}
export function MascotHeading({mood, side, children}: {mood: MascotMood; side: "left" | "right"; children: ReactNode}) {
    return <div className={"mascot-heading mascot-heading-" + side}>
        <div className="mascot-heading-copy">{children}</div>
        <SectionCharacter mood={mood} side={side}/>
    </div>;
}
