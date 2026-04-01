import {NextRequest} from "next/server";
import {getBlogBlob} from "@/lib/internal-blog";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
    _request: NextRequest,
    context: { params: Promise<{ pathname: string[] }> },
) {
    const {pathname = []} = await context.params;
    const blobPathname = pathname.map((segment) => decodeURIComponent(segment)).join("/");

    if (!blobPathname) {
        return new Response("Not found.", {status: 404});
    }

    try {
        const {result} = await getBlogBlob(blobPathname);

        if (!result || result.statusCode !== 200 || !result.stream) {
            return new Response("Not found.", {status: 404});
        }

        return new Response(result.stream, {
            status: 200,
            headers: {
                "Content-Type": result.blob.contentType || "application/octet-stream",
                "Cache-Control": result.blob.cacheControl || "public, max-age=31536000, immutable",
                "Content-Disposition": result.blob.contentDisposition || "inline",
            },
        });
    } catch {
        return new Response("Not found.", {status: 404});
    }
}
