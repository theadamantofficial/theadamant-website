import {afterEach, describe, expect, it} from "vitest";
import {buildFallbackBlogCoverDataUrl} from "@/lib/ai-blog-cover";
import {
    getManagedBlogCoverObjectPath,
    hasValidBlogCoverSignature,
} from "@/lib/supabase-blog-covers";

const originalSupabaseUrl = process.env.SUPABASE_URL;

afterEach(() => {
    if (originalSupabaseUrl === undefined) {
        delete process.env.SUPABASE_URL;
    } else {
        process.env.SUPABASE_URL = originalSupabaseUrl;
    }
    delete process.env.SUPABASE_BLOG_COVERS_BUCKET;
});

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

describe("Supabase blog covers", () => {
    it("recognizes supported image signatures instead of trusting only the MIME type", () => {
        expect(hasValidBlogCoverSignature(
            new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
            "image/png",
        )).toBe(true);
        expect(hasValidBlogCoverSignature(
            new TextEncoder().encode("not an image"),
            "image/png",
        )).toBe(false);
    });

    it("extracts only managed cover paths from the configured bucket", () => {
        process.env.SUPABASE_URL = "https://project.supabase.co";

        expect(getManagedBlogCoverObjectPath(
            "https://project.supabase.co/storage/v1/object/public/blog_images/covers/cover.webp",
        )).toBe("covers/cover.webp");
        expect(getManagedBlogCoverObjectPath(
            "https://external.example/cover.webp",
        )).toBeNull();
    });
});
