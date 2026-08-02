import {beforeEach, describe, expect, it, vi} from "vitest";
import {NextRequest} from "next/server";
import {BlogStorageUnavailableError} from "@/lib/blog-storage-error";

const blogMocks = vi.hoisted(() => ({
    createInternalBlogPost: vi.fn(),
    deleteInternalBlogPost: vi.fn(),
    listInternalBlogPosts: vi.fn(),
    notifyManualBlogChange: vi.fn(),
    updateInternalBlogPost: vi.fn(),
    verifyBlogAdminSessionToken: vi.fn(),
}));

vi.mock("next/cache", () => ({revalidatePath: vi.fn()}));
vi.mock("@/lib/internal-blog", () => ({
    BLOG_ADMIN_COOKIE_NAME: "theadamant-blog-admin",
    ...blogMocks,
}));

import {GET, POST} from "@/app/api/blog-admin/posts/route";

const storedPost = {
    id: "00000000-0000-4000-8000-000000000001",
    slug: "n8n-post",
    title: "n8n Post",
    excerpt: "Posted by automation.",
    content: "Content",
    coverImage: null,
    tags: ["SEO"],
    authorName: "The Adamant Team",
    createdAt: "2026-08-02T00:00:00.000Z",
    updatedAt: "2026-08-02T00:00:00.000Z",
    publishedAt: "2026-08-02T00:00:00.000Z",
};

describe("blog admin posts API", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        blogMocks.verifyBlogAdminSessionToken.mockReturnValue(true);
        blogMocks.createInternalBlogPost.mockResolvedValue(storedPost);
        blogMocks.notifyManualBlogChange.mockResolvedValue(undefined);
    });

    it("keeps unauthenticated reads protected", async () => {
        blogMocks.verifyBlogAdminSessionToken.mockReturnValue(false);

        const response = await GET(new NextRequest("http://localhost/api/blog-admin/posts"));

        expect(response.status).toBe(401);
    });

    it("returns 503 instead of a stale fallback when Supabase reads fail", async () => {
        blogMocks.listInternalBlogPosts.mockRejectedValue(new BlogStorageUnavailableError());

        const response = await GET(new NextRequest("http://localhost/api/blog-admin/posts"));

        expect(response.status).toBe(503);
        expect(await response.json()).toEqual({error: "Blog database unavailable."});
    });

    it("accepts the existing n8n payload and returns 201", async () => {
        const response = await POST(new NextRequest("http://localhost/api/blog-admin/posts", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Cookie: "theadamant-blog-admin=test-token",
            },
            body: JSON.stringify({
                title: "n8n Post",
                content: "<h1>Content</h1>",
                excerpt: "Posted by automation.",
                tags: "SEO",
                authorName: "The Adamant Team",
            }),
        }));

        expect(response.status).toBe(201);
        expect(blogMocks.createInternalBlogPost).toHaveBeenCalledWith({
            title: "n8n Post",
            content: "<h1>Content</h1>",
            excerpt: "Posted by automation.",
            coverImage: undefined,
            tags: "SEO",
            authorName: "The Adamant Team",
        });
    });

    it("returns 503 when Supabase cannot persist the post", async () => {
        blogMocks.createInternalBlogPost.mockRejectedValue(new BlogStorageUnavailableError());

        const response = await POST(new NextRequest("http://localhost/api/blog-admin/posts", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({title: "Unavailable", content: "Content"}),
        }));

        expect(response.status).toBe(503);
        expect(await response.json()).toEqual({error: "Blog database unavailable."});
        expect(blogMocks.notifyManualBlogChange).not.toHaveBeenCalled();
    });
});
