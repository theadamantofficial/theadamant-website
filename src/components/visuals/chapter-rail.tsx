"use client";

import {useEffect, useState} from "react";

const chapters = [
    {id:"systems", label:"Systems", target:"#adamant-system"},
    {id:"services", label:"Services", target:"#services-heading"},
    {id:"process", label:"Process", target:"#process-heading"},
    {id:"faq", label:"FAQ", target:"#faq-heading"},
    {id:"journey", label:"Path", target:"#path-to-success"},
];

export default function ChapterRail() {
    const [active, setActive] = useState("hero");
    useEffect(() => {const main=document.querySelector("main");if(!main)return;const observer=new MutationObserver(()=>setActive(main.getAttribute("data-world-chapter")||"hero"));observer.observe(main,{attributes:true,attributeFilter:["data-world-chapter"]});return()=>observer.disconnect();}, []);
    return <nav className="chapter-rail" aria-label="Adamant Digital Lab chapters">{chapters.map((chapter)=><a key={chapter.id} href={chapter.target} className={active===chapter.id?"is-active":""} aria-label={`Go to ${chapter.label}`} aria-current={active===chapter.id?"step":undefined}><span>{chapter.label}</span><i/></a>)}</nav>;
}
