"use client";

import {useEffect, useRef} from "react";

export default function CursorHalo() {
    const ref = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (!window.matchMedia("(pointer:fine)").matches || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        const node = ref.current;if (!node) return;
        const move=(event:PointerEvent)=>{const element=event.target as HTMLElement;const target=element?.closest("a,button,[data-cursor=interactive]") as HTMLElement|null;node.dataset.active=target?"true":"false";node.dataset.label=element?.closest(".workspace-canvas")?"DRAG":"";node.style.transform=`translate3d(${event.clientX}px,${event.clientY}px,0)`;document.querySelectorAll<HTMLElement>("[data-magnetic]").forEach((item)=>{if(item===target){const rect=item.getBoundingClientRect();item.style.transform=`translate(${(event.clientX-(rect.left+rect.width/2))*.035}px,${(event.clientY-(rect.top+rect.height/2))*.035}px)`;}else item.style.transform="";});};
        window.addEventListener("pointermove",move,{passive:true});return()=>window.removeEventListener("pointermove",move);
    }, []);
    return <div ref={ref} className="cursor-halo" aria-hidden="true"/>;
}
