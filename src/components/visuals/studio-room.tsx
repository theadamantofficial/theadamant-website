"use client";

import {useEffect, useRef, RefObject} from "react";
import * as THREE from "three";
import {RoundedBoxGeometry} from "three/addons/geometries/RoundedBoxGeometry.js";
import {OrbitControls} from "three/addons/controls/OrbitControls.js";
import {getDeviceQuality, getMaxDpr} from "@/lib/device-quality";
import {useWebGLSlot} from "@/hooks/use-webgl-slot";
import {createStudioMonitorMedia} from "./studio-monitor-media";

export default function StudioRoom({onEnter, onReady, paused, resetKey, palette, progressRef}: {progressRef: RefObject<number>; onEnter: () => void; onReady?: () => void; paused: boolean; resetKey: number; palette: number}) {
    const {available, claim} = useWebGLSlot();
    const readyRef = useRef(onReady);
    useEffect(() => {readyRef.current = onReady;}, [onReady]);
    const hostRef = useRef<HTMLDivElement>(null);
    const enterRef = useRef(onEnter);
    const pausedRef = useRef(paused);
    const resetRef = useRef<(() => void) | null>(null);
    const paletteRef = useRef<((value: number) => void) | null>(null);
    useEffect(() => {enterRef.current = onEnter;}, [onEnter]);
    useEffect(() => {pausedRef.current = paused;}, [paused]);
    useEffect(() => {resetRef.current?.();}, [resetKey]);
    useEffect(() => {paletteRef.current?.(palette);}, [palette]);

    useEffect(() => {
        const host = hostRef.current;
        if (!host || !available) return;
        const release = claim();
        if (!release) return;
        let renderer: THREE.WebGLRenderer;
        try {renderer = new THREE.WebGLRenderer({alpha: true, antialias: true, powerPreference: "low-power"});}
        catch {release();return;}
        const quality = getDeviceQuality();
        renderer.setPixelRatio(Math.min(devicePixelRatio, getMaxDpr(quality)));
        renderer.shadowMap.enabled = quality === "high";
        renderer.shadowMap.type = THREE.PCFShadowMap;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.2;
        host.appendChild(renderer.domElement);
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 80);
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enablePan = false;
        controls.enableZoom = false;
        controls.enableDamping = false;
        controls.enableRotate = true;
        controls.rotateSpeed = .45;
        controls.minPolarAngle = 0.22;
        controls.maxPolarAngle = Math.PI - 0.22;
        controls.target.set(0, 2, 0);
        renderer.domElement.style.touchAction = "pan-y";
        const materials: THREE.Material[] = [];
        const geometries: THREE.BufferGeometry[] = [];
        const textures: THREE.Texture[] = [];
        const material = (color: string, roughness = 0.75, metalness = 0) => {
            const result = new THREE.MeshStandardMaterial({color, roughness, metalness});
            materials.push(result);return result;
        };
        const cream = material("#e4dbc8");
        const edge = material("#b9ae99");
        const teal = material("#165c60");
        const dark = material("#182f30");
        const copper = material("#e47b46");
        const white = material("#fff4dc");
        const green = material("#486b46");
        const soil = material("#48392a");
        const metal = material("#52615e", 0.35, 0.6);
        paletteRef.current = (value) => {
            const colors = [["#165c60", "#e47b46"], ["#3946a3", "#e5ac32"], ["#744764", "#d9819c"]][value % 3];
            teal.color.set(colors[0]);copper.color.set(colors[1]);
        };
        const mesh = (geometry: THREE.BufferGeometry, mat: THREE.Material, x: number, y: number, z: number, parent: THREE.Object3D = scene) => {
            geometries.push(geometry);const item = new THREE.Mesh(geometry, mat);
            item.position.set(x,y,z);item.castShadow = true;item.receiveShadow = true;parent.add(item);return item;
        };
        const box = (w: number,h: number,d: number,mat: THREE.Material,x: number,y: number,z: number,parent: THREE.Object3D = scene,r = .04) => mesh(new RoundedBoxGeometry(w,h,d,2,r),mat,x,y,z,parent);
        const cylinder = (top: number,bottom: number,h: number,mat: THREE.Material,x: number,y: number,z: number,parent: THREE.Object3D = scene) => mesh(new THREE.CylinderGeometry(top,bottom,h,32),mat,x,y,z,parent);
        const rod = (from: THREE.Vector3,to: THREE.Vector3,r: number,mat: THREE.Material) => {
            const obj=cylinder(r,r,from.distanceTo(to),mat,0,0,0);
            obj.position.copy(from).add(to).multiplyScalar(.5);
            obj.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),to.clone().sub(from).normalize());return obj;
        };
        scene.add(new THREE.HemisphereLight(0xfff8e7,0x778b82,3));
        const sun = new THREE.DirectionalLight(0xffedce,4);
        sun.position.set(-3,9,6);sun.castShadow = true;
        sun.shadow.mapSize.set(1024,1024);sun.shadow.camera.left=-8;sun.shadow.camera.right=8;
        sun.shadow.camera.top=7;sun.shadow.camera.bottom=-7;sun.shadow.normalBias=.04;sun.shadow.bias=-.0001;scene.add(sun);
        const fill=new THREE.DirectionalLight(0xb9e6e2,1.5);fill.position.set(5,4,-3);scene.add(fill);
        const floorMaterial = material("#c5c5b5");
        const rugMaterial = material("#d19c74");
        const floor = mesh(new THREE.CircleGeometry(5.9,80),floorMaterial,0,-.04,0);
        const themeUpdate = () => {
            const night = document.documentElement.classList.contains("dark");
            floorMaterial.color.set(night ? "#172c38" : "#c5c5b5");
            rugMaterial.color.set(night ? "#27535b" : "#d19c74");
            cream.color.set(night ? "#879da2" : "#e4dbc8");
            sun.intensity = night ? 2 : 4;
            fill.intensity = night ? 3 : 1.5;
        };
        const themeObserver = new MutationObserver(themeUpdate);
        themeObserver.observe(document.documentElement,{attributes:true,attributeFilter:["class"]});themeUpdate();
        floor.rotation.x = -Math.PI/2;
        const rug=box(8.7,.035,5.9,rugMaterial,0,.005,.6,scene,.015);
        rug.rotation.y=-.06;
        // Oak desktop with painted steel trestles.
        box(7.2,.22,3.15,cream,0,2.2,0);
        box(7.05,.08,3.05,edge,0,2.08,0);
        for(const x of [-2.9,2.9]) {
            box(.16,2.05,.16,teal,x,1.04,-1.1);box(.16,2.05,.16,teal,x,1.04,1.1);
            box(.22,.12,2.6,teal,x,.1,0);box(.12,.12,2.2,teal,x,1.75,0);
        }
        box(5.85,.12,.12,teal,0,.55,-1.1);
        // Slim aluminium desktop display with a compact workstation below.
        const computer=new THREE.Group();scene.add(computer);
        const screenWidth = 3.08, screenHeight = screenWidth * 9 / 16;
        box(1.15,.1,.75,edge,0,2.39,-.35,computer);
        box(.22,.52,.2,cream,0,2.68,-.43,computer);
        box(3.35,1.92,.16,cream,0,3.63,-.4,computer,.08);
        mesh(new THREE.BoxGeometry(screenWidth,screenHeight,.07),dark,0,3.63,-.22,computer);
        const monitorMedia = createStudioMonitorMedia(host, Math.min(8, renderer.capabilities.getMaxAnisotropy()));
        const screenMat = new THREE.MeshBasicMaterial({map: monitorMedia.update(0), toneMapped: false});materials.push(screenMat);
        const screen=mesh(new THREE.PlaneGeometry(screenWidth,screenHeight),screenMat,0,3.63,-.178,computer);screen.castShadow=false;
        box(.78,.045,.014,edge,-.86,2.7,-.18,computer);
        cylinder(.035,.035,.035,teal,1.18,2.71,-.18,computer).rotation.x=Math.PI/2;
        for(let i=0;i<6;i++) box(.28,.025,.01,dark,.38+i*.06,2.71,-.18,computer);
        const mini=box(.86,.18,.82,metal,1.93,2.4,-.24,scene,.12);
        box(.035,.02,.035,copper,.3,.1,.34,mini,.01);
        // Mechanical keyboard, individual keys and a wired mouse.
        const keyboard=new THREE.Group();keyboard.position.set(-.2,2.38,.91);keyboard.rotation.x=.06;scene.add(keyboard);
        box(2.05,.12,.71,edge,0,0,0,keyboard);
        for(let row=0;row<4;row++)for(let col=0;col<13;col++)box(.126,.064,.12,row===0&&col===0?copper:white,-.91+col*.15,.084,-.25+row*.15,keyboard,.014);
        box(.78,.064,.1,cream,0,.084,.27,keyboard,.01);
        box(.76,.02,.82,teal,1.5,2.33,.85);
        box(.3,.16,.46,cream,1.5,2.42,.85,scene,.075);
        const cable=new THREE.CatmullRomCurve3([new THREE.Vector3(1.5,2.36,.6),new THREE.Vector3(1.6,2.36,.15),new THREE.Vector3(1.05,2.36,-.2)]);
        mesh(new THREE.TubeGeometry(cable,24,.012,6,false),dark,0,0,0);
        // Books and a coffee cup.
        box(.9,.16,.65,teal,-2.35,2.4,.2).rotation.y=.1;
        box(.85,.15,.62,white,-2.3,2.55,.22).rotation.y=-.05;
        box(.9,.1,.65,copper,-2.35,2.67,.2).rotation.y=.06;
        cylinder(.19,.15,.38,white,-2.45,2.52,1);
        cylinder(.155,.155,.015,soil,-2.45,2.717,1);
        const handle=mesh(new THREE.TorusGeometry(.13,.035,10,24),white,-2.23,2.54,1);handle.rotation.y=Math.PI/2;
        // Articulated brass desk lamp.
        cylinder(.33,.37,.08,teal,2.6,2.35,-.6);
        rod(new THREE.Vector3(2.6,2.4,-.6),new THREE.Vector3(2.85,3.35,-.65),.045,metal);
        rod(new THREE.Vector3(2.85,3.35,-.65),new THREE.Vector3(2.32,3.9,-.5),.045,metal);
        const shade=cylinder(.12,.38,.32,teal,2.27,3.85,-.45);shade.rotation.z=-.3;
        const bulbMat=new THREE.MeshStandardMaterial({color:0xffedc4,emissive:0xffcf83,emissiveIntensity:2});materials.push(bulbMat);
        cylinder(.3,.3,.015,bulbMat,2.22,3.69,-.45);
        const lamp=new THREE.PointLight(0xffcb85,3,4);lamp.position.set(2.2,3.55,-.45);scene.add(lamp);
        // Planter and deliberately stylized leaves.
        cylinder(.48,.33,.8,copper,-4.25,.4,-.7);
        cylinder(.42,.42,.04,soil,-4.25,.82,-.7);
        const leaves: THREE.Mesh[]=[];
        for(let i=0;i<9;i++) {
            const angle=i*2.4;const h=1.4+(i%3)*.36;
            const tip=new THREE.Vector3(-4.25+Math.cos(angle)*.5,h+.8,-.7+Math.sin(angle)*.5);
            rod(new THREE.Vector3(-4.25,.8,-.7),tip,.018,green);
            const leaf=mesh(new THREE.SphereGeometry(1,10,8),green,tip.x,tip.y,tip.z);
            leaf.scale.set(.2,.46,.075);leaf.rotation.set(.3,angle,Math.cos(angle)*.8);leaves.push(leaf);
        }
        // A pulled-out studio chair, leaving the computer visible.
        const chair=new THREE.Group();chair.position.set(1.75,0,2.5);chair.rotation.y=-.5;scene.add(chair);
        cylinder(.1,.1,.9,metal,0,.65,0,chair);
        box(1.15,.22,1.08,copper,0,1.2,0,chair,.12);
        box(1.1,1.12,.18,teal,0,1.9,.47,chair,.12);
        box(.11,.8,.11,metal,-.4,1.45,.42,chair);box(.11,.8,.11,metal,.4,1.45,.42,chair);
        for(let i=0;i<5;i++){const leg=box(.08,.08,1.25,metal,0,.2,0,chair);leg.rotation.y=i*Math.PI/5;}
        // A lightweight procedural studio host sits in the draggable chair.
        // Because this is geometry rather than a flat bitmap it remains crisp
        // and correctly proportioned through the full camera zoom and orbit.
        const skin=material("#b9785d",.8);const hair=material("#28201d",.9);
        const studioAvatar=new THREE.Group();chair.add(studioAvatar);
        box(.72,.82,.48,teal,0,2.08,.02,studioAvatar,.19);
        const head=mesh(new THREE.SphereGeometry(.31,24,18),skin,0,2.72,-.08,studioAvatar);head.scale.set(.9,1.05,.88);
        const cap=mesh(new THREE.SphereGeometry(.325,24,12,0,Math.PI*2,0,Math.PI*.48),teal,0,2.86,-.08,studioAvatar);cap.rotation.x=-.08;
        box(.42,.055,.18,teal,0,2.82,-.31,studioAvatar,.035);
        for(const x of [-.18,.18]) {
            const thigh=box(.21,.22,.72,dark,x,1.55,-.36,studioAvatar,.08);thigh.rotation.x=-.12;
            box(.22,.73,.23,dark,x,1.17,-.69,studioAvatar,.08);
            box(.25,.14,.43,white,x,.77,-.81,studioAvatar,.07);
            const arm=box(.18,.65,.2,teal,x*2.2,1.96,-.16,studioAvatar,.08);arm.rotation.z=x<0?-.23:.23;
        }
        const hairBack=mesh(new THREE.SphereGeometry(.315,18,12),hair,0,2.69,.04,studioAvatar);hairBack.scale.set(.96,.92,.72);
        const logoShape=new THREE.Shape();logoShape.moveTo(0,.13);logoShape.lineTo(-.11,-.1);logoShape.lineTo(.02,-.04);logoShape.closePath();
        const logoGeometry=new THREE.ShapeGeometry(logoShape);geometries.push(logoGeometry);
        const frontLogo=new THREE.Mesh(logoGeometry,white);frontLogo.position.set(.08,2.15,-.267);frontLogo.scale.set(.72,.72,.72);studioAvatar.add(frontLogo);
        const backLogo=frontLogo.clone();backLogo.position.set(-.08,2.15,.267);backLogo.rotation.y=Math.PI;studioAvatar.add(backLogo);
        // Oversized floating design objects make this a creative playground.
        const knot=mesh(new THREE.TorusKnotGeometry(.45,.14,72,12),copper,-4.25,4.55,-1.45);
        const gem=mesh(new THREE.IcosahedronGeometry(.52,0),teal,4.65,4.65,-1.5);
        const orbit=mesh(new THREE.TorusGeometry(.85,.018,8,64),metal,4.65,4.65,-1.5);
        orbit.rotation.x=.9;orbit.rotation.y=.3;
        const ball=mesh(new THREE.SphereGeometry(.17,16,12),copper,5.35,5.05,-1.55);
        const reduced=matchMedia('(prefers-reduced-motion: reduce)');
        const assemblyParts = [computer, keyboard, chair, knot, gem, orbit, ball];
        const assemblyTargets = assemblyParts.map((part) => part.position.clone());
        const assemblyOffsets = [
            new THREE.Vector3(0, 1.8, -.2), new THREE.Vector3(-.2, 1.2, .6), new THREE.Vector3(0, .7, 1),
            new THREE.Vector3(-.8, 1.2, -.4), new THREE.Vector3(.8, 1.3, -.3), new THREE.Vector3(.8, 1.3, -.3), new THREE.Vector3(.8, 1.3, -.3),
        ];
        let frame=0;let visible=true;let lost=false;let previous=0;let elapsed=0;
        const frontOverview = new THREE.Vector3(9.6,7.4,13.8);
        const overview = frontOverview.clone();
        const overviewTarget = new THREE.Vector3(0,1.8,0);
        // Cover desktop viewports at the end; keep the full monitor on portrait screens.
        const entryPosition = new THREE.Vector3(0,3.63,0.86);
        const entryTarget = new THREE.Vector3(0,3.63,-.178);
        let lastProgress = 0;
        const reset=()=>{camera.position.copy(overview);controls.target.copy(overviewTarget);controls.update();};resetRef.current=reset;reset();
        let viewportWidth = 1, viewportHeight = 1;
        const resize=()=>{const {width,height}=host.getBoundingClientRect();if(!width||!height)return;viewportWidth=width;viewportHeight=height;renderer.setSize(width,height);camera.aspect=width/height;camera.updateProjectionMatrix();};
        const resizeObserver=new ResizeObserver(resize);resizeObserver.observe(host);resize();
        const raycaster=new THREE.Raycaster();const pointer=new THREE.Vector2();let startX=0;let startY=0;let assembly=0;let dragging=false;
        const intersects=(event:PointerEvent)=>{const r=host.getBoundingClientRect();pointer.set((event.clientX-r.left)/r.width*2-1,-(event.clientY-r.top)/r.height*2+1);raycaster.setFromCamera(pointer,camera);return raycaster.intersectObject(computer,true).length>0;};
        const down=(e:PointerEvent)=>{dragging=true;startX=e.clientX;startY=e.clientY;};
        const up=(e:PointerEvent)=>{dragging=false;if(Math.hypot(e.clientX-startX,e.clientY-startY)<6&&intersects(e))enterRef.current();};
        const cancel=()=>{dragging=false;};
        const move=(e:PointerEvent)=>{renderer.domElement.style.cursor=intersects(e)?'pointer':'grab';};
        const contextLost=(e:Event)=>{e.preventDefault();monitorMedia.setPlayback(false);lost=true;cancelAnimationFrame(frame);frame=0;delete host.dataset.ready;};
        const restored=()=>{lost=false;host.dataset.ready='true';wake();};
        host.addEventListener('pointerdown',down);host.addEventListener('pointerup',up);host.addEventListener('pointercancel',cancel);host.addEventListener('pointermove',move);
        renderer.domElement.addEventListener('webglcontextlost',contextLost);renderer.domElement.addEventListener('webglcontextrestored',restored);
        const wake=()=>{if(!frame&&visible&&!document.hidden&&!lost){frame=requestAnimationFrame(render);}};
        const visibilityChanged=()=>{monitorMedia.setPlayback(!document.hidden && visible && !pausedRef.current);if(document.hidden){cancelAnimationFrame(frame);frame=0;}else wake();};
        const observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;monitorMedia.setPlayback(visible && !document.hidden && !pausedRef.current);if(visible)wake();else{cancelAnimationFrame(frame);frame=0;}});observer.observe(host);
        document.addEventListener('visibilitychange',visibilityChanged);
        const zoomOverview = new THREE.Vector3(), cameraTarget = new THREE.Vector3();
        const orbitOffset = new THREE.Vector3(), zoomOrbit = new THREE.Spherical();
        const frontOrbit = new THREE.Spherical().setFromVector3(frontOverview.clone().sub(overviewTarget));
        const visitorOrbit = new THREE.Spherical();
        let ready = false, lastRender = 0;
        const render=(time:number)=>{frame=0;if(!visible||document.hidden||lost)return;
            const progress = reduced.matches ? 0 : progressRef.current;
            // Scroll and dragging render at the display rate; ambient motion stays bounded.
            if(ready && assembly===1 && !dragging && progress===lastProgress && time-lastRender<1000/30){wake();return;}
            lastRender=time;
            const delta=Math.min((time-previous)/1000,.05);previous=time;
            assembly=Math.min(1,assembly+delta/.9);
            if (assembly < 1) assemblyParts.forEach((part,index)=>{part.position.lerpVectors(assemblyOffsets[index],assemblyTargets[index],assembly);});
            if(!pausedRef.current&&!reduced.matches){elapsed+=delta;leaves.forEach((leaf,i)=>{leaf.rotation.z=Math.cos(i*2.4)*.8+Math.sin(elapsed*.7+i)*.035;});
                knot.rotation.y=elapsed*.25;knot.rotation.z=Math.sin(elapsed*.5)*.15;knot.position.y=4.35+Math.sin(elapsed)*.12;
                gem.rotation.y=-elapsed*.3;gem.position.y=4.7+Math.sin(elapsed*.8)*.12;orbit.rotation.z=elapsed*.15;ball.position.y=5.05+Math.sin(elapsed*.8)*.12;
            }
            // Move the projection rather than resizing/clearing the drawing buffer on scroll.
            const compact = viewportWidth < 1100;
            camera.fov = THREE.MathUtils.lerp(compact ? 55 : 45, 35, progress);
            camera.setViewOffset(viewportWidth, viewportHeight, -viewportWidth * (compact ? 0 : .08) * (1-progress), -viewportHeight * (compact ? .2 : .12) * (1-progress), viewportWidth, viewportHeight);
            monitorMedia.setPlayback(visible && !document.hidden && !pausedRef.current);
            const monitorTexture = monitorMedia.update(progress);
            if (screenMat.map !== monitorTexture) {screenMat.map = monitorTexture; screenMat.needsUpdate = true;}
            const visibleScreenHeight = camera.aspect > 1 ? Math.min(screenHeight, screenWidth / camera.aspect) : Math.max(screenHeight, screenWidth / camera.aspect);
            entryPosition.z = entryTarget.z + visibleScreenHeight / (2 * Math.tan(THREE.MathUtils.degToRad(35) / 2));
            controls.enabled = progress === 0;
            if (progress > 0) {
                // Return to the front before entering; an orbit behind the display must
                // never send the visitor through its blank casing.
                const align = THREE.MathUtils.smoothstep(progress, 0, .3);
                const zoom = THREE.MathUtils.smoothstep(progress, .15, 1);
                visitorOrbit.setFromVector3(orbitOffset.copy(overview).sub(overviewTarget));
                const angle = frontOrbit.theta - visitorOrbit.theta;
                zoomOrbit.set(THREE.MathUtils.lerp(visitorOrbit.radius, frontOrbit.radius, align), THREE.MathUtils.lerp(visitorOrbit.phi, frontOrbit.phi, align), visitorOrbit.theta + Math.atan2(Math.sin(angle), Math.cos(angle)) * align);
                zoomOverview.setFromSpherical(zoomOrbit).add(overviewTarget);
                camera.position.lerpVectors(zoomOverview, entryPosition, zoom);
                camera.lookAt(cameraTarget.lerpVectors(overviewTarget, entryTarget, zoom));
            } else {
                if (lastProgress > 0) reset();
                // Preserve a visitor's drag angle instead of overwriting it every frame.
                controls.update();
                overview.copy(camera.position);
            }
            lastProgress = progress;
            renderer.render(scene,camera);if(!ready){ready=true;host.dataset.ready='true';readyRef.current?.();}wake();};wake();
        return()=>{monitorMedia.dispose();themeObserver.disconnect();cancelAnimationFrame(frame);observer.disconnect();resizeObserver.disconnect();controls.dispose();resetRef.current=null;paletteRef.current=null;
            document.removeEventListener('visibilitychange',visibilityChanged);
            host.removeEventListener('pointerdown',down);host.removeEventListener('pointerup',up);host.removeEventListener('pointercancel',cancel);host.removeEventListener('pointermove',move);
            renderer.domElement.removeEventListener('webglcontextlost',contextLost);renderer.domElement.removeEventListener('webglcontextrestored',restored);
            geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());textures.forEach(t=>t.dispose());renderer.setAnimationLoop(null);renderer.dispose();renderer.forceContextLoss();renderer.domElement.remove();delete host.dataset.ready;release();};
    },[progressRef, available, claim]);
    return <div ref={hostRef} className="workspace-canvas" aria-hidden="true"/>;
}
