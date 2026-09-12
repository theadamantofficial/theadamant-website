"use client";

import {useEffect, useRef} from "react";

export default function CursorHalo() {
    const ref = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (!window.matchMedia("(pointer:fine)").matches || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        const node = ref.current;if (!node) return;let x=0,y=0,tx=0,ty=0,frame=0;
        const move=(event:PointerEvent)=>{tx=event.clientX;ty=event.clientY;const element=event.target as HTMLElement;const target=element?.closest("a,button,[data-cursor=interactive]") as HTMLElement|null;node.dataset.active=target?"true":"false";node.dataset.label=element?.closest(".workspace-canvas")?"DRAG":"";document.querySelectorAll<HTMLElement>("[data-magnetic]").forEach((item)=>{if(item===target){const rect=item.getBoundingClientRect();item.style.transform=`translate(${(event.clientX-(rect.left+rect.width/2))*.035}px,${(event.clientY-(rect.top+rect.height/2))*.035}px)`;}else item.style.transform="";});};
        const render=()=>{frame=requestAnimationFrame(render);x+=(tx-x)*.16;y+=(ty-y)*.16;node.style.transform=`translate3d(${x}px,${y}px,0)`;};
        window.addEventListener("pointermove",move,{passive:true});frame=requestAnimationFrame(render);return()=>{cancelAnimationFrame(frame);window.removeEventListener("pointermove",move);};
    }, []);
    return <div ref={ref} className="cursor-halo" aria-hidden="true"/>;
}
