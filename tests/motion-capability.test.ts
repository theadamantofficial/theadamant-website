import {describe, expect, it} from "vitest";
import {getMotionCapability, getScrollStage} from "@/lib/motion-capability";

describe("getMotionCapability", () => {
    it("uses full motion for a standard device", () => {
        expect(getMotionCapability({
            deviceMemory: 8,
            effectiveType: "4g",
        })).toBe("full");
    });

    it("always honors reduced-motion preference", () => {
        expect(getMotionCapability({
            prefersReducedMotion: true,
            deviceMemory: 8,
            effectiveType: "4g",
        })).toBe("reduced");
    });

    it.each([
        {saveData: true},
        {effectiveType: "slow-2g"},
        {effectiveType: "2g"},
        {deviceMemory: 4},
    ])("uses lite motion for constrained signals: %o", (signals) => {
        expect(getMotionCapability(signals)).toBe("lite");
    });
});

describe("getScrollStage", () => {
    it("maps scroll progress to a reversible four-step sequence", () => {
        expect(getScrollStage(-0.2, 4)).toBe(0);
        expect(getScrollStage(0.249, 4)).toBe(0);
        expect(getScrollStage(0.25, 4)).toBe(1);
        expect(getScrollStage(0.5, 4)).toBe(2);
        expect(getScrollStage(0.75, 4)).toBe(3);
        expect(getScrollStage(1.4, 4)).toBe(3);
        expect(getScrollStage(0.5, 0)).toBe(0);
    });
});
