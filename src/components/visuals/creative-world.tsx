"use client";

import {useEffect, useRef} from "react";
import * as THREE from "three";
import {getDeviceQuality, getMaxDpr} from "@/lib/device-quality";

/** One persistent 3D thread runs behind the full homepage. Chapters transform as the page scrolls. */
export default function CreativeWorld() {
    const hostRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const host = hostRef.current;
        const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const mobileLayout = window.matchMedia("(max-width: 900px)").matches || window.matchMedia("(pointer: coarse)").matches;
        if (!host || reducedMotion) return;
        const quality = getDeviceQuality();
        const lightweight = mobileLayout || quality === "low";
        let renderer: THREE.WebGLRenderer;
        try {
            renderer = new THREE.WebGLRenderer({
                alpha: true,
                antialias: !lightweight,
                powerPreference: lightweight ? "low-power" : "high-performance",
            });
        } catch { return; }
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, getMaxDpr(quality), lightweight ? 1 : 1.5));
        renderer.toneMapping = lightweight ? THREE.NoToneMapping : THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = lightweight ? 1 : 1.1;
        host.appendChild(renderer.domElement);
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(33, 1, .1, 80);
        camera.position.set(0, 0, 8);
        const root = new THREE.Group(); scene.add(root);
        scene.add(new THREE.HemisphereLight(0xd9ffff, 0x1c3046, 2.8));
        const key = new THREE.PointLight(0xffc093, 5, 12); key.position.set(-3, 2, 4); scene.add(key);
        const rim = new THREE.PointLight(0x62d5ce, 4, 12); rim.position.set(4, -2, 2); scene.add(rim);
        const teal = new THREE.MeshPhysicalMaterial({color: 0x167f82, roughness: .28, metalness: .65, clearcoat: 1});
        const copper = new THREE.MeshPhysicalMaterial({color: 0xe8895c, roughness: .26, metalness: .62, clearcoat: 1});
        const cream = new THREE.MeshPhysicalMaterial({color: 0xe7deca, roughness: .48, metalness: .12});
        const lineMaterial = new THREE.MeshBasicMaterial({color: 0x69b9b1, transparent: true, opacity: .58});
        const geometries: THREE.BufferGeometry[] = []; const materials: THREE.Material[] = [teal, copper, cream, lineMaterial];
        const makeMesh = (geometry: THREE.BufferGeometry, material: THREE.Material) => {geometries.push(geometry);const mesh = new THREE.Mesh(geometry, material);root.add(mesh);return mesh;};
        const makePart = (geometry: THREE.BufferGeometry, material: THREE.Material, parent: THREE.Object3D, position: [number, number, number]) => {geometries.push(geometry);const mesh = new THREE.Mesh(geometry, material);mesh.position.set(...position);parent.add(mesh);return mesh;};
        const orb = makeMesh(new THREE.IcosahedronGeometry(.54, lightweight ? 1 : 2), teal);
        const loop = makeMesh(new THREE.TorusGeometry(1.03, .018, 6, lightweight ? 40 : 80), lineMaterial); loop.rotation.x = .72;
        const knot = makeMesh(new THREE.TorusKnotGeometry(.38, .11, lightweight ? 32 : 64, lightweight ? 6 : 10), copper);
        const seed = makeMesh(new THREE.SphereGeometry(.15, lightweight ? 10 : 18, lightweight ? 8 : 12), cream);
        const path = new THREE.CatmullRomCurve3([new THREE.Vector3(-1.8,-2.5,0),new THREE.Vector3(1.3,-1.2,0),new THREE.Vector3(-1.25,.2,0),new THREE.Vector3(1.4,1.6,0),new THREE.Vector3(-.2,2.7,0)]);
        const pathLine = new THREE.Mesh(new THREE.TubeGeometry(path, lightweight ? 40 : 96, .018, 6, false), lineMaterial); geometries.push(pathLine.geometry); root.add(pathLine);
        const dustCount = lightweight ? 10 : quality === "high" ? 42 : quality === "medium" ? 30 : 18;
        const dustPositions = new Float32Array(dustCount * 3);
        for (let i = 0; i < dustCount; i++) {dustPositions[i * 3] = (Math.random() - .5) * 7;dustPositions[i * 3 + 1] = (Math.random() - .5) * 6;dustPositions[i * 3 + 2] = (Math.random() - .5) * 2 - 1;}
        const dustGeometry = new THREE.BufferGeometry();dustGeometry.setAttribute("position", new THREE.BufferAttribute(dustPositions, 3));geometries.push(dustGeometry);
        const dustMaterial = new THREE.PointsMaterial({color: 0x69b9b1, size: .025, transparent: true, opacity: .42});materials.push(dustMaterial);
        const dust = new THREE.Points(dustGeometry, dustMaterial);root.add(dust);
        const signal = makeMesh(new THREE.SphereGeometry(.07, lightweight ? 8 : 16, lightweight ? 6 : 10), copper);
        const serviceModules = [0,1,2,3].map((index) => {
            const cluster = new THREE.Group();root.add(cluster);
            if (index === 0) {makePart(new THREE.BoxGeometry(1.7,1.15,.08), teal, cluster, [0,0,0]);makePart(new THREE.BoxGeometry(1.35,.08,.05), cream, cluster, [0,.28,.07]);makePart(new THREE.BoxGeometry(.5,.45,.05), copper, cluster, [-.42,-.15,.07]);}
            if (index === 1) {makePart(new THREE.BoxGeometry(.68,1.35,.1), cream, cluster, [0,0,0]);makePart(new THREE.BoxGeometry(.54,.86,.04), teal, cluster, [0,.08,.07]);makePart(new THREE.BoxGeometry(.22,.04,.03), copper, cluster, [0,-.42,.1]);}
            if (index === 2) {for(let n=0;n<3;n++)makePart(new THREE.SphereGeometry(.18,12,8), n===1?copper:teal, cluster, [(n-1)*.48,Math.sin(n)*.2,0]);makePart(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(-.45,0,0),new THREE.Vector3(0,.22,0),new THREE.Vector3(.45,0,0)]),18,.012,5), lineMaterial, cluster, [0,0,.02]);}
            if (index === 3) {for(let n=0;n<4;n++)makePart(new THREE.BoxGeometry(.2,.3+n*.15,.2), n%2?copper:teal, cluster, [(n-1.5)*.28,-.3+n*.08,0]);}
            cluster.userData.base = pathPoint(index);return cluster;
        });
        function pathPoint(index: number) {return new THREE.Vector3(-1.65 + index * 1.08, -1.2 + Math.sin(index * 1.6) * .9, .35 + index * .04);}
        const chapterDots = [-.78,-.36,.02,.4,.78].map((value,index) => {const dot=makeMesh(new THREE.SphereGeometry(index===0?.09:.12,14,10),index%2?copper:teal);dot.userData.progress=value;return dot;});
        let progress=0,target=0,frame=0,last=0,visible=true,faqPulse=0,pointerX=0,pointerY=0,journeyEnergy=0;
        let lastUiSync = 0;
        const main = document.querySelector("main");
        const syncWorldState = (nextProgress: number, nextChapter: string) => {
            const now = performance.now();
            if (now - lastUiSync < 120) return;
            document.documentElement.style.setProperty("--world-progress", String(nextProgress));
            main?.setAttribute("data-world-chapter", nextChapter);
            lastUiSync = now;
        };
        const onFaq=()=>{faqPulse=1;};window.addEventListener("adamant:faq",onFaq);
        const onJourney=(event:Event)=>{const detail=(event as CustomEvent<{mode:string;progress:number}>).detail;journeyEnergy=detail.mode==="transforming"?1:detail.progress/100;};window.addEventListener("adamant:journey",onJourney);
        const onPointer=(event:PointerEvent)=>{pointerX=(event.clientX/innerWidth-.5)*2;pointerY=(event.clientY/innerHeight-.5)*2;};window.addEventListener("pointermove",onPointer,{passive:true});
        const updateTarget=()=>{target=Math.min(1,Math.max(0,window.scrollY/Math.max(1,document.documentElement.scrollHeight-innerHeight)));};
        const onScroll=()=>updateTarget(); updateTarget(); window.addEventListener("scroll",onScroll,{passive:true});
        const resize=()=>{const {width,height}=host.getBoundingClientRect();if(!width||!height)return;renderer.setSize(width,height);camera.aspect=width/height;camera.updateProjectionMatrix();};
        const resizeObserver=new ResizeObserver(resize);resizeObserver.observe(host);resize();
        const render=(time:number)=>{if(!visible||document.hidden){frame=0;return;}if(lightweight&&time-last<33){frame=requestAnimationFrame(render);return;}const delta=Math.min((time-last)/1000,.05);last=time;progress+=(target-progress)*(1-Math.exp(-delta*5));const chapter=progress*4;const chapterLabel=progress<.14?"hero":progress<.3?"systems":progress<.48?"services":progress<.66?"process":progress<.84?"faq":"journey";const tint=new THREE.Color().setHSL(.52-progress*.03,.32,.09+progress*.025);document.documentElement.style.setProperty("--world-tint",tint.getStyle());syncWorldState(progress, chapterLabel);
            faqPulse=Math.max(0,faqPulse-delta*2.4);root.rotation.y+=delta*.12+faqPulse*.035+journeyEnergy*.002;root.rotation.x+=(pointerY*.035-root.rotation.x)*.035;root.position.x+=(pointerX*.12-root.position.x)*.035;orb.position.set(Math.sin(chapter*.9)*.65,Math.cos(chapter*.55)*.25,0);orb.rotation.x=chapter*.35+faqPulse*.5;orb.rotation.z=Math.sin(chapter*Math.PI*2)*.12;orb.scale.setScalar(1+journeyEnergy*.45);copper.emissive.setHex(0x5b1806);copper.emissiveIntensity=journeyEnergy*.55;
            knot.position.set(Math.sin(chapter*1.2+1)*.8,Math.cos(chapter*.75+1)*.65,.15);knot.rotation.x+=delta*.25;knot.rotation.y+=delta*.42;seed.position.set(Math.cos(chapter*1.5)*1.35,Math.sin(chapter*.8)*1.2,.1);loop.rotation.z+=delta*.3;
            chapterDots.forEach(dot=>{const p=dot.userData.progress as number;dot.position.copy(path.getPoint((p+1)/2));dot.scale.setScalar(.75+Math.max(0,1-Math.abs(progress-(p+1)/2)*8)*.55);});
            const serviceProgress=Math.max(0,Math.min(1,(progress-.24)/.28));serviceModules.forEach((module,index)=>{const active=Math.max(0,1-Math.abs(serviceProgress-(index/3))*.95);module.visible=active>.03;module.position.copy(module.userData.base as THREE.Vector3).multiplyScalar(.72+active*.28);module.scale.setScalar(.2+active*.8);module.rotation.y+=delta*(.18+active*.18);});
            signal.position.copy(path.getPoint(Math.min(.995,Math.max(.005,progress))));signal.scale.setScalar(1+Math.sin(time*.006)*.18);dust.rotation.y+=delta*.025;camera.position.x=Math.sin(progress*Math.PI*1.3)*.65;camera.position.y=Math.cos(progress*Math.PI*.9)*.3;camera.position.z=8-progress*1.7;camera.rotation.z=Math.sin(progress*Math.PI)*.018;camera.lookAt(0,0,0);renderer.render(scene,camera);frame=requestAnimationFrame(render);};
        const schedule=()=>{if(!frame&&visible&&!document.hidden)frame=requestAnimationFrame(render);};
        const observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;schedule();});observer.observe(host);
        const onVisibilityChange=()=>schedule();document.addEventListener("visibilitychange",onVisibilityChange);schedule();
        return()=>{cancelAnimationFrame(frame);window.removeEventListener("scroll",onScroll);window.removeEventListener("adamant:faq",onFaq);window.removeEventListener("adamant:journey",onJourney);window.removeEventListener("pointermove",onPointer);document.removeEventListener("visibilitychange",onVisibilityChange);observer.disconnect();resizeObserver.disconnect();geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());renderer.dispose();renderer.domElement.remove();};
    }, []);
    return <div ref={hostRef} className="creative-world" aria-hidden="true"><div className="creative-world-fallback"><i/><i/><i/></div></div>;
}
