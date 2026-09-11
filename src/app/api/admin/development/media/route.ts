import {NextRequest, NextResponse} from "next/server";
import {crmErrorResponse, CrmApiError, getCrmRequestContext} from "@/lib/crm/auth";
import {canAccessDevelopment} from "@/features/crm/permissions";
import {evidenceExtension, requireDevId} from "@/lib/crm/development-validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const bucket = "dev-qa-evidence";

export async function POST(request: NextRequest) {
    try {
        const {client, actor} = await getCrmRequestContext(request);
        if (!canAccessDevelopment(actor.role)) throw new CrmApiError("Development access required.",403);
        if (Number(request.headers.get("content-length")) > 9 * 1024 * 1024) throw new CrmApiError("Images must be 8 MB or smaller.",413);
        const form = await request.formData();
        const project = requireDevId(form.get("project_id"));
        const {data: allowed,error: permissionError} = await client.rpc("dev_can_work",{p_project:project,capability:"qa"});
        if (permissionError || !allowed) throw new CrmApiError("You need a QA assignment for this project.",403);
        const file = form.get("file");
        if (!(file instanceof File) || !file.size || file.size > 8 * 1024 * 1024) throw new CrmApiError("Choose an image up to 8 MB.");
        const bytes = new Uint8Array(await file.arrayBuffer());
        const extension = evidenceExtension(bytes,file.type);
        const path = `${project}/${actor.id}/${crypto.randomUUID()}.${extension}`;
        const {error} = await client.storage.from(bucket).upload(path,bytes,{contentType:file.type,upsert:false});
        if (error) throw new CrmApiError("Screenshot could not be uploaded. Check your project assignment and storage setup.",400);
        return NextResponse.json({path});
    } catch (error) {
        const {message,status} = crmErrorResponse(error);
        return NextResponse.json({error:message},{status});
    }
}

export async function GET(request: NextRequest) {
    try {
        const {client, actor} = await getCrmRequestContext(request);
        if (!canAccessDevelopment(actor.role)) throw new CrmApiError("Development access required.",403);
        const path = request.nextUrl.searchParams.get("path") || "";
        requireDevId(path.split("/")[0]);
        if (path.includes("..") || path.length > 500) throw new CrmApiError("Invalid screenshot path.");
        // Download through the authenticated client so membership revocation is
        // respected immediately, including previously rendered image URLs.
        const {data,error} = await client.storage.from(bucket).download(path);
        if (error || !data) throw new CrmApiError("Screenshot unavailable.",404);
        return new NextResponse(data,{headers:{"Content-Type":data.type,"Cache-Control":"private, no-store","X-Content-Type-Options":"nosniff"}});
    } catch (error) {
        const {message,status} = crmErrorResponse(error);
        return NextResponse.json({error:message},{status});
    }
}
