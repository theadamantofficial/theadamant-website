import type {SupabaseClient} from "@supabase/supabase-js";
import type {Prospect} from "@/features/crm/types";
import {normalizeWhatsAppPhone} from "@/lib/crm/whatsapp";

export async function getProspectWhatsAppStatus(client: SupabaseClient, prospects: Prospect[]) {
    const destinations = new Map<number, string>();
    for (const prospect of prospects) {
        try {
            destinations.set(prospect.record_id, normalizeWhatsAppPhone(
                prospect.phone?.trim() || prospect.company_phone?.trim() || "", prospect.country,
            ));
        } catch { /* Invalid source phones cannot match a WhatsApp contact. */ }
    }
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID?.trim();
    if (!phoneNumberId || !destinations.size) return {prospects, whatsappStatusAvailable: Boolean(phoneNumberId)};
    const {data, error} = await client.rpc("prospect_whatsapp_contact_status", {
        p_phone_number_id: phoneNumberId, p_destinations: [...new Set(destinations.values())],
    });
    // A missing status migration must never mislabel existing contacts as unsent.
    if (error) return {prospects, whatsappStatusAvailable: false};
    const statuses = new Map((data as Array<{destination: string; conversation_id: string | null; initial_message_sent: boolean}> || [])
        .map((row) => [row.destination, row]));
    return {
        whatsappStatusAvailable: true,
        prospects: prospects.map((prospect) => {
            const row = statuses.get(destinations.get(prospect.record_id) || "");
            return {...prospect, whatsapp: row ? {
                conversationId: row.conversation_id, initialMessageSent: row.initial_message_sent,
            } : undefined};
        }),
    };
}
