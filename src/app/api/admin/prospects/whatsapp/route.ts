import {NextRequest, NextResponse} from "next/server";
import {canAccessSales, canViewProspectDatabase} from "@/features/crm/permissions";
import {crmErrorResponse, CrmApiError, getCrmRequestContext} from "@/lib/crm/auth";
import {getProspectById} from "@/lib/crm/prospect-database";
import {normalizeWhatsAppPhone} from "@/lib/crm/whatsapp";
import {getCrmServiceClient} from "@/lib/crm/server-client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
    try {
        const {client, actor} = await getCrmRequestContext(request);
        if (!canViewProspectDatabase(actor) || !canAccessSales(actor.role)) {
            throw new CrmApiError("You do not have access to the lead database.", 403);
        }

        const payload = await request.json() as {recordId?: unknown};
        const recordId = Number(payload.recordId);
        if (!Number.isSafeInteger(recordId) || recordId <= 0) throw new CrmApiError("Choose a valid lead.");

        const prospect = await getProspectById(recordId, client);
        if (!prospect) throw new CrmApiError("Lead not found in the source database.", 404);
        const rawPhone = prospect.phone?.trim() || prospect.company_phone?.trim() || "";
        const destination = normalizeWhatsAppPhone(rawPhone, prospect.country);
        const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID?.trim();
        if (!phoneNumberId || !process.env.WHATSAPP_ACCESS_TOKEN?.trim()) {
            throw new CrmApiError("WhatsApp sending is not configured.", 503);
        }
        // New employee conversations belong to their creator. Existing assignments,
        // lead links and customer reply windows must survive duplicate preparation.
        const service = getCrmServiceClient();
        const inserted = await service.from("whatsapp_conversations").upsert({
            phone_number_id: phoneNumberId,
            whatsapp_business_account_id: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID?.trim() || null,
            wa_id: destination,
            contact_name: (prospect.name || prospect.contact_person || [prospect.first_name, prospect.last_name].filter(Boolean).join(" ")).slice(0, 300),
            lead_id: null,
            assigned_to: actor.role === "employee" ? actor.id : null,
        }, {onConflict: "phone_number_id,wa_id", ignoreDuplicates: true});
        if (inserted.error) throw new CrmApiError("The CRM conversation could not be prepared.", 502);
        const {data: conversation, error} = await client.from("whatsapp_conversations")
            .select("*").eq("phone_number_id", phoneNumberId).eq("wa_id", destination).maybeSingle();
        if (error) throw new CrmApiError("The CRM conversation could not be loaded.", 502);
        if (!conversation) throw new CrmApiError("This conversation is assigned to another team member. Ask an administrator to assign it to you.", 403);
        return NextResponse.json({conversation});
    } catch (error) {
        const {message, status} = crmErrorResponse(error);
        return NextResponse.json({error: message}, {status});
    }
}
