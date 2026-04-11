"use client";

import dynamic from "next/dynamic";
import {useEffect, useState} from "react";
import {cn} from "@/lib/utils";

const DotLottieReact = dynamic(
    () => import("@lottiefiles/dotlottie-react").then((module) => module.DotLottieReact),
    {
        ssr: false,
        loading: () => (
            <div className="h-full w-full animate-pulse rounded-[inherit] bg-[radial-gradient(circle_at_center,rgba(13,92,99,0.16),rgba(214,106,69,0.08)_44%,transparent_72%)] dark:bg-[radial-gradient(circle_at_center,rgba(88,183,179,0.2),rgba(238,141,108,0.08)_44%,transparent_72%)]"/>
        ),
    },
);

type LoadingAnimationProps = {
    className?: string;
    animationClassName?: string;
    speed?: number;
};

type LoadingStateProps = {
    title: string;
    description?: string;
    className?: string;
    align?: "center" | "start";
    size?: "sm" | "md" | "lg";
};

const animationSizeClasses = {
    sm: "w-28 sm:w-32",
    md: "w-36 sm:w-40",
    lg: "w-48 sm:w-56",
};

export function LoadingAnimation({
    className,
    animationClassName,
    speed = 1.08,
}: LoadingAnimationProps) {
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        const rootElement = document.documentElement;
        const syncTheme = () => setIsDark(rootElement.classList.contains("dark"));

        syncTheme();

        const observer = new MutationObserver(syncTheme);
        observer.observe(rootElement, {
            attributes: true,
            attributeFilter: ["class"],
        });

        return () => observer.disconnect();
    }, []);

    return (
        <div
            className={cn(
                "relative overflow-hidden rounded-[1.75rem] border border-black/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.9),rgba(234,223,206,0.72))] p-2 shadow-[0_24px_70px_-42px_rgba(15,23,42,0.35)] dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(21,24,26,0.98),rgba(15,18,20,0.94))] dark:shadow-[0_28px_90px_-54px_rgba(0,0,0,0.72)]",
                className,
            )}
            aria-hidden="true"
        >
            <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(13,92,99,0.28),transparent)] dark:bg-[linear-gradient(90deg,transparent,rgba(88,183,179,0.32),transparent)]"/>
            <div
                className={cn(
                    "relative aspect-[10/7] w-full overflow-hidden rounded-[1.2rem] bg-[radial-gradient(circle_at_center,rgba(13,92,99,0.12),transparent_62%)] dark:bg-[radial-gradient(circle_at_center,rgba(88,183,179,0.14),transparent_62%)]",
                    animationClassName,
                )}
            >
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(214,106,69,0.08),transparent_48%)] dark:bg-[radial-gradient(circle_at_top,rgba(238,141,108,0.08),transparent_48%)]"/>
                <DotLottieReact
                    className="relative h-full w-full"
                    src={isDark ? "/animations/loading-webpage-dark.json" : "/animations/loading-webpage-light.json"}
                    autoplay
                    loop
                    speed={speed}
                    useFrameInterpolation={false}
                    renderConfig={{
                        autoResize: true,
                        devicePixelRatio: 1,
                    }}
                />
            </div>
        </div>
    );
}

export function LoadingState({
    title,
    description,
    className,
    align = "center",
    size = "md",
}: LoadingStateProps) {
    return (
        <div
            className={cn(
                "flex flex-col gap-5",
                align === "center" ? "items-center text-center" : "items-start text-left",
                className,
            )}
        >
            <LoadingAnimation className={animationSizeClasses[size]}/>
            <div className="space-y-2">
                <h2 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
                    {title}
                </h2>
                {description ? (
                    <p className="max-w-md text-sm leading-6 text-foreground/70 sm:text-[0.95rem]">
                        {description}
                    </p>
                ) : null}
            </div>
        </div>
    );
}
