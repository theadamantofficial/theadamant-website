import Image from "next/image";

export function SectionCharacter({mood, side = "right"}: {mood: "creative" | "builder"; side?: "left" | "right"}) {
    const src = mood === "creative"
        ? "/images/adamant-character/creative-guide.webp"
        : "/images/adamant-character/builder-guide.webp";

    return <div className={`section-character section-character-${side} section-character-${mood}`} aria-hidden="true">
        <Image src={src} alt="" fill sizes="(max-width: 1100px) 130px, 220px" className="object-contain"/>
    </div>;
}
