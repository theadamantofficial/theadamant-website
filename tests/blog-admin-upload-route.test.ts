import {beforeEach, describe, expect, it, vi} from "vitest";
import {NextRequest} from "next/server";

const uploadMocks = vi.hoisted(() => ({
    hasValidBlogCoverSignature: vi.fn(),
    uploadSupabaseBlogCover: vi.fn(),
    verifyBlogAdminSessionToken: vi.fn(),
}));

vi.mock("@/lib/internal-blog", () => ({
    BLOG_ADMIN_COOKIE_NAME: "theadamant-blog-admin",
    verifyBlogAdminSessionToken: uploadMocks.verifyBlogAdminSessionToken,
}));
vi.mock("@/lib/supabase-blog-covers", () => ({
    BLOG_COVER_MAX_FILE_SIZE_BYTES: 5 * 1024 * 1024,
    getBlogCoverExtension: (contentType: string) => contentType === "image/png" ? "png" : null,
    hasValidBlogCoverSignature: uploadMocks.hasValidBlogCoverSignature,
    uploadSupabaseBlogCover: uploadMocks.uploadSupabaseBlogCover,
}));

import {POST} from "@/app/api/blog-admin/upload/route";

describe("blog admin cover upload API", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        uploadMocks.verifyBlogAdminSessionToken.mockReturnValue(true);
        uploadMocks.hasValidBlogCoverSignature.mockReturnValue(true);
        uploadMocks.uploadSupabaseBlogCover.mockResolvedValue({
            bucket: "blog_images",
            path: "covers/test.png",
            url: "https://project.supabase.co/storage/v1/object/public/blog_images/covers/test.png",
        });
    });

    it("keeps unauthenticated uploads protected", async () => {
        uploadMocks.verifyBlogAdminSessionToken.mockReturnValue(false);

        const response = await POST(new NextRequest("http://localhost/api/blog-admin/upload", {
            method: "POST",
        }));

        expect(response.status).toBe(401);
        expect(uploadMocks.uploadSupabaseBlogCover).not.toHaveBeenCalled();
    });

    it("uploads a validated image through the server-only Supabase client", async () => {
        const formData = new FormData();
        formData.append("file", new File([
            new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
        ], "cover.png", {type: "image/png"}));

        const response = await POST(new NextRequest("http://localhost/api/blog-admin/upload", {
            method: "POST",
            headers: {Cookie: "theadamant-blog-admin=test-token"},
            body: formData,
        }));

        expect(response.status).toBe(200);
        expect(uploadMocks.uploadSupabaseBlogCover).toHaveBeenCalledWith(expect.any(Uint8Array), "image/png");
        expect(await response.json()).toMatchObject({
            bucket: "blog_images",
            path: "covers/test.png",
            storageMode: "supabase",
        });
    });

    it("rejects a file whose contents do not match its MIME type", async () => {
        uploadMocks.hasValidBlogCoverSignature.mockReturnValue(false);
        const formData = new FormData();
        formData.append("file", new File(["not an image"], "cover.png", {type: "image/png"}));

        const response = await POST(new NextRequest("http://localhost/api/blog-admin/upload", {
            method: "POST",
            body: formData,
        }));

        expect(response.status).toBe(400);
        expect(uploadMocks.uploadSupabaseBlogCover).not.toHaveBeenCalled();
    });
});
