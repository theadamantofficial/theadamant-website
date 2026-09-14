"use client";

import Image from "next/image";
import {useEffect, useRef, useState} from "react";
import * as THREE from "three";
import {OrbitControls} from "three/addons/controls/OrbitControls.js";
import {createMascotModel} from "./mascot-model";
import {getDeviceQuality, getMaxDpr} from "@/lib/device-quality";

export default function ContactMascot({className, source}: {className: string; source: string}) {
    const hostRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLDivElement>(null);
    const resetRef = useRef<(() => void) | null>(null);
    const [visible, setVisible] = useState(false);
    const [ready, setReady] = useState(false);

    useEffect(() => {
        const host = hostRef.current;
        if (!host) return;
        const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting));
        observer.observe(host);
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        const host = canvasRef.current;
        if (!visible || !host) return;
        let renderer: THREE.WebGLRenderer;
        try {renderer = new THREE.WebGLRenderer({alpha: true, antialias: true, powerPreference: "low-power"});}
        catch {return;}
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, getMaxDpr(getDeviceQuality())));
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.2;
        renderer.domElement.setAttribute("aria-hidden", "true");
        host.appendChild(renderer.domElement);
        const scene = new THREE.Scene();
        const model = createMascotModel();
        scene.add(model.group);
        scene.add(new THREE.HemisphereLight("#fff5e9", "#729d9e", 2.6));
        const key = new THREE.DirectionalLight("#fff5e8", 3);
        key.position.set(-3, 5, 5);
        scene.add(key);
        const fill = new THREE.DirectionalLight("#b4e9f1", 2);
        fill.position.set(3, 3, -3);
        scene.add(fill);
        const camera = new THREE.PerspectiveCamera(33, 1, .1, 30);
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enablePan = false;
        controls.enableZoom = false;
        controls.enableDamping = false;
        controls.rotateSpeed = .7;
        controls.minPolarAngle = Math.PI * .30;
        controls.maxPolarAngle = Math.PI * .60;
        // No azimuth limits: front, side and back all use the same solid meshes.
        controls.target.set(0, 1.23, 0);
        let frame = 0, lost = false;
        const render = () => {
            frame = 0;
            if (lost || document.hidden) return;
            renderer.render(scene, camera);
            setReady(true);
        };
        const wake = () => {if (!frame && !lost && !document.hidden) frame = requestAnimationFrame(render);};
        const reset = () => {
            camera.position.set(2.2, 2.1, 5.1);
            controls.target.set(0, 1.23, 0);
            controls.update();
            wake();
        };
        resetRef.current = reset;
        const resize = () => {
            const {width, height} = host.getBoundingClientRect();
            if (!width || !height) return;
            renderer.setSize(width, height);
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
            wake();
        };
        const observer = new ResizeObserver(resize);
        observer.observe(host);
        const keydown = (event: KeyboardEvent) => {
            if (event.key === "Home") {event.preventDefault(); reset(); return;}
            if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) return;
            event.preventDefault();
            const orbit = new THREE.Spherical().setFromVector3(camera.position.clone().sub(controls.target));
            if (event.key === "ArrowLeft") orbit.theta -= .15;
            if (event.key === "ArrowRight") orbit.theta += .15;
            if (event.key === "ArrowUp") orbit.phi -= .10;
            if (event.key === "ArrowDown") orbit.phi += .10;
            orbit.phi = THREE.MathUtils.clamp(orbit.phi, controls.minPolarAngle, controls.maxPolarAngle);
            camera.position.setFromSpherical(orbit).add(controls.target);
            controls.update();
            wake();
        };
        const dragging = () => {if (hostRef.current) hostRef.current.dataset.dragging = "true";};
        const released = () => {if (hostRef.current) hostRef.current.dataset.dragging = "false";};
        const contextLost = (event: Event) => {
            event.preventDefault(); lost = true;
            cancelAnimationFrame(frame); frame = 0; setReady(false);
        };
        const contextRestored = () => {lost = false; wake();};
        controls.addEventListener("change", wake);
        controls.addEventListener("start", dragging);
        controls.addEventListener("end", released);
        host.addEventListener("keydown", keydown);
        document.addEventListener("visibilitychange", wake);
        renderer.domElement.addEventListener("webglcontextlost", contextLost);
        renderer.domElement.addEventListener("webglcontextrestored", contextRestored);
        resize(); reset();
        return () => {
            resetRef.current = null;
            setReady(false);
            cancelAnimationFrame(frame);
            observer.disconnect();
            controls.removeEventListener("change", wake);
            controls.removeEventListener("start", dragging);
            controls.removeEventListener("end", released);
            controls.dispose();
            host.removeEventListener("keydown", keydown);
            document.removeEventListener("visibilitychange", wake);
            renderer.domElement.removeEventListener("webglcontextlost", contextLost);
            renderer.domElement.removeEventListener("webglcontextrestored", contextRestored);
            model.dispose();
            renderer.dispose(); renderer.forceContextLoss(); renderer.domElement.remove();
        };
    }, [visible]);

    return <>
        <div ref={hostRef} className={className} data-ready={ready}>
            <Image src={source} alt="Adamant mascot wearing a teal cap and holding a phone" width={1122} height={1402} sizes="220px" className="mascot-image mascot-model-fallback"/>
            <div ref={canvasRef} className="mascot-model-canvas" tabIndex={ready ? 0 : -1} role="img" aria-label="3D Adamant mascot. Drag or use arrow keys to rotate all the way around. Press Home to reset." aria-hidden={!ready}/>
        </div>
        <div className="contact-form-mascot-hint">
            {ready ? <><span>Drag to rotate 360°</span><button type="button" onClick={() => resetRef.current?.()}>Reset view ↺</button></> : <span>Say hello to Adamant</span>}
        </div>
    </>;
}
