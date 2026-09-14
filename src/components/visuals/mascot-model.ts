import * as THREE from "three";
import {RoundedBoxGeometry} from "three/addons/geometries/RoundedBoxGeometry.js";

/** Solid geometry throughout: the mascot retains its volume from every angle. */
export function createMascotModel() {
    const group = new THREE.Group();
    const geometries = new Set<THREE.BufferGeometry>();
    const materials = new Set<THREE.Material>();
    const material = (color: string, roughness = .8) => {
        const result = new THREE.MeshStandardMaterial({color, roughness});
        materials.add(result);
        return result;
    };
    const teal = material("#087f8c"), seam = material("#06616c"), lining = material("#04505b");
    const skin = material("#edb080"), ear = material("#d88f64"), hair = material("#422b25");
    const trousers = material("#30343a"), white = material("#f5f4ee"), sole = material("#d7dcd9");
    const black = material("#18272b"), screen = material("#84dad1", .35);
    const sphereGeometry = new THREE.SphereGeometry(1, 24, 16);
    geometries.add(sphereGeometry);
    const mesh = (geometry: THREE.BufferGeometry, mat: THREE.Material, position: number[], scale: number[] = [1, 1, 1], parent: THREE.Object3D = group) => {
        geometries.add(geometry);
        const result = new THREE.Mesh(geometry, mat);
        result.position.set(position[0], position[1], position[2]);
        result.scale.set(scale[0], scale[1], scale[2]);
        result.castShadow = true;
        result.receiveShadow = true;
        parent.add(result);
        return result;
    };
    const ellipsoid = (mat: THREE.Material, position: number[], scale: number[], parent?: THREE.Object3D) => mesh(sphereGeometry, mat, position, scale, parent);
    const box = (mat: THREE.Material, position: number[], size: number[], radius = .04, parent?: THREE.Object3D) =>
        mesh(new RoundedBoxGeometry(size[0], size[1], size[2], 3, radius), mat, position, [1, 1, 1], parent);
    const limb = (mat: THREE.Material, from: number[], to: number[], radius: number) => {
        const a = new THREE.Vector3(...from), b = new THREE.Vector3(...to);
        const result = mesh(new THREE.CapsuleGeometry(radius, a.distanceTo(b), 5, 12), mat, a.clone().add(b).multiplyScalar(.5).toArray());
        result.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.sub(a).normalize());
        return result;
    };

    // Sneakers, trouser legs and a thick, softly rounded hoodie.
    for (const x of [-.19, .19]) {
        box(sole, [x, .065, .10], [.32, .10, .56]);
        box(white, [x, .16, .07], [.30, .19, .48], .075);
        ellipsoid(white, [x, .23, -.04], [.13, .13, .16]);
        for (let i = 0; i < 3; i++) box(sole, [x, .257 - i * .015, .09 + i * .055], [.18, .017, .022], .006);
        limb(trousers, [x, .33, -.02], [x * .8, .91, 0], .125);
        ellipsoid(trousers, [x * .8, 1, 0], [.16, .22, .16]);
    }
    ellipsoid(teal, [0, 1.31, 0], [.34, .43, .235]);
    box(seam, [0, .98, .01], [.53, .10, .36]);
    ellipsoid(teal, [0, 1.13, .205], [.22, .135, .075]);
    limb(seam, [-.18, 1.22, .246], [-.10, 1.14, .272], .012);
    limb(seam, [.18, 1.22, .246], [.10, 1.14, .272], .012);
    ellipsoid(lining, [0, 1.65, -.12], [.28, .23, .19]);
    ellipsoid(teal, [0, 1.62, -.175], [.29, .24, .19]);
    for (const x of [-.065, .065]) {
        limb(white, [x, 1.66, .20], [x * 1.35, 1.40, .252], .009);
        ellipsoid(white, [x * 1.35, 1.39, .253], [.015, .035, .015]);
    }

    // The raised hand and fingers are individually modelled, including the thumb.
    limb(teal, [-.28, 1.58, 0], [-.48, 1.36, .02], .115);
    limb(teal, [-.48, 1.36, .02], [-.62, 1.73, .06], .105);
    limb(seam, [-.62, 1.70, .06], [-.63, 1.79, .06], .104);
    const hand = new THREE.Group();
    hand.position.set(-.65, 1.93, .06);
    hand.rotation.z = -.2;
    group.add(hand);
    ellipsoid(skin, [0, 0, 0], [.105, .14, .06], hand);
    for (let i = 0; i < 4; i++) {
        const finger = ellipsoid(skin, [-.084 + i * .053, .16 + (i === 1 || i === 2 ? .025 : 0), 0], [.024, .112, .027], hand);
        finger.rotation.z = .20 - i * .14;
    }
    ellipsoid(skin, [.12, -.005, .005], [.045, .085, .036], hand).rotation.z = -.85;

    // Bent arm holding a phone with a solid back, screen, camera and speaker.
    limb(teal, [.28, 1.57, 0], [.44, 1.22, .04], .115);
    limb(teal, [.44, 1.22, .04], [.46, 1.39, .32], .10);
    ellipsoid(skin, [.46, 1.43, .35], [.085, .10, .07]);
    const phone = new THREE.Group();
    phone.position.set(.47, 1.53, .39);
    phone.rotation.set(-.17, -.23, -.14);
    group.add(phone);
    box(black, [0, 0, 0], [.16, .30, .037], .018, phone);
    box(screen, [0, 0, .024], [.137, .25, .008], .012, phone);
    box(black, [0, .112, .031], [.05, .012, .006], .004, phone);
    ellipsoid(sole, [-.047, .103, -.024], [.02, .02, .007], phone);
    ellipsoid(skin, [-.063, -.071, .045], [.035, .065, .028], phone);
    for (let i = 0; i < 3; i++) box(white, [0, .045 - i * .04, .032], [.085, .012, .004], .002, phone);

    // Head, hair on the back and sides, expressive eyes, smile and a cap brim.
    ellipsoid(skin, [0, 1.72, .025], [.12, .16, .13]);
    ellipsoid(hair, [0, 2.02, -.055], [.285, .31, .25]);
    ellipsoid(skin, [0, 2.015, .043], [.263, .30, .24]);
    for (const x of [-.264, .264]) {
        ellipsoid(skin, [x, 2.025, .013], [.055, .086, .065]);
        ellipsoid(ear, [x * 1.055, 2.025, .037], [.025, .05, .033]);
        ellipsoid(hair, [x * .89, 2.11, -.024], [.075, .15, .17]);
    }
    for (const x of [-.093, .093]) {
        ellipsoid(white, [x, 2.059, .255], [.066, .078, .026]);
        ellipsoid(hair, [x + .01, 2.06, .278], [.034, .044, .012]);
        ellipsoid(black, [x + .01, 2.06, .287], [.022, .029, .007]);
        ellipsoid(white, [x, 2.075, .293], [.008, .011, .005]);
        ellipsoid(hair, [x, 2.158, .251], [.075, .018, .022]).rotation.z = x < 0 ? .10 : -.10;
    }
    ellipsoid(skin, [0, 2.002, .29], [.043, .054, .047]);
    ellipsoid(hair, [0, 1.921, .258], [.087, .049, .017]);
    ellipsoid(white, [0, 1.942, .275], [.066, .017, .006]);
    for (let i = 0; i < 7; i++) {
        const angle = i * Math.PI / 6;
        ellipsoid(hair, [Math.cos(angle) * .205, 2.21, .11 + Math.sin(angle) * .09], [.07, .07, .09]);
    }
    const crown = mesh(new THREE.SphereGeometry(1, 28, 16, 0, Math.PI * 2, 0, Math.PI / 2), teal, [0, 2.19, -.015], [.295, .235, .265]);
    crown.castShadow = true;
    ellipsoid(seam, [0, 2.185, -.015], [.303, .03, .273]);
    ellipsoid(teal, [0, 2.185, .25], [.325, .035, .27]).rotation.x = -.08;
    ellipsoid(seam, [0, 2.427, -.015], [.035, .025, .035]);
    const badge = mesh(new THREE.ConeGeometry(.055, .095, 3), white, [0, 2.29, .231]);
    badge.rotation.x = Math.PI / 2;

    return {group, dispose: () => {geometries.forEach(item => item.dispose()); materials.forEach(item => item.dispose());}};
}
