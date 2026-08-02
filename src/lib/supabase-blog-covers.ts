import {randomUUID} from "node:crypto";
import {BlogCoverStorageError} from "@/lib/blog-storage-error";
import {getSupabaseServerClient} from "@/lib/supabase-blog";

export const BLOG_COVER_MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
export const BLOG_COVER_ALLOWED_MIME_TYPES = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/avif",
] as const;

const BLOG_COVER_EXTENSIONS = new Map<string, string>([
    ["image/jpeg", "jpg"],
    ["image/png", "png"],
    ["image/webp", "webp"],
    ["image/avif", "avif"],
]);
const BLOG_COVER_OBJECT_DIRECTORY = "covers";
const DEFAULT_BLOG_COVERS_BUCKET = "blog_images";

export interface UploadedSupabaseBlogCover {
    bucket: string;
    path: string;
    url: string;
}

export function getSupabaseBlogCoversBucket() {
    return process.env.SUPABASE_BLOG_COVERS_BUCKET?.trim() || DEFAULT_BLOG_COVERS_BUCKET;
}

export function getBlogCoverExtension(contentType: string) {
    return BLOG_COVER_EXTENSIONS.get(contentType) ?? null;
}

export function hasValidBlogCoverSignature(bytes: Uint8Array, contentType: string) {
    if (contentType === "image/jpeg") {
        return startsWith(bytes, [0xff, 0xd8, 0xff]);
    }

    if (contentType === "image/png") {
        return startsWith(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    }

    if (contentType === "image/webp") {
        return ascii(bytes, 0, 4) === "RIFF" && ascii(bytes, 8, 12) === "WEBP";
    }

    if (contentType === "image/avif") {
        const header = ascii(bytes, 0, Math.min(bytes.length, 40));
        return ascii(bytes, 4, 8) === "ftyp" && /(?:avif|avis)/.test(header);
    }

    return false;
}

export async function uploadSupabaseBlogCover(
    bytes: Uint8Array,
    contentType: string,
): Promise<UploadedSupabaseBlogCover> {
    const extension = getBlogCoverExtension(contentType);

    if (!extension) {
        throw new BlogCoverStorageError("Unsupported blog cover image type.");
    }

    const client = getSupabaseServerClient();
    const bucket = getSupabaseBlogCoversBucket();
    const {data: bucketDetails, error: bucketError} = await client.storage.getBucket(bucket);

    if (bucketError) {
        throwCoverStorageError("inspect bucket", bucketError);
    }

    if (!bucketDetails.public) {
        throw new BlogCoverStorageError(
            `Supabase bucket ${bucket} must be public so published blog covers can be displayed.`,
        );
    }

    const objectPath = `${BLOG_COVER_OBJECT_DIRECTORY}/${Date.now()}-${randomUUID()}.${extension}`;
    const {error: uploadError} = await client.storage
        .from(bucket)
        .upload(objectPath, bytes, {
            cacheControl: "31536000",
            contentType,
            upsert: false,
        });

    if (uploadError) {
        throwCoverStorageError("upload", uploadError);
    }

    const {data} = client.storage.from(bucket).getPublicUrl(objectPath);

    return {
        bucket,
        path: objectPath,
        url: data.publicUrl,
    };
}

export async function removeSupabaseBlogCoverByUrl(coverImage?: string | null) {
    const objectPath = getManagedBlogCoverObjectPath(coverImage);

    if (!objectPath) {
        return false;
    }

    const bucket = getSupabaseBlogCoversBucket();
    const {error} = await getSupabaseServerClient().storage.from(bucket).remove([objectPath]);

    if (error) {
        throwCoverStorageError("delete", error);
    }

    return true;
}

export function getManagedBlogCoverObjectPath(coverImage?: string | null) {
    if (!coverImage) {
        return null;
    }

    try {
        const coverUrl = new URL(coverImage);
        const supabaseUrl = new URL(process.env.SUPABASE_URL || "");

        if (coverUrl.origin !== supabaseUrl.origin) {
            return null;
        }

        const bucket = getSupabaseBlogCoversBucket();
        const publicPrefix = `/storage/v1/object/public/${encodeURIComponent(bucket)}/`;

        if (!coverUrl.pathname.startsWith(publicPrefix)) {
            return null;
        }

        const encodedPath = coverUrl.pathname.slice(publicPrefix.length);
        const objectPath = encodedPath
            .split("/")
            .map((segment) => decodeURIComponent(segment))
            .join("/");

        return objectPath.startsWith(`${BLOG_COVER_OBJECT_DIRECTORY}/`) ? objectPath : null;
    } catch {
        return null;
    }
}

function startsWith(bytes: Uint8Array, expected: number[]) {
    return expected.every((value, index) => bytes[index] === value);
}

function ascii(bytes: Uint8Array, start: number, end: number) {
    return String.fromCharCode(...bytes.slice(start, end));
}

function throwCoverStorageError(operation: string, error: unknown): never {
    console.error(`Supabase blog cover ${operation} failed.`, error);
    throw new BlogCoverStorageError("Blog cover storage unavailable.", error);
}
