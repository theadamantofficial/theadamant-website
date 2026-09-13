"use client";
import {useEffect, useRef} from "react";
import * as THREE from "three";
import {useWebGLSlot} from "@/hooks/use-webgl-slot";
import {registerViewportMotion} from "@/lib/viewport-motion";
export default function SystemScene() {
    const ref = useRef<HTMLDivElement>(null);
    const {available, claim} = useWebGLSlot();
    useEffect(() => {
        const host = ref.current;
        if (!host || !available) return;
        const release = claim();
        if (!release) return;
        let renderer: THREE.WebGLRenderer;
        try {renderer = new THREE.WebGLRenderer({alpha: true, antialias: true, powerPreference: "low-power"});}
        catch {release(); return;}
        renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.25));
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        host.appendChild(renderer.domElement);
        const scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(36, 1, .1, 30);
        scene.add(new THREE.AmbientLight("#f5f0df", .85));
        const key = new THREE.DirectionalLight("#fff0d7", 2.4); key.position.set(-3, 5, 4); scene.add(key);
        const fill = new THREE.DirectionalLight("#8fe3d8", 1.2); fill.position.set(4, 1, -2); scene.add(fill);
        const group = new THREE.Group(); scene.add(group);
        const geometries: THREE.BufferGeometry[] = [], materials: THREE.Material[] = [];
        const themedMaterials: {material: THREE.MeshStandardMaterial; accent: boolean}[] = [];
        const add = (geometry: THREE.BufferGeometry, color: string, parent: THREE.Object3D = group) => {
            const material = new THREE.MeshStandardMaterial({color, roughness: .48, metalness: .25});
            geometries.push(geometry); materials.push(material);
            themedMaterials.push({material, accent: color === "#f29b71"});
            const mesh = new THREE.Mesh(geometry, material); parent.add(mesh); return mesh;
        };
        const core = add(new THREE.IcosahedronGeometry(.68, 1), "#f29b71");
        for (let index = 0; index < 3; index++) {
            const ring = add(new THREE.TorusGeometry(1.15 + index * .22, .025, 6, 64), index === 1 ? "#f29b71" : "#6fd5c3");
            ring.rotation.set(index * .7 + .55, index * .8 + .35, index * .4);
        }
        const satellites = Array.from({length: 5}, (_, index) => {
            const satellite = add(new THREE.OctahedronGeometry(.11, 0), index % 2 ? "#f29b71" : "#81d8ca");
            return satellite;
        });
        const updateTheme = () => {
            const style = getComputedStyle(document.documentElement);
            themedMaterials.forEach(({material, accent}) => material.color.set(style.getPropertyValue(accent ? "--accent" : "--primary").trim()));
        };
        const themeObserver = new MutationObserver(updateTheme);
        themeObserver.observe(document.documentElement, {attributes: true, attributeFilter: ["class"]});
        updateTheme();
        let progress = .5, frame = 0, last = 0, elapsed = 0, visible = true, lost = false;
        const section = host.closest("section") as HTMLElement;
        const removeScroll = registerViewportMotion({element: section, write: value => {progress = value;}});
        const resize = () => {
            const width = host.clientWidth, height = host.clientHeight;
            if (!width || !height) return;
            renderer.setSize(width, height); camera.aspect = width / height; camera.updateProjectionMatrix();
        };
        const resizeObserver = new ResizeObserver(resize); resizeObserver.observe(host); resize();
        const wake = () => {if (!frame && visible && !document.hidden && !lost) frame = requestAnimationFrame(render);};
        const render = (time: number) => {
            frame = 0;
            if (!visible || document.hidden || lost) return;
            if (time - last < 1000 / 30) {wake(); return;}
            elapsed += Math.min((time - last) / 1000, .05); last = time;
            core.rotation.set(elapsed * .09, elapsed * .16, 0);
            group.rotation.y = progress * .9 - .45;
            satellites.forEach((satellite, index) => {
                const angle = index * Math.PI * 2 / 5 + elapsed * .08;
                satellite.position.set(Math.cos(angle) * 1.6, Math.sin(angle) * .9, Math.sin(angle * 2) * .5);
            });
            camera.position.set(Math.sin(progress * 1.2 - .6) * 1.4, .3 + progress * .6, 5.6 - progress * .8);
            camera.lookAt(0, 0, 0);
            renderer.render(scene, camera);
            if (!host.dataset.ready) host.dataset.ready = "true";
            wake();
        };
        const pause = () => {if (document.hidden) {cancelAnimationFrame(frame); frame = 0;} else {last = performance.now(); wake();}};
        const observer = new IntersectionObserver(([entry]) => {visible = entry.isIntersecting; if (visible) wake(); else {cancelAnimationFrame(frame); frame = 0;}});
        observer.observe(host);
        const contextLost = (event: Event) => {event.preventDefault(); lost = true; cancelAnimationFrame(frame); frame = 0; delete host.dataset.ready;};
        renderer.domElement.addEventListener("webglcontextlost", contextLost);
        document.addEventListener("visibilitychange", pause); wake();
        return () => {
            cancelAnimationFrame(frame); renderer.setAnimationLoop(null);
            observer.disconnect(); resizeObserver.disconnect(); themeObserver.disconnect(); removeScroll();
            document.removeEventListener("visibilitychange", pause);
            renderer.domElement.removeEventListener("webglcontextlost", contextLost);
            geometries.forEach(geometry => geometry.dispose()); materials.forEach(material => material.dispose());
            scene.clear(); renderer.dispose(); renderer.forceContextLoss(); renderer.domElement.remove(); release();
        };
    }, [available, claim]);
    return <div ref={ref} className="capability-canvas"/>;
}
