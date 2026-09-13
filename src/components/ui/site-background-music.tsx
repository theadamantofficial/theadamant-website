"use client";

import {useEffect, useRef, useState} from "react";
import {usePathname} from "next/navigation";
import {Volume2, VolumeX} from "lucide-react";

export default function SiteBackgroundMusic({src, title}: {src: string; title: string}) {
    const pathname = usePathname();
    const excluded = /(?:^|\/)admin(?:\/|$)|^\/tear-preview/.test(pathname);
    const audioRef = useRef<HTMLAudioElement>(null);
    const resumeRef = useRef(false);
    const [playing, setPlaying] = useState(false);
    const [failed, setFailed] = useState(false);
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;
        audio.volume = .7;
        if (excluded) {audio.pause(); return;}
        document.body.dataset.backgroundMusic = "true";
        const play = () => {void audio.play().catch(() => {});};
        const startOnInteraction = (event: Event) => {
            if (!event.isTrusted) return;
            if (event.target instanceof Element && event.target.closest(".site-music-toggle")) return;
            try {if (localStorage.getItem("adamant:music") === "off") return;} catch { /* Preferences are optional. */ }
            play();
        };
        const started = () => {
            window.removeEventListener("pointerdown", startOnInteraction);
            window.removeEventListener("keydown", startOnInteraction);
        };
        const visibility = () => {
            if (document.hidden) {resumeRef.current = !audio.paused; audio.pause();}
            else if (resumeRef.current) {resumeRef.current = false; play();}
        };
        window.addEventListener("pointerdown", startOnInteraction);
        window.addEventListener("keydown", startOnInteraction);
        audio.addEventListener("play", started);
        document.addEventListener("visibilitychange", visibility);
        return () => {
            delete document.body.dataset.backgroundMusic;
            audio.pause(); resumeRef.current = false;
            window.removeEventListener("pointerdown", startOnInteraction);
            window.removeEventListener("keydown", startOnInteraction);
            audio.removeEventListener("play", started);
            document.removeEventListener("visibilitychange", visibility);
        };
    }, [excluded, src]);
    const toggle = () => {
        const audio = audioRef.current;
        if (!audio) return;
        const enabled = audio.paused;
        try {localStorage.setItem("adamant:music", enabled ? "on" : "off");} catch { /* Preferences are optional. */ }
        if (enabled) void audio.play().catch(() => {});
        else {resumeRef.current = false; audio.pause();}
    };
    return <>
        <audio ref={audioRef} src={src} loop preload="none" onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onError={() => setFailed(true)}/>
        {!excluded && !failed && <button className="site-music-toggle" type="button" aria-label={playing ? "Mute background music" : "Play background music"} aria-pressed={playing} title={title} onClick={toggle}>
            {playing ? <Volume2 size={15}/> : <VolumeX size={15}/>}<span>Music {playing ? "on" : "off"}</span>
        </button>}
    </>;
}
