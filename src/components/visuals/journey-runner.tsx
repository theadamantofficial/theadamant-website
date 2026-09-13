"use client";

import {useId} from "react";

/** Articulate the supplied walking artwork without replacing its face or branding. */
export default function JourneyRunner() {
    const id = useId().replace(/:/g, "");
    const artwork = <image href="/images/adamant-avatar/walking.png" width="729" height="1092"/>;
    return <svg className="journey-runner" viewBox="0 0 729 1092" aria-hidden="true" overflow="visible">
        <defs>
            <clipPath id={`${id}-left`}><path d="M260 550H376L391 750L385 1070H270Z"/></clipPath>
            <clipPath id={`${id}-right`}><path d="M373 550H477L490 950H386L369 750Z"/></clipPath>
            <clipPath id={`${id}-body`}><path d="M0 0H729V680H482L463 559H273L270 680H0Z"/></clipPath>
        </defs>
        <g className="runner-stride">
            <g className="runner-leg runner-leg-right"><g clipPath={`url(#${id}-right)`}>{artwork}</g></g>
            <g className="runner-leg runner-leg-left"><g clipPath={`url(#${id}-left)`}>{artwork}</g></g>
            <g clipPath={`url(#${id}-body)`}>{artwork}</g>
        </g>
    </svg>;
}
