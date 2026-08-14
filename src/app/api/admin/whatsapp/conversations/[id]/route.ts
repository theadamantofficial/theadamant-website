import {NextRequest, NextResponse} from "next/server";
import {crmErrorResponse, CrmApiError, getCrmRequestContext, requireCrmRoles} from "@/lib/crm/auth";
import {getCrmServiceClient} from "@/lib/crm/server-client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Context = {params: Promise<{id: string}>};

export async function PATCH(request: NextRequest, context: Context) {
    try {
        const {client, actor} = await getCrmRequestContext(request);
        const {id} = await context.params;
        const payload = await request.json() as {markRead?: unknown; assignedTo?: unknown};
        const accessible = await client.from("whatsapp_conversations")
            .select("id,lead_id,assigned_to").eq("id", id).maybeSingle();
        if (accessible.error) throw new CrmApiError("WhatsApp conversation could not be loaded.", 502);
        if (!accessible.data) throw new CrmApiError("WhatsApp conversation not found or unavailable.", 404);

        const serviceClient = getCrmServiceClient();
        if (payload.markRead === true) {
            const {error} = await serviceClient.from("whatsapp_conversations").update({unread_count: 0}).eq("id", id);
            if (error) throw new CrmApiError("The conversation could not be marked as read.", 502);
        }

        if (Object.prototype.hasOwnProperty.call(payload, "assignedTo")) {
            requireCrmRoles(actor, ["super_admin", "admin"]);
            const assignedTo = payload.assignedTo === null || payload.assignedTo === "" ? null : String(payload.assignedTo);
            if (assignedTo) {
                const profile = await client.from("profiles").select("id,active").eq("id", assignedTo).maybeSingle();
                if (profile.error || !profile.data?.active) throw new CrmApiError("Choose an active company member.");
            }

            if (accessible.data.lead_id) {
                const {error} = await client.from("leads").update({assigned_to: assignedTo}).eq("id", accessible.data.lead_id);
                if (error) throw new CrmApiError("The linked lead could not be reassigned.", 400);
            } else {
                const {error} = await serviceClient.from("whatsapp_conversations").update({assigned_to: assignedTo}).eq("id", id);
                if (error) throw new CrmApiError("The conversation could not be reassigned.", 502);
            }
        }

        const refreshed = await client.from("whatsapp_conversations")
            .select("id,lead_id,assigned_to,unread_count,status,updated_at").eq("id", id).maybeSingle();
        if (refreshed.error || !refreshed.data) throw new CrmApiError("The updated conversation could not be loaded.", 502);
        return NextResponse.json({conversation: refreshed.data});
    } catch (error) {
        const {message, status} = crmErrorResponse(error);
        return NextResponse.json({error: message}, {status});
    }
}
