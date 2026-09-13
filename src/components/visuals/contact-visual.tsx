"use client";

import {useEffect, useRef, useState} from "react";
import dynamic from "next/dynamic";
import Image from "next/image";

const ContactDiorama = dynamic(() => import("./contact-diorama"), {ssr: false});

export function ContactVisual() {
    const host = useRef<HTMLDivElement>(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (!host.current) return;
        const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting));
        observer.observe(host.current);
        return () => observer.disconnect();
    }, []);

    return (
        <div ref={host} className="contact-visual-3d overflow-hidden rounded-[1.75rem] border border-black/8 bg-[#edf4f1] dark:border-white/10 dark:bg-[#122326]">
            <div className="contact-visual-fallback" aria-hidden="true">
                <Image src="/images/img-contact-us-light.webp" alt="" className="h-full w-full object-cover dark:hidden" width={480} height={300} sizes="(max-width: 1024px) 100vw, 46vw"/>
                <Image src="/images/img-contact-us-dark.webp" alt="" className="hidden h-full w-full object-cover dark:block" width={480} height={300} sizes="(max-width: 1024px) 100vw, 46vw"/>
            </div>
            {visible && <ContactDiorama/>}
        </div>
    );
}
