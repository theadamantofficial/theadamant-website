"use client";

import Link from "next/link";
import Image from "next/image";
import {type CSSProperties, useCallback, useEffect, useRef, useState} from "react";
import {Volume2, VolumeX} from "lucide-react";
import {JOURNEY_CHALLENGES} from "@/components/experience/journey-data";
import {getLocalizedPath, SiteLocale} from "@/lib/site-locale";
import {useMotionCapability} from "@/hooks/use-motion-capability";
import JourneyRunner from "@/components/visuals/journey-runner";

type JourneyMode = "intro" | "playing" | "blocked" | "transforming" | "success";
type JourneyPosition = {x: number; z: number};
const STOPS = [10, 22, 35, 49, 64, 80];

export default function PathToSuccess({locale}: {locale: SiteLocale}) {
    const shellRef = useRef<HTMLElement>(null);
    const positionRef = useRef<JourneyPosition>({x: 0, z: 0});
    const characterRef = useRef<HTMLDivElement>(null);
    const velocityRef = useRef<JourneyPosition>({x: 0, z: 0});
    const keysRef = useRef(new Set<string>());
    const timerRef = useRef<number | null>(null);
    const startTimerRef = useRef<number | null>(null);
    const wakeRef = useRef<(() => void) | null>(null);
    const {capability} = useMotionCapability();
    const [mode, setMode] = useState<JourneyMode>("intro");
    const [challengeIndex, setChallengeIndex] = useState(0);
    const [businessProgress, setBusinessProgress] = useState(10);
    const [soundOn, setSoundOn] = useState(false);
    const [isInViewport, setIsInViewport] = useState(false);
    const challenge = JOURNEY_CHALLENGES[challengeIndex];

    useEffect(() => {
        const shell = shellRef.current;
        if (!shell) return;
        const observer = new IntersectionObserver(([entry]) => setIsInViewport(entry.isIntersecting), {
            rootMargin: "0px",
        });
        observer.observe(shell);
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        if (mode !== "success" || !soundOn) return;
        const context = new AudioContext();
        const master = context.createGain();
        master.gain.setValueAtTime(.055, context.currentTime);
        master.connect(context.destination);
        const notes = [261.63, 329.63, 392, 523.25, 392, 493.88];
        notes.forEach((frequency, index) => {
            const oscillator = context.createOscillator();
            const gain = context.createGain();
            const start = context.currentTime + index * .22;
            oscillator.type = "sine";
            oscillator.frequency.value = frequency;
            gain.gain.setValueAtTime(0, start);
            gain.gain.linearRampToValueAtTime(.6, start + .025);
            gain.gain.exponentialRampToValueAtTime(.001, start + .38);
            oscillator.connect(gain).connect(master);
            oscillator.start(start);
            oscillator.stop(start + .4);
        });
        return () => {void context.close();};
    }, [mode, soundOn]);

    const updatePosition = useCallback((next: JourneyPosition) => {
        positionRef.current = next;
        shellRef.current?.style.setProperty("--journey-z", String(next.z));
        characterRef.current?.style.setProperty("--player-x", String(next.x));
    }, []);
    const dispatchWorld = useCallback((nextMode: JourneyMode, index: number, progress: number) => {
        window.dispatchEvent(new CustomEvent("adamant:journey", {detail: {mode: nextMode, index, progress}}));
    }, []);
    const start = useCallback(() => {
        if (timerRef.current) window.clearTimeout(timerRef.current);
        setMode("playing"); setChallengeIndex(0); setBusinessProgress(10);
        updatePosition({x: 0, z: 0}); velocityRef.current = {x: 0, z: 0};
        dispatchWorld("playing", 0, 10);
        const shell = shellRef.current;
        if (startTimerRef.current) window.clearTimeout(startTimerRef.current);
        startTimerRef.current = window.setTimeout(() => {
            if (!shell) return;
            const rect = shell.getBoundingClientRect();
            const top = window.scrollY + rect.top - Math.max(0, (innerHeight - rect.height) / 2);
            window.scrollTo({top, behavior: "smooth"});
            shell.focus({preventScroll: true});
        }, 40);
    }, [dispatchWorld, updatePosition]);
    const skip = useCallback(() => {
        if (mode === "success") {
            document.querySelector(".footer-content-world")?.scrollIntoView({behavior: "smooth", block: "start"});
            return;
        }
        setMode("success"); setChallengeIndex(JOURNEY_CHALLENGES.length - 1); setBusinessProgress(100);
        updatePosition({x: 0, z: 86});
        dispatchWorld("success", JOURNEY_CHALLENGES.length - 1, 100);
    }, [dispatchWorld, mode, updatePosition]);
    const activate = useCallback(() => {
        if (mode !== "blocked") return;
        setMode("transforming");
        dispatchWorld("transforming", challengeIndex, businessProgress);
        timerRef.current = window.setTimeout(() => {
            const solved = JOURNEY_CHALLENGES[challengeIndex];
            setBusinessProgress(solved.progress);
            if (challengeIndex === JOURNEY_CHALLENGES.length - 1) {
                setMode("success"); updatePosition({x: 0, z: 86});
                dispatchWorld("success", challengeIndex, 100);
                return;
            }
            setChallengeIndex(challengeIndex + 1);
            updatePosition({x: 0, z: STOPS[challengeIndex] + 2});
            setMode("playing");
            dispatchWorld("playing", challengeIndex + 1, solved.progress);
        }, 1650);
    }, [businessProgress, challengeIndex, dispatchWorld, mode, updatePosition]);

    useEffect(() => {
        if (!isInViewport) return;
        const isActive = () => {
            const rect = shellRef.current?.getBoundingClientRect();
            return Boolean(rect && rect.top < innerHeight * .8 && rect.bottom > innerHeight * .2);
        };
        const down = (event: KeyboardEvent) => {
            const key = event.key.toLowerCase();
            if (!isActive() || mode === "intro" || mode === "success") return;
            if (!["arrowup", "arrowdown", "arrowleft", "arrowright", "w", "a", "s", "d", " "].includes(key)) return;
            event.preventDefault();
            if (key === " ") activate();
            else if (mode === "playing") {keysRef.current.add(key); wakeRef.current?.();}
        };
        const up = (event: KeyboardEvent) => {keysRef.current.delete(event.key.toLowerCase()); if (!keysRef.current.size) shellRef.current?.classList.remove("is-moving");};
        const blur = () => {keysRef.current.clear(); velocityRef.current = {x:0,z:0}; shellRef.current?.classList.remove("is-moving");};
        window.addEventListener("keydown", down); window.addEventListener("keyup", up); window.addEventListener("blur", blur);
        return () => {window.removeEventListener("keydown", down); window.removeEventListener("keyup", up); window.removeEventListener("blur", blur); blur();};
    }, [activate, isInViewport, mode]);

    useEffect(() => {
        if (mode !== "playing" || !isInViewport) return;
        const shell = shellRef.current;
        let frame = 0; let last = performance.now();
        const update = (time: number) => {
            frame = 0;
            if (document.hidden) return;
            const delta = Math.min((time - last) / 1000, .04); last = time;
            const keys = keysRef.current;
            const targetX = (keys.has("arrowright") || keys.has("d") ? 1 : 0) - (keys.has("arrowleft") || keys.has("a") ? 1 : 0);
            const targetZ = (keys.has("arrowup") || keys.has("w") ? 1 : 0) - (keys.has("arrowdown") || keys.has("s") ? .45 : 0);
            velocityRef.current.x += (targetX * 3.2 - velocityRef.current.x) * (1 - Math.exp(-delta * 8));
            velocityRef.current.z += (targetZ * 2.35 - velocityRef.current.z) * (1 - Math.exp(-delta * 7));
            shell?.classList.toggle("is-moving", Math.abs(velocityRef.current.x) + Math.abs(velocityRef.current.z) > .16);
            const previousStop = challengeIndex === 0 ? 0 : STOPS[challengeIndex - 1] + 2;
            const next = {x: Math.max(-3, Math.min(3, positionRef.current.x + velocityRef.current.x * delta)), z: Math.max(previousStop, positionRef.current.z + velocityRef.current.z * delta)};
            if (next.z >= STOPS[challengeIndex]) {
                next.z = STOPS[challengeIndex]; velocityRef.current = {x: 0, z: 0}; keysRef.current.clear(); shell?.classList.remove("is-moving");
                setMode("blocked"); dispatchWorld("blocked", challengeIndex, businessProgress);
                updatePosition(next);
                return;
            }
            updatePosition(next);
            if (keys.size || Math.abs(velocityRef.current.x) + Math.abs(velocityRef.current.z) > .01) frame = requestAnimationFrame(update);
        };
        const wake = () => {if (!frame && !document.hidden) {last = performance.now(); frame = requestAnimationFrame(update);}};
        const pause = () => {if (document.hidden) {cancelAnimationFrame(frame); frame = 0; keysRef.current.clear(); velocityRef.current={x:0,z:0}; shell?.classList.remove("is-moving");}};
        wakeRef.current = wake;
        document.addEventListener("visibilitychange", pause);
        return () => {cancelAnimationFrame(frame); wakeRef.current=null; keysRef.current.clear(); velocityRef.current={x:0,z:0}; document.removeEventListener("visibilitychange",pause); shell?.classList.remove("is-moving");};
    }, [businessProgress, challengeIndex, dispatchWorld, isInViewport, mode, updatePosition]);

    useEffect(() => () => {
        if (timerRef.current) window.clearTimeout(timerRef.current);
        if (startTimerRef.current) window.clearTimeout(startTimerRef.current);
        window.dispatchEvent(new CustomEvent("adamant:journey", {detail: {mode: "intro", index: 0, progress: 0}}));
    }, []);

    const hold = (key: string, active: boolean) => {
        if (active && mode === "playing") {keysRef.current.add(key); wakeRef.current?.();}
        else {keysRef.current.delete(key); if (!keysRef.current.size) shellRef.current?.classList.remove("is-moving");}
    };
    const release = (key: string) => () => hold(key, false);
    const playerStyle = {"--player-x": 0, "--player-z": 0} as CSSProperties;

return <section ref={shellRef} id="path-to-success" className={`journey-shell journey-${mode}`} aria-label="The Path to Success interactive business journey" data-motion={capability} data-motion-active={isInViewport && capability !== "reduced"} data-challenge={challenge.kind} style={{"--journey-z": 0} as CSSProperties} tabIndex={-1}>
        <h2 className="sr-only">The Path to Success</h2>
        <div className="journey-vignette" aria-hidden="true"/>
        <div className="journey-road" aria-hidden="true"><i/><i/><i/><i/><i/><i/><i/></div>
        <div className="journey-environment" aria-hidden="true">
            <div className="journey-architecture architecture-left"/><div className="journey-architecture architecture-right"/>
            <div className="journey-city journey-city-left"><i/><i/><i/><i/><i/><i/></div>
            <div className="journey-city journey-city-right"><i/><i/><i/><i/><i/><i/></div>
            <div className="journey-milestones"><span>IDEA</span><span>BUILD</span><span>GROW</span><span>SCALE</span></div>
            <div className="journey-flow-markers"><i/><i/><i/><i/><i/><i/><i/><i/></div>
            <div className="journey-next-check"><span>NEXT SYSTEM CHECK</span><b>{challenge.kind === "connected" ? "CONNECTED ARCHITECTURE" : `${challenge.kind.toUpperCase()} EXPERIENCE`}</b></div>
            <ChallengeVisual kind={challenge.kind}/>
        </div>
            <div ref={characterRef} className="journey-character" style={playerStyle} aria-hidden="true">
                {mode === "success" ? <Image src="/images/adamant-mascot/champion-cutout.webp" alt="Adamant mascot celebrating business growth" fill sizes="(max-width: 800px) 110px, 150px" quality={90} className="journey-character-image"/> : <JourneyRunner/>}
            </div>
            <div className="journey-success-car"><Image src="/images/adamant-avatar/roadster.webp" alt="Adamant business growth roadster illustration" fill sizes="(max-width: 800px) 320px, 600px"/></div>
        <div className="journey-hud"><span>ADAMANT SYSTEM <i/> ONLINE</span><strong>BUSINESS PROGRESS <b>{businessProgress}%</b></strong><div><i style={{width: `${businessProgress}%`}}/></div></div>
        {mode === "intro" && <div className="journey-panel journey-intro"><p>THE PATH TO SUCCESS</p><h3>Your path to <em>growth.</em></h3><span>Every business starts with an idea. What happens next depends on the systems behind it.</span><button data-magnetic className="button-primary" onClick={start}>Start journey →</button><small>Use arrow keys or W A S D to move.</small></div>}
        {(mode === "blocked" || mode === "transforming") && <div className="journey-panel journey-challenge" role="status" aria-live="polite"><p>{mode === "transforming" ? "ADAMANT SYSTEM · REORGANISING" : "ADAMANT SYSTEM · ANALYSING"}</p><h3>{mode === "transforming" ? challenge.result : challenge.title}</h3><span>{mode === "transforming" ? challenge.capabilities.join(" · ") : challenge.problem}</span>{mode === "blocked" && <><small>{challenge.diagnosis}</small><button className="button-primary" data-magnetic onClick={activate}>Activate Adamant <kbd>Space</kbd></button></>}</div>}
        {mode === "success" && <div className="journey-panel journey-success"><p>100% · CONNECTED BUSINESS</p><h3>From idea.<br/>To system.<br/><em>To growth.</em></h3><span>ADAMANT® — Firm in vision. Bold in action.</span><div><Link data-magnetic className="button-primary" href={getLocalizedPath(locale, "contact")}>Build your path →</Link><button className="button-secondary" onClick={start}>Replay journey</button></div></div>}
        <button className="journey-sound" type="button" onClick={() => setSoundOn((value) => !value)} aria-label={soundOn ? "Mute journey melody" : "Enable journey melody"} aria-pressed={soundOn}>{soundOn ? <Volume2 size={16}/> : <VolumeX size={16}/>}<span>{soundOn ? "MELODY ON" : "MELODY OFF"}</span></button>
        {mode !== "intro" && mode !== "success" && <div className="journey-controls" aria-label="Journey movement controls"><button aria-label="Move forward" onPointerDown={() => hold("w", true)} onPointerUp={release("w")} onPointerCancel={release("w")} onPointerLeave={release("w")}>↑</button><button aria-label="Move left" onPointerDown={() => hold("a", true)} onPointerUp={release("a")} onPointerCancel={release("a")} onPointerLeave={release("a")}>←</button><button aria-label="Move backwards" onPointerDown={() => hold("s", true)} onPointerUp={release("s")} onPointerCancel={release("s")} onPointerLeave={release("s")}>↓</button><button aria-label="Move right" onPointerDown={() => hold("d", true)} onPointerUp={release("d")} onPointerCancel={release("d")} onPointerLeave={release("d")}>→</button></div>}
        <button className="journey-skip" onClick={skip}>{mode === "success" ? "Continue to footer" : "Skip experience"}</button>
    </section>;
}

function ChallengeVisual({kind}: {kind: string}) {
    return <div className={`challenge-visual challenge-${kind}`} aria-hidden="true"><div className="challenge-primary"/><div className="challenge-secondary"/><div className="challenge-tertiary"/><span/><span/><span/><span/><span/><span/></div>;
}
