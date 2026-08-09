import {NextRequest, NextResponse} from "next/server";
import type {Activity, CrmTask, Lead, LeadNote} from "@/features/crm/types";
import {crmErrorResponse, CrmApiError, getCrmRequestContext, requireCrmRoles} from "@/lib/crm/auth";
import {ACTIVITY_WITH_RELATIONS, LEAD_WITH_RELATIONS, PROFILE_SUMMARY_COLUMNS, TASK_WITH_RELATIONS} from "@/lib/crm/queries";
import {parseLeadInput} from "@/lib/crm/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Context = {params: Promise<{id: string}>};

export async function GET(request: NextRequest, context: Context) {
    try {
        const {client} = await getCrmRequestContext(request);
        const {id} = await context.params;
        const [leadResult, notesResult, tasksResult, activitiesResult] = await Promise.all([
            client.from("leads").select(LEAD_WITH_RELATIONS).eq("id", id).maybeSingle(),
            client.from("lead_notes").select(`id,lead_id,created_by,note,created_at,updated_at,author:profiles!lead_notes_created_by_fkey(${PROFILE_SUMMARY_COLUMNS})`).eq("lead_id", id).order("created_at", {ascending: false}),
            client.from("tasks").select(TASK_WITH_RELATIONS).eq("lead_id", id).order("due_date"),
            client.from("activities").select(ACTIVITY_WITH_RELATIONS).eq("lead_id", id).order("created_at", {ascending: false}).limit(100),
        ]);
        const error = leadResult.error || notesResult.error || tasksResult.error || activitiesResult.error;
        if (error) throw new CrmApiError("Lead details could not be loaded.", 502);
        if (!leadResult.data) throw new CrmApiError("Lead not found.", 404);
        return NextResponse.json({lead: leadResult.data as unknown as Lead, notes: (notesResult.data || []) as unknown as LeadNote[], tasks: (tasksResult.data || []) as unknown as CrmTask[], activities: (activitiesResult.data || []) as unknown as Activity[]});
    } catch (error) {
        const {message, status} = crmErrorResponse(error);
        return NextResponse.json({error: message}, {status});
    }
}

export async function PATCH(request: NextRequest, context: Context) {
    try {
        const {client, actor} = await getCrmRequestContext(request);
        const {id} = await context.params;
        const payload = await request.json() as Record<string, unknown>;
        const input = actor.role === "employee"
            ? parseEmployeeLeadStatusInput(payload)
            : parseLeadInput(payload, true);
        const {data, error} = await client.from("leads").update(input).eq("id", id).select(LEAD_WITH_RELATIONS).maybeSingle();
        if (error) throw new CrmApiError(error.message, 400);
        if (!data) throw new CrmApiError("Lead not found or unavailable.", 404);
        return NextResponse.json({lead: data});
    } catch (error) {
        const {message, status} = crmErrorResponse(error);
        return NextResponse.json({error: message}, {status});
    }
}

function parseEmployeeLeadStatusInput(payload: Record<string, unknown>) {
    const keys = Object.keys(payload);
    if (keys.length !== 1 || keys[0] !== "status") {
        throw new CrmApiError("Employees can only change the status of leads assigned to them.", 403);
    }
    return parseLeadInput({status: payload.status}, true);
}

export async function DELETE(request: NextRequest, context: Context) {
    try {
        const {client, actor} = await getCrmRequestContext(request);
        requireCrmRoles(actor, ["super_admin", "admin"]);
        const {id} = await context.params;
        const {error} = await client.from("leads").delete().eq("id", id);
        if (error) throw new CrmApiError("Lead could not be deleted.", 400);
        return NextResponse.json({deleted: true});
    } catch (error) {
        const {message, status} = crmErrorResponse(error);
        return NextResponse.json({error: message}, {status});
    }
}
