"use client";

import {useCallback, useEffect, useRef, useState} from "react";
import * as THREE from "three";
import {TearableCloth} from "./tearable-cloth";
import {useWebGLSlot} from "@/hooks/use-webgl-slot";

/** Transparent holes are missing cloth faces, not a progress-based wipe. */
export default function TearCover() {
    const {available, claim} = useWebGLSlot();
    const hostRef = useRef<HTMLDivElement>(null);
    const disposeRef = useRef<(() => void) | null>(null);
    const [visible, setVisible] = useState(true);
    const finish = useCallback(() => {
        // Release this context BEFORE permitting the hero to create its renderer.
        disposeRef.current?.();
        disposeRef.current = null;
        document.documentElement.dataset.introComplete = "true";
        window.dispatchEvent(new Event("adamant:intro-complete"));
        try { sessionStorage.setItem("adamant:peel-reveal-seen", "1"); } catch { /* Storage may be disabled. */ }
        setVisible(false);
    }, []);

    useEffect(() => {
        if (!visible) return;
        const host = hostRef.current;
        if (!host) return;
        delete document.documentElement.dataset.introComplete;
        const previousOverflow = document.body.style.overflow;
        const siblings = Array.from(host.parentElement?.children ?? [])
            .filter((node): node is HTMLElement => node instanceof HTMLElement && node !== host)
            .map(node => ({node, inert: node.inert}));
        document.body.style.overflow = "hidden";
        siblings.forEach(({node}) => { node.inert = true; });
        const releasePage = () => {
            document.body.style.overflow = previousOverflow;
            siblings.forEach(({node, inert}) => { node.inert = inert; });
        };
        disposeRef.current = releasePage;
        const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
        if (motion.matches) {
            host.dataset.reducedMotion = "true";
            const timer = window.setTimeout(finish, 300);
            return () => { window.clearTimeout(timer); releasePage(); };
        }
        if (!available) return releasePage;
        const releaseSlot = claim();
        if (!releaseSlot) return releasePage;
        let renderer: THREE.WebGLRenderer;
        try {
            renderer = new THREE.WebGLRenderer({alpha: true, antialias: false, powerPreference: "low-power"});
        } catch {
            releaseSlot();
            // WebGL failure keeps the branded cover and an accessible skip control.
            return releasePage;
        }
        let disposed = false, frame = 0, lastFrame = 0, settlingFrames = 0;
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.25));
        renderer.setClearColor(0x000000, 0);
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        host.appendChild(renderer.domElement);
        const aspect = window.innerWidth / window.innerHeight;
        const rows = 26, columns = Math.min(60, Math.max(18, Math.round(rows * aspect)));
        const cloth = new TearableCloth(aspect * 2, 2, columns, rows);
        const scene = new THREE.Scene();
        const camera = new THREE.OrthographicCamera(-aspect, aspect, 1, -1, .1, 30);
        camera.position.z = 5;
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute("position", new THREE.BufferAttribute(cloth.positions, 3).setUsage(THREE.DynamicDrawUsage));
        geometry.setAttribute("uv", new THREE.BufferAttribute(cloth.uvs, 2));
        geometry.setIndex(new THREE.BufferAttribute(cloth.indices, 1).setUsage(THREE.DynamicDrawUsage));
        geometry.setDrawRange(0, cloth.drawCount);
        geometry.computeVertexNormals();

        // Logo, tagline and grain are printed onto the fabric and tear with it.
        // BOTH dimensions remain <=1536, even on a portrait display.
        const paper = document.createElement("canvas");
        paper.width = Math.round(1536 * Math.min(1, aspect));
        paper.height = Math.round(1536 * Math.min(1, 1 / aspect));
        const context = paper.getContext("2d")!;
        const texture = new THREE.CanvasTexture(paper);
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.generateMipmaps = false;
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
        const logo = new Image();
        const material = new THREE.MeshStandardMaterial({map: texture, roughness: 1, metalness: 0, side: THREE.DoubleSide});
        const mesh = new THREE.Mesh(geometry, material);
        mesh.frustumCulled = false;
        scene.add(mesh);
        scene.add(new THREE.AmbientLight(0xffffff, .85));
        const key = new THREE.DirectionalLight(0xfff1da, 1.4);
        key.position.set(-2, 3, 5);
        scene.add(key);
        const fill = new THREE.DirectionalLight(0xc9e6df, .35);
        fill.position.set(3, -1, 4);
        scene.add(fill);
        // Surface normals shade the pinch; no shadow-map or postprocessing buffers.
        const print = () => {
            if (disposed) return;
            const w = paper.width, h = paper.height, unit = Math.min(w, h), margin = unit * .06;
            context.fillStyle = "#eae0ce";
            context.fillRect(0, 0, w, h);
            for (let i = 0; i < 14000; i++) {
                context.fillStyle = i % 2 ? "rgba(52,46,30,.045)" : "rgba(255,255,255,.16)";
                context.fillRect((i * 7919 % 15401) / 15401 * w, (i * 3571 % 15331) / 15331 * h, 1.4, 1.4);
            }
            context.strokeStyle = "#1f45432e";
            context.lineWidth = 1;
            context.strokeRect(margin, margin, w - margin * 2, h - margin * 2);
            context.fillStyle = "#274541";
            context.textAlign = "left";
            context.font = "500 " + unit * .016 + "px monospace";
            context.fillText("ADAMANT® / CREATIVE TECHNOLOGY", margin * 1.4, margin * 1.6);
            context.textAlign = "right";
            context.fillText("MADE TO MAKE AN IMPRESSION", w - margin * 1.4, h - margin * 1.3);
            context.save();
            context.translate(w * .84, h * .23);
            context.rotate(-.2);
            context.strokeStyle = "#c9633d";
            context.lineWidth = unit * .003;
            context.beginPath();
            context.arc(0, 0, unit * .074, 0, Math.PI * 2);
            context.stroke();
            context.fillStyle = "#c9633d";
            context.textAlign = "center";
            context.font = "600 " + unit * .016 + "px monospace";
            context.fillText("BREAK", 0, -unit * .006);
            context.fillText("THE ORDINARY", 0, unit * .017);
            context.restore();
            if (logo.complete && logo.naturalWidth) {
                const size = unit * .12;
                context.drawImage(logo, (w - size) / 2, h * .29 - size / 2, size, size);
            }
            context.textAlign = "center";
            context.fillStyle = "#183c39";
            context.font = "800 " + Math.min(w * .145, unit * .18) + "px Arial, sans-serif";
            context.fillText("ADAMANT", w / 2, h * .5, w * .85);
            context.fillStyle = "#bd613c";
            context.font = "italic " + Math.min(w * .053, unit * .053) + "px Georgia, serif";
            context.fillText("Firm in vision. Bold in action.", w / 2, h * .59, w * .85);
            context.fillStyle = "#274541";
            context.font = "500 " + unit * .019 + "px monospace";
            context.fillText("GRAB ANYWHERE. PULL TO TEAR.", w / 2, h * .77, w * .8);
            texture.needsUpdate = true;
            if (!frame) renderer.render(scene, camera);
        };
        const sync = () => {
            geometry.attributes.position.needsUpdate = true;
            geometry.index!.needsUpdate = true;
            geometry.setDrawRange(0, cloth.drawCount);
            geometry.computeVertexNormals();
        };
        const resize = () => {
            const nextAspect = window.innerWidth / window.innerHeight;
            // Resize the existing cloth; never reset a user's torn topology.
            mesh.scale.x = nextAspect / aspect;
            camera.left = -nextAspect;
            camera.right = nextAspect;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight, false);
            renderer.render(scene, camera);
        };
        resize();
        print();
        logo.onload = print;
        logo.src = "/vectors/logo-the-adamant.svg";
        host.dataset.ready = "true";
        window.dispatchEvent(new Event("adamant:tear-ready"));
        const pointer = new THREE.Vector2(), raycaster = new THREE.Raycaster();
        const activePointers = new Set<number>();
        const point = (event: PointerEvent) => ({
            x: (event.clientX / window.innerWidth * 2 - 1) * aspect,
            y: 1 - event.clientY / window.innerHeight * 2,
        });
        const tick = (now: number) => {
            frame = 0;
            if (disposed || document.hidden) return;
            if (now - lastFrame >= 1000 / 60 - 1) {
                lastFrame = now;
                const energy = cloth.step();
                sync();
                renderer.render(scene, camera);
                settlingFrames++;
                host.dataset.tearing = String(cloth.brokenCount > 0);
                host.dataset.tearRatio = cloth.tearRatio.toFixed(4);
                // Like the reference, an intentional tear eventually releases the pins.
                // No timer or session flag can trigger this automatically.
                if (!cloth.dropped && cloth.tearRatio >= .045) {
                    cloth.drop();
                    activePointers.clear();
                    delete host.dataset.grabbing;
                }
                if (cloth.dropped && cloth.offscreen) { finish(); return; }
                if (!cloth.hasGrabs && !cloth.dropped && (energy < .000002 || settlingFrames > 150)) return;
            }
            frame = window.requestAnimationFrame(tick);
        };
        const wake = () => {
            settlingFrames = 0;
            if (!frame && !disposed && !document.hidden) frame = window.requestAnimationFrame(tick);
        };
        const down = (event: PointerEvent) => {
            if (event.button !== 0 || cloth.dropped || (event.target as Element).closest("button")) return;
            pointer.set(event.clientX / window.innerWidth * 2 - 1, 1 - event.clientY / window.innerHeight * 2);
            scene.updateMatrixWorld(true);
            camera.updateMatrixWorld(true);
            raycaster.setFromCamera(pointer, camera);
            if (!raycaster.intersectObject(mesh, false).length) return;
            event.preventDefault();
            const p = point(event);
            cloth.grab(event.pointerId, p.x, p.y, event.pointerType === "touch" ? .2 : .4);
            activePointers.add(event.pointerId);
            host.setPointerCapture(event.pointerId);
            host.dataset.grabbing = "true";
            wake();
        };
        const move = (event: PointerEvent) => {
            if (!activePointers.has(event.pointerId)) return;
            const p = point(event);
            cloth.move(event.pointerId, p.x, p.y);
            wake();
        };
        const up = (event: PointerEvent) => {
            activePointers.delete(event.pointerId);
            cloth.release(event.pointerId);
            if (!activePointers.size) delete host.dataset.grabbing;
            if (host.hasPointerCapture(event.pointerId)) host.releasePointerCapture(event.pointerId);
            wake();
        };
        const pause = () => {
            if (document.hidden) {
                cancelAnimationFrame(frame);
                frame = 0;
                cloth.release();
                activePointers.clear();
                delete host.dataset.grabbing;
            } else if (cloth.dropped) wake();
        };
        const motionChanged = () => { if (motion.matches) finish(); };
        window.addEventListener("resize", resize, {passive: true});
        document.addEventListener("visibilitychange", pause);
        motion.addEventListener("change", motionChanged);
        host.addEventListener("pointerdown", down);
        host.addEventListener("pointermove", move);
        host.addEventListener("pointerup", up);
        host.addEventListener("pointercancel", up);
        host.addEventListener("lostpointercapture", up);
        const dispose = () => {
            if (disposed) return;
            disposed = true;
            cancelAnimationFrame(frame);
            renderer.setAnimationLoop(null);
            window.removeEventListener("resize", resize);
            document.removeEventListener("visibilitychange", pause);
            motion.removeEventListener("change", motionChanged);
            host.removeEventListener("pointerdown", down);
            host.removeEventListener("pointermove", move);
            host.removeEventListener("pointerup", up);
            host.removeEventListener("pointercancel", up);
            host.removeEventListener("lostpointercapture", up);
            logo.onload = null;
            geometry.dispose();
            texture.dispose();
            material.dispose();
            scene.clear();
            renderer.dispose();
            renderer.forceContextLoss();
            renderer.domElement.remove();
            paper.width = paper.height = 1;
            releaseSlot();
            releasePage();
            delete host.dataset.ready;
        };
        disposeRef.current = dispose;
        return dispose;
    }, [visible, finish, available, claim]);

    if (!visible) return null;
    return <div ref={hostRef} className="peel-reveal" role="dialog" aria-modal="true" aria-label="Tear to reveal Adamant">
        <div className="peel-reveal-fallback" aria-hidden="true">
            <strong>ADAMANT®</strong><em>Firm in vision. Bold in action.</em><small>Grab anywhere. Pull to tear.</small>
        </div>
        <p className="sr-only">Drag the cover to stretch and tear it, or use Skip intro to enter the website.</p>
        <button className="peel-reveal-skip" type="button" onClick={finish} autoFocus>Skip intro</button>
    </div>;
}
