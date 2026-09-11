import {NextRequest, NextResponse} from "next/server";
import {crmErrorResponse, CrmApiError, getCrmRequestContext} from "@/lib/crm/auth";
import {canAccessDevelopment} from "@/features/crm/permissions";
import {requireDevId, validateDevelopmentMutation} from "@/lib/crm/development-validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
    try {
        const {client, actor} = await getCrmRequestContext(request);
        if (!canAccessDevelopment(actor.role)) throw new CrmApiError("Development access is required.", 403);
        const projectId = request.nextUrl.searchParams.get("project");
        if (projectId) requireDevId(projectId);
        // Explicit pagination avoids silently truncating unlimited QA sheets at
        // the Supabase default row limit. RLS scopes every page to this actor.
        async function allRows(table: string, order: string, project?: string) {
            const rows: Record<string, unknown>[] = [];
            for (let offset = 0; ; offset += 500) {
                let query = client.from(table).select("*").order(order).order("id").range(offset, offset + 499);
                if (project) query = query.eq("project_id", project);
                const {data, error} = await query;
                if (error) throw new CrmApiError("Development data could not be loaded. Check that the development migration is applied.", 502);
                rows.push(...data);
                if (data.length < 500) return rows;
            }
        }
        const [projects, profiles] = await Promise.all([
            allRows("dev_projects", "created_at"),
            client.from("profiles").select("id,full_name,email,role,active").in("role", ["super_admin","cto","developer","qa","developer_qa"]).order("full_name"),
        ]);
        if (profiles.error) throw new CrmApiError("Development team could not be loaded.", 502);
        if (projectId && !projects.some((project) => project.id === projectId)) throw new CrmApiError("Project not found or not assigned to you.", 404);
        let assignments: unknown[] = [];
        if (projectId) {
            const result = await client.from("dev_project_members").select("*").eq("project_id", projectId);
            if (result.error) throw new CrmApiError("Assignments could not be loaded.", 502);
            assignments = result.data;
        }
        const [sheets, issues, decisions, activity] = projectId ? await Promise.all([
            allRows("dev_qa_sheets", "created_at", projectId), allRows("dev_issues", "number", projectId),
            allRows("dev_decisions", "created_at", projectId),
            client.from("dev_activity").select("*").eq("project_id", projectId).order("created_at", {ascending: false}).limit(100).then(({data,error}) => {
                if (error) throw new CrmApiError("Activity could not be loaded.", 502);
                return data;
            }),
        ]) : [[],[],[],[]];
        return NextResponse.json({projects, members: profiles.data, assignments, sheets, issues, decisions, activity}, {headers: {"Cache-Control": "private, no-store"}});
    } catch (error) {
        const {message,status} = crmErrorResponse(error);
        return NextResponse.json({error:message},{status});
    }
}

export async function POST(request: NextRequest) {
    try {
        const {client, actor} = await getCrmRequestContext(request);
        if (!canAccessDevelopment(actor.role)) throw new CrmApiError("Development access is required.",403);
        const body = await request.text();
        if (body.length > 100000) throw new CrmApiError("This record is too large.",413);
        let input: unknown;
        try { input = JSON.parse(body); } catch { throw new CrmApiError("Invalid JSON request."); }
        const {rpc,payload} = validateDevelopmentMutation(input);
        const {data,error} = await client.rpc(rpc,{payload});
        if (error) throw new CrmApiError(error.message, error.code === "42501" ? 403 : error.code === "40001" ? 409 : error.code === "P0002" ? 404 : 400);
        return NextResponse.json({id:data});
    } catch (error) {
        const {message,status} = crmErrorResponse(error);
        return NextResponse.json({error:message},{status});
    }
}
