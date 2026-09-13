"use client";

import Image from "next/image";
import {useId} from "react";

/** The first paint uses the same proportions and lettering as the cloth texture. */
export default function IntroCoverArt() {
    const lightingId = useId();
    return <div className="peel-reveal-fallback" aria-hidden="true" style={{filter: `url(#${lightingId})`}}>
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <filter id={lightingId} x="0" y="0" width="100%" height="100%" colorInterpolationFilters="linearRGB">
                    <feComponentTransfer>
                        <feFuncR type="linear" slope=".665"/>
                        <feFuncG type="linear" slope=".642"/>
                        <feFuncB type="linear" slope=".611"/>
                    </feComponentTransfer>
                </filter>
            </defs>
            <rect x="6vmin" y="6vmin" width="calc(100% - 12vmin)" height="calc(100% - 12vmin)" fill="none" stroke="#1f45432e"/>
            <text x="8.4vmin" y="9.6vmin" fill="#274541" style={{font: "500 1.6vmin monospace"}}>ADAMANT® / CREATIVE TECHNOLOGY</text>
            <text x="calc(100% - 8.4vmin)" y="calc(100% - 7.8vmin)" textAnchor="end" fill="#274541" style={{font: "500 1.6vmin monospace"}}>MADE TO MAKE AN IMPRESSION</text>
            <svg x="84%" y="23%" overflow="visible">
                <g transform="rotate(-11.459)">
                    <circle r="7.4vmin" fill="none" stroke="#c9633d" strokeWidth=".3vmin"/>
                    <text textAnchor="middle" fill="#c9633d" style={{font: "600 1.6vmin monospace"}}>
                        <tspan x="0" y="-.6vmin">BREAK</tspan>
                        <tspan x="0" y="1.7vmin">THE ORDINARY</tspan>
                    </text>
                </g>
            </svg>
            <text x="50%" y="50%" textAnchor="middle" fill="#183c39" style={{font: "800 min(14.5vw, 18vmin) Arial, sans-serif"}}>ADAMANT</text>
            <text x="50%" y="59%" textAnchor="middle" fill="#bd613c" style={{font: "italic 5.3vmin Georgia, serif"}}>Firm in vision. Bold in action.</text>
            <text x="50%" y="77%" textAnchor="middle" fill="#274541" style={{font: "500 1.9vmin monospace"}}>GRAB ANYWHERE. PULL TO TEAR.</text>
        </svg>
        <Image className="peel-reveal-logo" src="/vectors/logo-the-adamant.svg" width={80} height={80} alt="" priority/>
    </div>;
}
