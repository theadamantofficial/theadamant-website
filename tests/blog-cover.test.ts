import {describe, expect, it} from "vitest";
import {buildFallbackBlogCoverDataUrl} from "@/lib/ai-blog-cover";

describe("generated blog covers", () => {
    it("returns the same self-contained SVG for the same post", () => {
        const post = {
            title: "Deterministic covers",
            excerpt: "No external storage required.",
            tags: ["SEO", "Supabase"],
            slug: "deterministic-covers",
        };

        const first = buildFallbackBlogCoverDataUrl(post);
        const second = buildFallbackBlogCoverDataUrl(post);

        expect(first).toBe(second);
        expect(first).toMatch(/^data:image\/svg\+xml/);
        expect(decodeURIComponent(first)).toContain("Deterministic covers");
    });
});
