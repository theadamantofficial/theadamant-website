import {NextRequest, NextResponse} from "next/server";
import {
    BLOG_ADMIN_COOKIE_NAME,
    verifyBlogAdminSessionToken,
} from "@/lib/internal-blog";
import {
    BLOG_COVER_MAX_FILE_SIZE_BYTES,
    getBlogCoverExtension,
    hasValidBlogCoverSignature,
    uploadSupabaseBlogCover,
} from "@/lib/supabase-blog-covers";
import {
    isBlogCoverStorageError,
    isBlogStorageUnavailableError,
} from "@/lib/blog-storage-error";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
    if (!verifyBlogAdminSessionToken(request.cookies.get(BLOG_ADMIN_COOKIE_NAME)?.value)) {
        return NextResponse.json({error: "Unauthorized."}, {status: 401});
    }

    try {
        const formData = await request.formData();
        const file = formData.get("file");

        if (!(file instanceof File) || file.size === 0) {
            return NextResponse.json({error: "Upload a valid image file."}, {status: 400});
        }

        if (!getBlogCoverExtension(file.type)) {
            return NextResponse.json(
                {error: "Only JPG, PNG, WEBP, and AVIF files are supported."},
                {status: 400},
            );
        }

        if (file.size > BLOG_COVER_MAX_FILE_SIZE_BYTES) {
            return NextResponse.json(
                {error: "Cover image must be 5 MB or smaller."},
                {status: 400},
            );
        }

        const bytes = new Uint8Array(await file.arrayBuffer());

        if (!hasValidBlogCoverSignature(bytes, file.type)) {
            return NextResponse.json(
                {error: "The selected file does not match its image type."},
                {status: 400},
            );
        }

        const cover = await uploadSupabaseBlogCover(bytes, file.type);

        return NextResponse.json({
            url: cover.url,
            name: file.name,
            path: cover.path,
            bucket: cover.bucket,
            storageMode: "supabase",
        });
    } catch (error) {
        const isUnavailable = isBlogCoverStorageError(error) || isBlogStorageUnavailableError(error);
        const message = error instanceof Error ? error.message : "Cover image upload failed.";

        return NextResponse.json(
            {error: message},
            {status: isUnavailable ? 503 : 500},
        );
    }
}
