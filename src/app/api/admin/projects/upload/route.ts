import {randomUUID} from "node:crypto";
import {NextRequest, NextResponse} from "next/server";
import {authorizeContentAdmin} from "@/lib/admin-content";
import {CrmApiError, crmErrorResponse} from "@/lib/crm/errors";
import {getCrmServiceClient} from "@/lib/crm/server-client";
import {getBlogCoverExtension, hasValidBlogCoverSignature} from "@/lib/supabase-blog-covers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
    try {
        await authorizeContentAdmin(request);
        if (Number(request.headers.get("content-length")) > 4.5 * 1024 * 1024) throw new CrmApiError("Screenshot must be 4 MB or smaller.", 413);
        const file = (await request.formData()).get("file");
        if (!(file instanceof File) || !file.size) throw new CrmApiError("Choose an image to upload.");
        const extension = getBlogCoverExtension(file.type);
        if (!extension) throw new CrmApiError("Choose a JPG, PNG, WebP, or AVIF image.");
        if (file.size > 4 * 1024 * 1024) throw new CrmApiError("Screenshot must be 4 MB or smaller.", 413);
        const bytes = new Uint8Array(await file.arrayBuffer());
        if (!hasValidBlogCoverSignature(bytes, file.type)) throw new CrmApiError("Image contents do not match the file type.");
        const bucket = getCrmServiceClient().storage.from("project_images");
        const path = `screenshots/${randomUUID()}.${extension}`;
        const {error} = await bucket.upload(path, bytes, {contentType: file.type, cacheControl: "31536000", upsert: false});
        if (error) throw new CrmApiError("Screenshot could not be uploaded. Please try again.", 503);
        return NextResponse.json({url: bucket.getPublicUrl(path).data.publicUrl}, {status: 201});
    } catch (error) {
        const {message, status} = crmErrorResponse(error);
        return NextResponse.json({error: message}, {status});
    }
}
