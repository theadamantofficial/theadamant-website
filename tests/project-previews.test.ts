import {existsSync} from "node:fs";
import path from "node:path";
import {describe, expect, it} from "vitest";
import {getProjectPreview} from "@/lib/project-previews";

describe("captured project previews", () => {
    it.each([
        ["https://prep-vista-five.vercel.app/", "prepvista"],
        ["https://aetherseo.com/en", "aetherseo"],
        ["https://aetherseo.com/en/?utm_source=portfolio", "aetherseo"],
        ["https://aetherseo.com/", "aetherseo"],
        ["https://bakery-shop-beta.vercel.app/", "bakery-shop"],
    ])("uses a bundled screenshot for %s when the database image is blank", (href, name) => {
        const preview = getProjectPreview({href, image: "", name});
        expect(preview.image).toBe(`/images/work/${name}.png`);
        expect(preview.imageAlt).not.toBe("");
        expect(existsSync(path.join(process.cwd(), "public", preview.image))).toBe(true);
    });
    it("preserves custom admin screenshots", () => {
        expect(getProjectPreview({href: "https://aetherseo.com/en", image: "https://cdn.example.com/custom.png", imageAlt: "Custom screenshot"}))
            .toEqual({image: "https://cdn.example.com/custom.png", imageAlt: "Custom screenshot"});
    });
    it("does not use unrelated site screenshots for unknown URLs or other project pages", () => {
        for (const href of ["https://example.com", "https://aetherseo.com/login", "https://aetherseo.com.attacker.example/en", "http://aetherseo.com/en", "https://user:password@aetherseo.com/en", "invalid"]) {
            expect(getProjectPreview({href, image: ""}).image).toBe("");
        }
    });
});
