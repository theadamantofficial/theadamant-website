import {NextRequest, NextResponse} from "next/server";
import {crmErrorResponse, CrmApiError} from "@/lib/crm/errors";
import {authorizeContentAdmin, contentRecordId, readContentPayload} from "@/lib/admin-content";
import {getCrmServiceClient} from "@/lib/crm/server-client";
import {parseProject, parseProjectStatus, PROJECT_PUBLIC_FIELDS, projectFromRecord} from "@/lib/projects";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const FIELDS = `${PROJECT_PUBLIC_FIELDS},status,sort_order`;
function errorResponse(error: unknown) {
    const {message, status} = crmErrorResponse(error);
    return NextResponse.json({error: message}, {status});
}

export async function GET(request: NextRequest) {
    try {
        await authorizeContentAdmin(request);
        const {data, error} = await getCrmServiceClient().from("projects").select(FIELDS)
            .order("sort_order").order("created_at", {ascending: false}).limit(200);
        if (error) throw new CrmApiError("Projects could not be loaded.", 503);
        return NextResponse.json({projects: (data || []).map(projectFromRecord)}, {headers: {"Cache-Control": "no-store"}});
    } catch (error) { return errorResponse(error); }
}

export async function POST(request: NextRequest) {
    try {
        const actor = await authorizeContentAdmin(request);
        const input = parseProject(await readContentPayload(request));
        const {data, error} = await getCrmServiceClient().from("projects")
            .insert({...input, created_by: actor.id}).select(FIELDS).single();
        if (error) throw new CrmApiError("Project could not be saved.", 503);
        return NextResponse.json({project: projectFromRecord(data)}, {status: 201});
    } catch (error) { return errorResponse(error); }
}

export async function PATCH(request: NextRequest) {
    try {
        await authorizeContentAdmin(request);
        const payload = await readContentPayload(request);
        const id = contentRecordId(payload.id);
        const input = payload.name === undefined ? {status: parseProjectStatus(payload.status)} : parseProject(payload);
        const {data, error} = await getCrmServiceClient().from("projects")
            .update({...input, updated_at: new Date().toISOString()}).eq("id", id).select(FIELDS).maybeSingle();
        if (error) throw new CrmApiError("Project could not be updated.", 503);
        if (!data) throw new CrmApiError("Project not found.", 404);
        return NextResponse.json({project: projectFromRecord(data)});
    } catch (error) { return errorResponse(error); }
}

export async function DELETE(request: NextRequest) {
    try {
        await authorizeContentAdmin(request);
        const id = contentRecordId((await readContentPayload(request)).id);
        const {data, error} = await getCrmServiceClient().from("projects")
            .delete().eq("id", id).select("id").maybeSingle();
        if (error) throw new CrmApiError("Project could not be deleted.", 503);
        if (!data) throw new CrmApiError("Project not found.", 404);
        return NextResponse.json({success: true});
    } catch (error) { return errorResponse(error); }
}
