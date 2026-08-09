import {NextRequest, NextResponse} from "next/server";
import {crmErrorResponse, CrmApiError, getCrmRequestContext} from "@/lib/crm/auth";
import {TASK_WITH_RELATIONS} from "@/lib/crm/queries";
import {parsePage, parseTaskInput} from "@/lib/crm/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
    try {
        const {client, actor} = await getCrmRequestContext(request);
        const {page, pageSize, from, to} = parsePage(request.nextUrl.searchParams);
        const tab = request.nextUrl.searchParams.get("tab") || "all";
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        let query = client.from("tasks").select(TASK_WITH_RELATIONS, {count: "exact"}).order("due_date").range(from, to);
        if (tab === "my") query = query.eq("assigned_to", actor.id).not("status", "in", "(completed,cancelled)");
        if (tab === "today") query = query.gte("due_date", today.toISOString()).lt("due_date", tomorrow.toISOString()).not("status", "in", "(completed,cancelled)");
        if (tab === "upcoming") query = query.gte("due_date", tomorrow.toISOString()).not("status", "in", "(completed,cancelled)");
        if (tab === "overdue") query = query.lt("due_date", new Date().toISOString()).not("status", "in", "(completed,cancelled)");
        if (tab === "completed") query = query.eq("status", "completed");
        const {data, error, count} = await query;
        if (error) throw new CrmApiError("Tasks could not be loaded.", 502);
        return NextResponse.json({tasks: data || [], pagination: {page, pageSize, total: count || 0, pages: Math.ceil((count || 0) / pageSize)}});
    } catch (error) {
        const {message, status} = crmErrorResponse(error);
        return NextResponse.json({error: message}, {status});
    }
}

export async function POST(request: NextRequest) {
    try {
        const {client, actor} = await getCrmRequestContext(request);
        const payload = await request.json() as Record<string, unknown>;
        const input = parseTaskInput(payload);
        if (actor.role === "sales") input.assigned_to = actor.id;
        const {data, error} = await client.from("tasks").insert({...input, created_by: actor.id}).select(TASK_WITH_RELATIONS).single();
        if (error) throw new CrmApiError(error.message, 400);
        return NextResponse.json({task: data}, {status: 201});
    } catch (error) {
        const {message, status} = crmErrorResponse(error);
        return NextResponse.json({error: message}, {status});
    }
}
