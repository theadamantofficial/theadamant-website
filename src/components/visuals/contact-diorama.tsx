"use client";

import {useEffect, useRef} from "react";
import * as THREE from "three";
import {RoundedBoxGeometry} from "three/addons/geometries/RoundedBoxGeometry.js";
import {OrbitControls} from "three/addons/controls/OrbitControls.js";
import {useWebGLSlot} from "@/hooks/use-webgl-slot";
import {getDeviceQuality, getMaxDpr} from "@/lib/device-quality";

export default function ContactDiorama() {
    const hostRef = useRef<HTMLDivElement>(null);
    const resetRef = useRef<(() => void) | null>(null);
    const {available, claim} = useWebGLSlot();

    useEffect(() => {
        const host = hostRef.current;
        if (!host || !available) return;
        const release = claim();
        if (!release) return;
        let renderer: THREE.WebGLRenderer;
        try {
            renderer = new THREE.WebGLRenderer({alpha: true, antialias: true, powerPreference: "low-power"});
        } catch {
            release();
            return;
        }
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, getMaxDpr(getDeviceQuality())));
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFShadowMap;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.25;
        renderer.domElement.setAttribute("aria-hidden", "true");
        host.appendChild(renderer.domElement);

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(35, 1, .1, 40);
        const controls = new OrbitControls(camera, renderer.domElement);
        renderer.domElement.style.touchAction = "pan-y";
        controls.enablePan = false;
        controls.enableZoom = false;
        controls.minPolarAngle = .65;
        controls.maxPolarAngle = 1.5;
        controls.minAzimuthAngle = -.65;
        controls.maxAzimuthAngle = .85;
        controls.rotateSpeed = .55;
        controls.target.set(0, 1.7, 0);

        const geometries: THREE.BufferGeometry[] = [];
        const materials: THREE.MeshStandardMaterial[] = [];
        const material = (color: string) => {
            const result = new THREE.MeshStandardMaterial({color, roughness: .88});
            materials.push(result);
            return result;
        };
        const teal = material("#438a96"), darkTeal = material("#205763");
        const cream = material("#ffebba"), wood = material("#c77a30");
        const foliage = material("#579451"), grass = material("#94b876");
        const orange = material("#e99a39"), coffee = material("#774221");
        const sky = material("#91c1c5");
        const mesh = (geometry: THREE.BufferGeometry, mat: THREE.Material, x: number, y: number, z: number, parent: THREE.Object3D = scene) => {
            geometries.push(geometry);
            const item = new THREE.Mesh(geometry, mat);
            item.position.set(x, y, z);
            item.castShadow = true;
            item.receiveShadow = true;
            parent.add(item);
            return item;
        };
        const box = (w: number, h: number, d: number, mat: THREE.Material, x: number, y: number, z: number, parent: THREE.Object3D = scene, radius = .06) =>
            mesh(new RoundedBoxGeometry(w, h, d, 2, Math.min(radius, w / 2, h / 2, d / 2)), mat, x, y, z, parent);
        const sphere = (r: number, mat: THREE.Material, x: number, y: number, z: number, parent: THREE.Object3D = scene) =>
            mesh(new THREE.SphereGeometry(r, 20, 12), mat, x, y, z, parent);
        const cylinder = (r: number, bottom: number, h: number, mat: THREE.Material, x: number, y: number, z: number, parent: THREE.Object3D = scene) =>
            mesh(new THREE.CylinderGeometry(r, bottom, h, 24), mat, x, y, z, parent);
        const line = (from: THREE.Vector3, to: THREE.Vector3, mat: THREE.Material, radius: number, parent: THREE.Object3D = scene) => {
            const rod = cylinder(radius, radius, from.distanceTo(to), mat, 0, 0, 0, parent);
            rod.position.copy(from).add(to).multiplyScalar(.5);
            rod.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), to.clone().sub(from).normalize());
        };

        scene.add(new THREE.HemisphereLight("#fff7e4", "#648778", 2.8));
        const sun = new THREE.DirectionalLight("#fff0d5", 3.5);
        sun.position.set(-3, 7, 5);
        sun.castShadow = true;
        sun.shadow.mapSize.set(512, 512);
        Object.assign(sun.shadow.camera, {left: -5, right: 5, top: 6, bottom: -4});
        sun.shadow.normalBias = .04;
        scene.add(sun);
        const fill = new THREE.DirectionalLight("#b3e6ed", 1.8);
        fill.position.set(4, 3, -2);
        scene.add(fill);

        // A rounded miniature garden, with a scalloped sky behind it.
        cylinder(3.55, 3.45, .18, grass, 0, .05, 0).scale.z = .58;
        box(5.6, 3.4, .22, sky, 0, 1.95, -1.35, scene, .11);
        for (const [x, y, r] of [[-2.4, 2.9, .7], [-1.6, 3.5, .66], [-.6, 3.25, .6], [.7, 3.55, .72], [1.8, 3.25, .72], [2.5, 2.5, .7]]) {
            sphere(r, sky, x, y, -1.35).scale.z = .2;
        }

        // Solid wood desk and an open laptop with an envelope on the screen.
        box(2.65, .2, 1.3, wood, -.85, 1.1, .65);
        for (const x of [-1.94, .24]) for (const z of [.15, 1.15]) box(.14, .95, .14, wood, x, .58, z);
        const laptop = new THREE.Group();
        laptop.position.set(-1.05, 1.25, .63);
        laptop.rotation.y = -.12;
        scene.add(laptop);
        box(1.65, .1, 1.02, teal, 0, 0, 0, laptop);
        box(1.35, .025, .38, darkTeal, 0, .06, -.05, laptop, .01);
        for (let row = 0; row < 3; row++) for (let col = 0; col < 9; col++) box(.1, .018, .07, teal, -.56 + col * .14, .08, -.17 + row * .1, laptop, .005);
        box(.45, .014, .18, sky, 0, .06, .3, laptop, .005);
        const screen = new THREE.Group();
        screen.position.set(0, .55, -.44);
        screen.rotation.x = -.14;
        laptop.add(screen);
        box(1.65, 1.08, .12, darkTeal, 0, 0, 0, screen);
        box(1.44, .86, .025, sky, 0, 0, .075, screen, .01);
        const envelope = (x: number, y: number, z: number, w: number, parent: THREE.Object3D = scene) => {
            box(w, w * .63, .07, cream, x, y, z, parent, .025);
            line(new THREE.Vector3(x - w * .46, y + w * .26, z + .046), new THREE.Vector3(x, y - w * .06, z + .046), wood, .012, parent);
            line(new THREE.Vector3(x, y - w * .06, z + .046), new THREE.Vector3(x + w * .46, y + w * .26, z + .046), wood, .012, parent);
        };
        envelope(0, 0, .11, .86, screen);
        cylinder(.19, .15, .34, orange, .13, 1.38, .55);
        cylinder(.155, .155, .014, coffee, .13, 1.558, .55);
        mesh(new THREE.TorusGeometry(.13, .04, 8, 20), orange, .34, 1.4, .55);

        // Arched mailbox: an extruded shell, recessed opening, and an actual letter.
        box(.2, 1.5, .2, wood, 1.8, .9, -.05);
        const arch = new THREE.Shape();
        arch.moveTo(-.56, 0);
        arch.lineTo(.56, 0);
        arch.lineTo(.56, .55);
        arch.absarc(0, .55, .56, 0, Math.PI, false);
        arch.lineTo(-.56, 0);
        const mailbox = mesh(new THREE.ExtrudeGeometry(arch, {depth: .92, bevelEnabled: true, bevelSegments: 2, steps: 1, bevelSize: .04, bevelThickness: .04, curveSegments: 24}), teal, 1.8, 1.57, -.7);
        const opening = mesh(new THREE.ShapeGeometry(arch), darkTeal, 0, 0, .969, mailbox);
        opening.scale.set(.87, .9, 1);
        envelope(1.8, 1.96, .4, .68);
        const door = box(1.03, .08, .75, teal, 1.8, 1.58, .66);
        door.rotation.x = .12;
        box(.08, .5, .06, wood, 2.42, 2.18, -.15);
        box(.28, .22, .07, orange, 2.52, 2.37, -.15);

        // Clay trees and small bushes frame the foreground.
        for (const [x, z, h] of [[-2.65, .05, 1.9], [2.85, .35, 1.55]]) {
            cylinder(.06, .09, h, wood, x, h / 2, z);
            const crown = sphere(.46, foliage, x, h * .88, z);
            crown.scale.set(.9, 1.4, .75);
            sphere(.34, foliage, x - .22, h * .73, z);
            sphere(.33, foliage, x + .22, h * .77, z);
            line(new THREE.Vector3(x, h * .48, z + .35), new THREE.Vector3(x - .21, h * .7, z + .35), wood, .035);
            line(new THREE.Vector3(x, h * .53, z + .35), new THREE.Vector3(x + .2, h * .79, z + .35), wood, .035);
        }
        for (const [x, z] of [[-2.7, 1.1], [-2.2, 1.35], [2.65, 1.12]]) sphere(.32, foliage, x, .25, z).scale.y = .8;

        const floaters: THREE.Group[] = [];
        const bubble = (x: number, y: number, mat: THREE.Material, w: number) => {
            const group = new THREE.Group();
            group.position.set(x, y, -.8);
            scene.add(group);
            box(w, .68, .22, mat, 0, 0, 0, group, .11);
            const tail = new THREE.Shape();
            tail.moveTo(-.05, -.22); tail.lineTo(.22, -.22); tail.lineTo(.2, -.53); tail.closePath();
            mesh(new THREE.ExtrudeGeometry(tail, {depth: .17, bevelEnabled: false}), mat, 0, 0, -.08, group);
            for (const dot of [-.28, 0, .28]) sphere(.065, mat === teal ? darkTeal : orange, dot, .015, .13, group);
            floaters.push(group);
        };
        bubble(-1.83, 2.8, teal, 1.35);
        bubble(1.93, 3.35, cream, 1.15);
        for (const [x, y, size] of [[-1.95, 3.85, .75], [.12, 3.5, .6]]) {
            const cloud = new THREE.Group();
            cloud.position.set(x, y, -.93);
            scene.add(cloud);
            box(size, .2, .17, cream, 0, 0, 0, cloud, .08);
            sphere(size * .2, cream, -.18, .09, 0, cloud).scale.z = .55;
            sphere(size * .27, cream, .06, .16, 0, cloud).scale.z = .55;
        }

        const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
        let frame = 0, lost = false, lastRender = 0;
        const render = (time: number) => {
            frame = 0;
            if (document.hidden || lost) return;
            if (time - lastRender >= 1000 / 30 || reduced.matches) {
                lastRender = time;
                floaters.forEach((group, i) => {group.position.y = (i === 0 ? 2.8 : 3.35) + (reduced.matches ? 0 : Math.sin(time * .0012 + i * 2) * .045);});
                renderer.render(scene, camera);
                host.dataset.ready = "true";
            }
            if (!reduced.matches) wake();
        };
        const wake = () => {if (!frame && !document.hidden && !lost) frame = requestAnimationFrame(render);};
        const reset = () => {camera.position.set(3.5, 3.8, 8.3); controls.target.set(0, 1.85, 0); controls.update(); wake();};
        resetRef.current = reset;
        const resize = () => {
            const {width, height} = host.getBoundingClientRect();
            if (!width || !height) return;
            renderer.setSize(width, height);
            camera.aspect = width / height;
            camera.fov = camera.aspect < 1.25 ? 42 : 35;
            camera.updateProjectionMatrix();
            wake();
        };
        const updateTheme = () => {
            const night = document.documentElement.classList.contains("dark");
            sky.color.set(night ? "#28535c" : "#91c1c5");
            grass.color.set(night ? "#486f55" : "#94b876");
            sun.intensity = night ? 2 : 3.5;
            wake();
        };
        const themeObserver = new MutationObserver(updateTheme);
        themeObserver.observe(document.documentElement, {attributes: true, attributeFilter: ["class"]});
        const resizeObserver = new ResizeObserver(resize);
        resizeObserver.observe(host);
        const visibility = () => {cancelAnimationFrame(frame); frame = 0; wake();};
        const motionChanged = () => {cancelAnimationFrame(frame); frame = 0; wake();};
        const keydown = (event: KeyboardEvent) => {
            if (event.key === "Home") {event.preventDefault(); reset(); return;}
            if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) return;
            event.preventDefault();
            const offset = camera.position.clone().sub(controls.target);
            const orbit = new THREE.Spherical().setFromVector3(offset);
            if (event.key === "ArrowLeft") orbit.theta -= .12;
            if (event.key === "ArrowRight") orbit.theta += .12;
            if (event.key === "ArrowUp") orbit.phi -= .08;
            if (event.key === "ArrowDown") orbit.phi += .08;
            orbit.theta = THREE.MathUtils.clamp(orbit.theta, controls.minAzimuthAngle, controls.maxAzimuthAngle);
            orbit.phi = THREE.MathUtils.clamp(orbit.phi, controls.minPolarAngle, controls.maxPolarAngle);
            camera.position.setFromSpherical(orbit).add(controls.target);
            controls.update(); wake();
        };
        const contextLost = (event: Event) => {event.preventDefault(); lost = true; cancelAnimationFrame(frame); frame = 0; delete host.dataset.ready;};
        const contextRestored = () => {lost = false; wake();};
        controls.addEventListener("change", wake);
        host.addEventListener("keydown", keydown);
        document.addEventListener("visibilitychange", visibility);
        reduced.addEventListener("change", motionChanged);
        renderer.domElement.addEventListener("webglcontextlost", contextLost);
        renderer.domElement.addEventListener("webglcontextrestored", contextRestored);
        resize(); updateTheme(); reset();

        return () => {
            resetRef.current = null;
            cancelAnimationFrame(frame);
            resizeObserver.disconnect(); themeObserver.disconnect();
            controls.removeEventListener("change", wake);
            controls.dispose();
            host.removeEventListener("keydown", keydown);
            document.removeEventListener("visibilitychange", visibility);
            reduced.removeEventListener("change", motionChanged);
            renderer.domElement.removeEventListener("webglcontextlost", contextLost);
            renderer.domElement.removeEventListener("webglcontextrestored", contextRestored);
            geometries.forEach(geometry => geometry.dispose());
            materials.forEach(mat => mat.dispose());
            renderer.dispose(); renderer.forceContextLoss(); renderer.domElement.remove();
            delete host.dataset.ready;
            release();
        };
    }, [available, claim]);

    return <>
        <div ref={hostRef} className="contact-diorama-canvas" tabIndex={0} role="img" aria-label="Interactive 3D garden with a laptop, mailbox and floating messages. Drag or use arrow keys to rotate. Press Home to reset."/>
        <div className="contact-diorama-tools">
            <span>Drag to explore</span>
            <button type="button" onClick={() => resetRef.current?.()} aria-label="Reset contact illustration view">Reset view <span aria-hidden="true">↺</span></button>
        </div>
    </>;
}
