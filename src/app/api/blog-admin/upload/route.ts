import {randomUUID} from "node:crypto";
import {mkdir, writeFile} from "node:fs/promises";
import path from "node:path";
import {put} from "@vercel/blob";
import {NextRequest, NextResponse} from "next/server";
import {
    BLOG_ADMIN_COOKIE_NAME,
    getBlobReadWriteToken,
    isBlobStorageConfigured,
    verifyBlogAdminSessionToken,
} from "@/lib/internal-blog";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const UPLOAD_DIRECTORY = path.join(process.cwd(), "public/uploads/blog-covers");
const ALLOWED_MIME_TYPES = new Map([
    ["image/jpeg", "jpg"],
    ["image/png", "png"],
    ["image/webp", "webp"],
    ["image/avif", "avif"],
]);
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;

export async function POST(request: NextRequest) {
    try {
        if (!verifyBlogAdminSessionToken(request.cookies.get(BLOG_ADMIN_COOKIE_NAME)?.value)) {
            return NextResponse.json({error: "Unauthorized."}, {status: 401});
        }

        const formData = await request.formData();
        const file = formData.get("file");

        if (!(file instanceof File)) {
            return NextResponse.json({error: "Upload a valid image file."}, {status: 400});
        }

        const extension = ALLOWED_MIME_TYPES.get(file.type);

        if (!extension) {
            return NextResponse.json(
                {error: "Only JPG, PNG, WEBP, and AVIF files are supported."},
                {status: 400},
            );
        }

        if (file.size > MAX_FILE_SIZE_BYTES) {
            return NextResponse.json(
                {error: "Cover image must be 5MB or smaller."},
                {status: 400},
            );
        }

        const fileName = `${Date.now()}-${randomUUID()}.${extension}`;

        if (isBlobStorageConfigured()) {
            const blob = await put(`blog/covers/${fileName}`, file, {
                access: "public",
                addRandomSuffix: false,
                allowOverwrite: true,
                cacheControlMaxAge: 60 * 60 * 24 * 365,
                contentType: file.type,
                token: getBlobReadWriteToken(),
            });

            return NextResponse.json({
                url: blob.url,
                name: file.name,
                storageMode: "blob",
            });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        await mkdir(UPLOAD_DIRECTORY, {recursive: true});
        await writeFile(path.join(UPLOAD_DIRECTORY, fileName), buffer);

        return NextResponse.json({
            url: `/uploads/blog-covers/${fileName}`,
            name: file.name,
            storageMode: "filesystem",
        });
    } catch (error) {
        const detail = error instanceof Error ? error.message : "Unknown upload error.";
        return NextResponse.json(
            {
                error: "Cover image upload failed.",
                detail,
            },
            {status: 500},
        );
    }
}
