import {NextRequest, NextResponse} from "next/server";
import {crmErrorResponse, CrmApiError, getCrmRequestContext, requireCrmRoles} from "@/lib/crm/auth";
import {getCrmServiceClient} from "@/lib/crm/server-client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Context = {params: Promise<{id: string}>};

export async function DELETE(request: NextRequest, context: Context) {
    try {
        const {client, actor} = await getCrmRequestContext(request);
        requireCrmRoles(actor, ["super_admin", "admin"]);
        const {id} = await context.params;
        const payload = await request.json() as {confirmed?: unknown; expectedLeadId?: unknown};
        if (payload.confirmed !== true) throw new CrmApiError("Confirm deletion of the chat and linked lead.");
        const result = await client.from("whatsapp_conversations").select("id,lead_id").eq("id", id).maybeSingle();
        if (result.error) throw new CrmApiError("Conversation could not be checked.", 502);
        if (!result.data) throw new CrmApiError("Conversation not found.", 404);
        if (payload.expectedLeadId !== result.data.lead_id) throw new CrmApiError("Linked lead changed. Refresh and confirm deletion again.", 409);
        const deleted = await getCrmServiceClient().rpc("delete_whatsapp_chat", {p_id: id, p_expected_lead_id: result.data.lead_id});
        if (deleted.error) throw new CrmApiError("Chat deletion failed. Ensure the latest database migration is applied, then refresh and retry.", 502);
        return NextResponse.json({deleted: true});
    } catch (error) {
        const {message, status} = crmErrorResponse(error);
        return NextResponse.json({error: message}, {status});
    }
}

export async function PATCH(request: NextRequest, context: Context) {
    try {
        const {client, actor} = await getCrmRequestContext(request);
        const {id} = await context.params;
        const payload = await request.json() as {markRead?: unknown; assignedTo?: unknown; createLead?: unknown};
        const accessible = await client.from("whatsapp_conversations")
            .select("id,lead_id,assigned_to,wa_id,contact_name").eq("id", id).maybeSingle();
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

        if (payload.createLead === true) {
            requireCrmRoles(actor, ["super_admin", "admin"]);
            if (!accessible.data.lead_id) {
                const reference = `whatsapp:${accessible.data.wa_id}`;
                const existing = await client.from("leads").select("id").eq("external_reference", reference).maybeSingle();
                if (existing.error) throw new CrmApiError("An existing WhatsApp lead could not be checked.", 502);
                let leadId = existing.data?.id ? String(existing.data.id) : "";
                if (!leadId) {
                    const contactName = String(accessible.data.contact_name || "").trim() || `WhatsApp contact ${String(accessible.data.wa_id).slice(-4)}`;
                    const inserted = await client.from("leads").insert({
                        customer_name: contactName,
                        phone: `+${accessible.data.wa_id}`,
                        email: null,
                        company_name: null,
                        service_required: "Other",
                        lead_source: "whatsapp",
                        status: "new",
                        estimated_value: 0,
                        assigned_to: accessible.data.assigned_to,
                        next_followup: null,
                        priority: "medium",
                        description: "Created manually from a WhatsApp conversation.",
                        external_reference: reference,
                        origin_metadata: {channel: "whatsapp", promoted_manually: true},
                        created_by: actor.id,
                    }).select("id").single();
                    if (inserted.error || !inserted.data) throw new CrmApiError(inserted.error?.message || "The WhatsApp contact could not be made into a lead.", 400);
                    leadId = String(inserted.data.id);
                }
                const {error} = await serviceClient.from("whatsapp_conversations").update({lead_id: leadId}).eq("id", id);
                if (error) throw new CrmApiError("The new lead could not be linked to this conversation.", 502);
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
