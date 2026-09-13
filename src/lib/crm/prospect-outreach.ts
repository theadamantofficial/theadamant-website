import type {SupabaseClient} from "@supabase/supabase-js";
import type {CrmActor} from "@/features/crm/types";
import {canAccessSales, canViewProspectDatabase} from "@/features/crm/permissions";
import {CrmApiError} from "@/lib/crm/errors";
import {getProspectById} from "@/lib/crm/prospect-database";
import {normalizeWhatsAppPhone} from "@/lib/crm/whatsapp";

// Resolve the source again at send time; never trust a browser-supplied phone
// or allow an outreach record to refer to a different CRM conversation.
export async function getProspectOutreach(client: SupabaseClient, actor: CrmActor, recordId: unknown, conversation: {id: string; wa_id: string}, body: string) {
    if (recordId === undefined) return null;
    if (!canAccessSales(actor.role) || !canViewProspectDatabase(actor)) {
        throw new CrmApiError("You do not have access to send messages from the lead database.", 403);
    }
    if (typeof recordId !== "number" || !Number.isSafeInteger(recordId) || recordId <= 0) {
        throw new CrmApiError("Choose a valid source lead.");
    }
    const prospect = await getProspectById(recordId, client);
    if (!prospect) throw new CrmApiError("Lead not found in the source database.", 404);
    const destination = normalizeWhatsAppPhone(prospect.phone?.trim() || prospect.company_phone?.trim() || "", prospect.country);
    if (destination !== conversation.wa_id) throw new CrmApiError("This conversation does not match the selected lead.", 409);
    return {
        prospect_source: "usa_leads_sqlite",
        prospect_record_id: prospect.record_id,
        user_id: actor.id,
        channel: "whatsapp",
        destination,
        message_body: body,
        status: "initiated",
        metadata: {
            conversation_id: conversation.id,
            contact_name: prospect.name || prospect.contact_person,
            company_name: prospect.company_name || prospect.business_name,
            source_file: prospect.source_file,
        },
    };
}
