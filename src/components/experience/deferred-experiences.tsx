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

    useEffect(() => {
        const node = ref.current;
        if (!node) return;
        const observer = new IntersectionObserver(([entry]) => setIsNear(entry.isIntersecting), {rootMargin: margin});
        observer.observe(node);
        return () => observer.disconnect();
    }, [margin]);

    return {ref, isNear};
}

export function DeferredAdamantSystem({services}: {services: SiteCopy["services"]}) {
    const {ref, isNear} = useNearViewport("700px 0px");

    return <div ref={ref} className="min-h-[100svh] bg-[var(--bg-primary)]">
        {isNear ? <AdamantSystemSection services={services}/> : null}
    </div>;
}

export function DeferredPathToSuccess({locale}: {locale: SiteLocale}) {
    const {ref, isNear} = useNearViewport("500px 0px");

    return <div ref={ref} className="min-h-[min(880px,92svh)]">
        {isNear ? <PathToSuccess locale={locale}/> : null}
    </div>;
}
