import {describe, expect, it} from "vitest";
import {TearableCloth} from "../src/components/visuals/tearable-cloth";

describe("tearable cover", () => {
    it("stays fully opaque and still until the user interacts", () => {
        const cloth = new TearableCloth(3.2, 2, 42, 26);
        const initial = cloth.positions.slice();
        for (let i = 0; i < 180; i++) cloth.step();
        expect(cloth.positions).toEqual(initial);
        expect(cloth.brokenCount).toBe(0);
        expect(cloth.drawCount).toBe(42 * 26 * 6);
    });
    it("puckers at arbitrary grab locations before tearing", () => {
        const cloth = new TearableCloth(3.2, 2, 42, 26);
        cloth.grab(1, -.65, .25, .15);
        for (let i = 0; i < 5; i++) cloth.step();
        expect(cloth.positions.some((value, index) => index % 3 === 2 && value > .01)).toBe(true);
        expect(cloth.brokenCount).toBe(0);
    });
    it("keeps holes after release and subsequent grabs", () => {
        const cloth = new TearableCloth(3.2, 2, 42, 26);
        cloth.grab(1, 0, 0, .15);
        cloth.move(1, .8, .4);
        for (let i = 0; i < 20; i++) cloth.step();
        expect(cloth.brokenCount).toBeGreaterThan(0);
        const facesAfterTear = cloth.drawCount;
        expect(facesAfterTear).toBeLessThan(42 * 26 * 6);
        cloth.release(1);
        for (let i = 0; i < 90; i++) cloth.step();
        expect(cloth.drawCount).toBeLessThanOrEqual(facesAfterTear);
        cloth.grab(2, -.7, -.3, .15);
        cloth.step();
        expect(cloth.drawCount).toBeLessThanOrEqual(facesAfterTear);
    });
    it("tears under a gradual human pull, not only a single large jump", () => {
        const cloth = new TearableCloth(3.2, 2, 42, 26);
        cloth.grab(1, -.25, .1, .4);
        for (let frame = 1; frame <= 90; frame++) {
            cloth.move(1, -.25 + frame * .008, .1 - frame * .004);
            cloth.step();
        }
        expect(cloth.brokenCount).toBeGreaterThan(0);
    });
    it("supports simultaneous touch grabs and lets detached fabric fall away", () => {
        const cloth = new TearableCloth(.9, 2, 18, 26);
        cloth.grab(1, -.2, .3, .15);
        cloth.grab(2, .2, -.3, .15);
        cloth.release(1);
        expect(cloth.hasGrabs).toBe(true);
        cloth.drop();
        expect(cloth.hasGrabs).toBe(false);
        expect(cloth.pins.every(pin => pin === 0)).toBe(true);
        for (let i = 0; i < 180; i++) cloth.step();
        expect(cloth.offscreen).toBe(true);
        expect(cloth.positions.every(Number.isFinite)).toBe(true);
    });
});
