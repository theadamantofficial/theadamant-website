"use client";
import dynamic from "next/dynamic";
import {useCallback, useEffect, useState} from "react";
import Image from "next/image";
const TearCover = dynamic(() => import("./tear-cover"), {ssr: false});
/** Reduced-motion visitors never download or initialize the Three.js intro. */
export default function PeelReveal() {
    const [canTear, setCanTear] = useState(false), [ready, setReady] = useState(false), [done, setDone] = useState(false);
    const finish = useCallback(() => {
        document.documentElement.dataset.introComplete = "true";
        window.dispatchEvent(new Event("adamant:intro-complete"));
        setDone(true);
    }, []);
    useEffect(() => {
        delete document.documentElement.dataset.introComplete;
        const completed = () => setDone(true), initialized = () => setReady(true);
        window.addEventListener("adamant:intro-complete", completed);
        window.addEventListener("adamant:tear-ready", initialized);
        const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
        let timer: number | undefined;
        if (reduced) timer = window.setTimeout(finish, 300);
        else setCanTear(true);
        return () => {clearTimeout(timer); window.removeEventListener("adamant:intro-complete", completed); window.removeEventListener("adamant:tear-ready", initialized);};
    }, [finish]);
    if (done) return null;
    return <>
        {!ready && <div className="peel-reveal peel-loading-cover" role="dialog" aria-modal="true" aria-label="Welcome to Adamant">
            <div className="peel-reveal-fallback" aria-hidden="true">
                <Image src="/vectors/logo-the-adamant.svg" width={80} height={80} alt=""/>
                <strong>ADAMANT®</strong><em>Firm in vision. Bold in action.</em><small>Grab anywhere. Pull to tear.</small>
            </div>
            <button className="peel-reveal-skip" type="button" onClick={finish}>Skip intro</button>
        </div>}
        {canTear && <TearCover/>}
    </>;
}
