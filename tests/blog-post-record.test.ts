import {describe, expect, it} from "vitest";
import {
    blogPostRowToInternalBlogPost,
    internalBlogPostToRow,
    normalizeStoredBlogPost,
    parseStoredBlogPosts,
} from "@/lib/blog-post-record";
import type {InternalBlogPost} from "@/lib/internal-blog";

const post: InternalBlogPost = {
    id: "00000000-0000-4000-8000-000000000001",
    slug: "supabase-blog",
    title: "Supabase Blog",
    seoTitle: "Supabase Blog | The Adamant",
    excerpt: "A migration test.",
    content: "## Stored safely",
    coverImage: "https://project.supabase.co/storage/v1/object/public/blog_images/covers/cover.png",
    tags: ["Supabase", "SEO"],
    authorName: "The Adamant Team",
    createdAt: "2026-08-01T00:00:00.000Z",
    updatedAt: "2026-08-02T00:00:00.000Z",
    publishedAt: "2026-08-01T00:00:00.000Z",
};

describe("blog post record mapping", () => {
    it("maps camel-case posts to database rows with persisted cover URLs", () => {
        const row = internalBlogPostToRow(post);

        expect(row.seo_title).toBe(post.seoTitle);
        expect(row.author_name).toBe(post.authorName);
        expect(row.cover_image).toBe(post.coverImage);
        expect(blogPostRowToInternalBlogPost(row)).toEqual(post);
    });

    it("normalizes valid legacy JSON and rejects incomplete rows", () => {
        expect(normalizeStoredBlogPost(post)).toEqual(post);
        expect(normalizeStoredBlogPost({title: "Incomplete"})).toBeNull();
        expect(parseStoredBlogPosts(JSON.stringify([post, {title: "Incomplete"}]))).toHaveLength(1);
    });
});
