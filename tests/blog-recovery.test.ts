import {describe, expect, it} from "vitest";
import {reconcileRecoveredBlogPosts} from "@/lib/blog-recovery";
import type {InternalBlogPost} from "@/lib/internal-blog";

function buildPost(overrides: Partial<InternalBlogPost>): InternalBlogPost {
    return {
        id: "00000000-0000-4000-8000-000000000001",
        slug: "article",
        title: "Article",
        excerpt: "Excerpt",
        content: "Content",
        coverImage: null,
        tags: ["SEO"],
        authorName: "The Adamant Team",
        createdAt: "2026-08-01T00:00:00.000Z",
        updatedAt: "2026-08-01T00:00:00.000Z",
        publishedAt: "2026-08-01T00:00:00.000Z",
        ...overrides,
    };
}

describe("blog recovery reconciliation", () => {
    it("keeps the newest row when the same id exists in both sources", () => {
        const recovered = buildPost({title: "Recovered", updatedAt: "2026-08-02T00:00:00.000Z"});
        const current = buildPost({
            title: "Current",
            coverImage: "https://project.supabase.co/storage/v1/object/public/blog_images/covers/current.webp",
            updatedAt: "2026-08-03T00:00:00.000Z",
        });
        const result = reconcileRecoveredBlogPosts([current], [recovered]);

        expect(result.posts).toHaveLength(1);
        expect(result.posts[0].title).toBe("Current");
        expect(result.posts[0].coverImage).toBe(current.coverImage);
    });

    it("preserves a historical slug and renames an interim conflicting post", () => {
        const historical = buildPost({id: "00000000-0000-4000-8000-000000000002", slug: "shared"});
        const interim = buildPost({id: "00000000-0000-4000-8000-000000000003", slug: "shared"});
        const result = reconcileRecoveredBlogPosts([interim], [historical]);

        expect(result.posts.find((post) => post.id === historical.id)?.slug).toBe("shared");
        expect(result.posts.find((post) => post.id === interim.id)?.slug).toBe("shared-2");
        expect(result.report.renamedCurrentSlugs).toEqual([
            {id: interim.id, from: "shared", to: "shared-2"},
        ]);
    });

    it("orders the merged result by publication date", () => {
        const older = buildPost({id: "00000000-0000-4000-8000-000000000004"});
        const newer = buildPost({
            id: "00000000-0000-4000-8000-000000000005",
            slug: "newer",
            publishedAt: "2026-08-04T00:00:00.000Z",
        });

        expect(reconcileRecoveredBlogPosts([newer], [older]).posts.map((post) => post.id)).toEqual([
            newer.id,
            older.id,
        ]);
    });
});
