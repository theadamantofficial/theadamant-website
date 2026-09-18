"use client";

import dynamic from "next/dynamic";
import {useEffect, useRef, useState} from "react";
import type {SiteCopy} from "@/lib/site-copy";
import type {SiteLocale} from "@/lib/site-locale";

const AdamantSystemSection = dynamic(() => import("@/components/experience/adamant-system-section"), {ssr: false});
const PathToSuccess = dynamic(() => import("@/components/experience/path-to-success"), {ssr: false});

function useNearViewport(margin: string) {
    const ref = useRef<HTMLDivElement>(null);
    const [isNear, setIsNear] = useState(false);
    const [hasEntered, setHasEntered] = useState(false);

    useEffect(() => {
        const node = ref.current;
        if (!node) return;
        const observer = new IntersectionObserver(([entry]) => {setIsNear(entry.isIntersecting); if(entry.isIntersecting) setHasEntered(true);}, {rootMargin: margin});
        observer.observe(node);
        return () => observer.disconnect();
    }, [margin]);

    return {ref, isNear, hasEntered};
}

export function DeferredAdamantSystem({services, locale}: {services: SiteCopy["services"]; locale: SiteLocale}) {
    const {ref, isNear} = useNearViewport("700px 0px");

    return <div ref={ref} className="min-h-[100svh] bg-[var(--bg-primary)]">
        {isNear ? <AdamantSystemSection services={services} locale={locale}/> : null}
    </div>;
}

export function DeferredPathToSuccess({locale}: {locale: SiteLocale}) {
    const {ref, hasEntered} = useNearViewport("500px 0px");

    return <div ref={ref} className="min-h-[min(880px,92svh)]">
        {hasEntered ? <PathToSuccess locale={locale}/> : null}
    </div>;
}
