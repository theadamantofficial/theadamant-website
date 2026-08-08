"use client";

import {useCallback, useEffect, useRef, useState} from "react";

const EXIT_DURATION_MS = 650;
const END_HOLD_MS = 280;
const ZOOM_START_SECONDS = 1.15;
const LEGACY_INTRO_COOKIE_NAME = "adamant_intro_seen";
const INTRO_COOKIE_NAME = "adamant_intro_seen_5m";
const INTRO_COOKIE_MAX_AGE = 60 * 5;
const DESKTOP_INTRO_QUERY = "(min-width: 1024px) and (hover: hover) and (pointer: fine)";
const LOGO_BACKGROUND = "linear-gradient(180deg, #097a80 0%, #0a7377 25%, #086b70 50%, #076366 75%, #075c5f 100%)";

export default function BrandIntroOverlay() {
    const videoRef = useRef<HTMLVideoElement>(null);
    const exitTimerRef = useRef<number | null>(null);
    const revealTimerRef = useRef<number | null>(null);
    const [isVisible, setIsVisible] = useState(false);
    const [isExiting, setIsExiting] = useState(false);
    const [isFinishing, setIsFinishing] = useState(false);
    const [isMuted, setIsMuted] = useState(false);

    const dismiss = useCallback(() => {
        if (exitTimerRef.current !== null) {
            return;
        }

        setIsExiting(true);
        exitTimerRef.current = window.setTimeout(() => {
            setIsVisible(false);
        }, EXIT_DURATION_MS);
    }, []);

    const playVideo = useCallback(() => {
        const video = videoRef.current;

        if (!video) {
            return;
        }

        void video.play().catch(() => {
            if (!video.muted) {
                video.muted = true;
                setIsMuted(true);
                void video.play().catch(dismiss);
                return;
            }

            dismiss();
        });
    }, [dismiss]);

    useEffect(() => {
        document.cookie = `${LEGACY_INTRO_COOKIE_NAME}=; path=/; max-age=0; samesite=lax`;

        const isDesktop = window.matchMedia(DESKTOP_INTRO_QUERY).matches;
        const hasSeenIntro = document.cookie
            .split(";")
            .some((cookie) => cookie.trim().startsWith(`${INTRO_COOKIE_NAME}=`));

        if (!isDesktop || hasSeenIntro) {
            return;
        }

        document.cookie = `${INTRO_COOKIE_NAME}=1; path=/; max-age=${INTRO_COOKIE_MAX_AGE}; samesite=lax`;
        setIsVisible(true);
    }, []);

    useEffect(() => {
        if (!isVisible) {
            return;
        }

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                dismiss();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        playVideo();

        return () => {
            document.body.style.overflow = previousOverflow;
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [dismiss, isVisible, playVideo]);

    useEffect(() => () => {
        if (exitTimerRef.current !== null) {
            window.clearTimeout(exitTimerRef.current);
        }

        if (revealTimerRef.current !== null) {
            window.clearTimeout(revealTimerRef.current);
        }
    }, []);

    if (!isVisible) {
        return null;
    }

    return (
        <div
            className={`fixed inset-0 z-[1000] overflow-hidden transition-[opacity,transform] ease-[cubic-bezier(0.22,1,0.36,1)] ${
                isExiting ? "scale-[1.015] opacity-0" : "scale-100 opacity-100"
            }`}
            style={{
                transitionDuration: `${EXIT_DURATION_MS}ms`,
                background: LOGO_BACKGROUND,
            }}
            role="dialog"
            aria-modal="true"
            aria-label="The Adamant opening film"
        >
            <div
                className={`absolute inset-0 will-change-transform transition-transform duration-[1150ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
                    isFinishing ? "scale-[1.12]" : "scale-100"
                }`}
                style={{background: LOGO_BACKGROUND}}
            >
                <video
                    ref={videoRef}
                    className="block h-full w-full bg-transparent object-cover object-center portrait:object-contain"
                    poster="/videos/adamant-logo-reveal-poster.jpg"
                    autoPlay
                    muted={isMuted}
                    playsInline
                    preload="auto"
                    controlsList="nodownload noplaybackrate"
                    disablePictureInPicture
                    aria-label="The Adamant logo reveal: Firm in vision, bold in action"
                    onCanPlay={playVideo}
                    onTimeUpdate={() => {
                        const video = videoRef.current;

                        if (video && video.duration - video.currentTime <= ZOOM_START_SECONDS) {
                            setIsFinishing(true);
                        }
                    }}
                    onEnded={() => {
                        setIsFinishing(true);

                        if (revealTimerRef.current === null) {
                            revealTimerRef.current = window.setTimeout(dismiss, END_HOLD_MS);
                        }
                    }}
                    onError={dismiss}
                >
                    <source src="/videos/adamant-logo-reveal.mp4" type="video/mp4"/>
                    Your browser does not support HTML5 video.
                </video>
            </div>

            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(3,28,32,0.18),transparent_22%,transparent_72%,rgba(3,28,32,0.54))]"/>

            <p className={`pointer-events-none absolute bottom-5 left-5 z-20 max-w-[70vw] text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-white/72 transition-all duration-500 sm:bottom-8 sm:left-8 sm:text-xs sm:tracking-[0.24em] ${
                isFinishing ? "translate-y-2 opacity-0" : "translate-y-0 opacity-100"
            }`}>
                Firm in vision. Bold in action.
            </p>
        </div>
    );
}
