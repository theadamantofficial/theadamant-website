"use client";
import dynamic from "next/dynamic";
import {useCallback, useEffect, useState} from "react";
import IntroCoverArt from "./intro-cover-art";
import {hasRecentIntroCompletion, recordIntroCompletion} from "@/lib/intro-frequency";
const TearCover = dynamic(() => import("./tear-cover"), {ssr: false});
/** Direct section links and reduced-motion visitors never initialize the Three.js intro. */
export default function PeelReveal({alwaysShow = false}: {alwaysShow?: boolean}) {
    const [checkedEntry, setCheckedEntry] = useState(false);
    const [canTear, setCanTear] = useState(false), [ready, setReady] = useState(false), [done, setDone] = useState(false);
    const complete = useCallback((remember: boolean) => {
        if (remember) recordIntroCompletion(window.localStorage);
        document.documentElement.dataset.introComplete = "true";
        window.dispatchEvent(new Event("adamant:intro-complete"));
        setDone(true);
    }, []);
    const finish = useCallback(() => complete(!alwaysShow), [alwaysShow, complete]);
    const bypass = useCallback(() => complete(false), [complete]);
    useEffect(() => {
        // URL fragments are only available in the browser. Decide before mounting
        // either cover so section links never flash the intro or lock scrolling.
        if (window.location.hash) {
            bypass();
            return;
        }
        if (!alwaysShow && hasRecentIntroCompletion(window.localStorage)) {
            bypass();
            return;
        }
        setCheckedEntry(true);
        delete document.documentElement.dataset.introComplete;
        const completed = () => setDone(true), initialized = () => setReady(true);
        window.addEventListener("adamant:intro-complete", completed);
        window.addEventListener("adamant:tear-ready", initialized);
        const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
        let timer: number | undefined;
        if (reduced) timer = window.setTimeout(finish, 300);
        else setCanTear(true);
        return () => {clearTimeout(timer); window.removeEventListener("adamant:intro-complete", completed); window.removeEventListener("adamant:tear-ready", initialized);};
    }, [alwaysShow, bypass, finish]);
    if (!checkedEntry || done) return null;
    return <>
        {!ready && <div className="peel-reveal peel-loading-cover" role="dialog" aria-modal="true" aria-label="Welcome to Adamant">
            <IntroCoverArt/>
            <button className="peel-reveal-skip" type="button" onClick={finish}>Skip intro</button>
        </div>}
        {canTear && <TearCover rememberCompletion={!alwaysShow}/>}
    </>;
}
