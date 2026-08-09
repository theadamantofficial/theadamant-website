import {NextRequest, NextResponse} from "next/server";
import {crmErrorResponse, CrmApiError, getCrmRequestContext} from "@/lib/crm/auth";
import {TASK_WITH_RELATIONS} from "@/lib/crm/queries";
import {parseTaskInput} from "@/lib/crm/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH(request: NextRequest, context: {params: Promise<{id: string}>}) {
    try {
        const {client, actor} = await getCrmRequestContext(request);
        const {id} = await context.params;
        const payload = await request.json() as Record<string, unknown>;
        const input = parseTaskInput(payload, true);
        if (actor.role === "sales") delete input.assigned_to;
        if (input.status === "completed") input.completed_at = new Date().toISOString();
        else if (Object.hasOwn(input, "status")) input.completed_at = null;
        const {data, error} = await client.from("tasks").update(input).eq("id", id).select(TASK_WITH_RELATIONS).maybeSingle();
        if (error) throw new CrmApiError(error.message, 400);
        if (!data) throw new CrmApiError("Task not found.", 404);
        return NextResponse.json({task: data});
    } catch (error) {
        const {message, status} = crmErrorResponse(error);
        return NextResponse.json({error: message}, {status});
    }
}
