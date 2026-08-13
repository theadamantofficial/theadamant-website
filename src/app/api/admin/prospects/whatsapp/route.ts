import {NextRequest, NextResponse} from "next/server";
import {canViewProspectDatabase} from "@/features/crm/permissions";
import {crmErrorResponse, CrmApiError, getCrmRequestContext} from "@/lib/crm/auth";
import {getProspectById} from "@/lib/crm/prospect-database";
import {createWhatsAppUrl, normalizeWhatsAppPhone} from "@/lib/crm/whatsapp";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
    try {
        const {client, actor} = await getCrmRequestContext(request);
        if (!canViewProspectDatabase(actor)) {
            throw new CrmApiError("You do not have access to the lead database.", 403);
        }

        const payload = await request.json() as {recordId?: unknown; message?: unknown};
        const recordId = Number(payload.recordId);
        const message = typeof payload.message === "string" ? payload.message.trim() : "";
        if (!Number.isSafeInteger(recordId) || recordId <= 0) throw new CrmApiError("Choose a valid lead.");

        const prospect = await getProspectById(recordId);
        if (!prospect) throw new CrmApiError("Lead not found in the source database.", 404);
        const rawPhone = prospect.phone?.trim() || prospect.company_phone?.trim() || "";
        const destination = normalizeWhatsAppPhone(rawPhone, prospect.country);
        const url = createWhatsAppUrl(destination, message);

        const {error} = await client.from("prospect_outreach_events").insert({
            prospect_source: "usa_leads_sqlite",
            prospect_record_id: prospect.record_id,
            user_id: actor.id,
            channel: "whatsapp",
            destination,
            message_body: message,
            status: "initiated",
            metadata: {
                contact_name: prospect.name || prospect.contact_person,
                company_name: prospect.company_name || prospect.business_name,
                source_file: prospect.source_file,
            },
        });
        if (error) {
            throw new CrmApiError("The outreach event could not be logged. Apply the latest Supabase migration.", 503);
        }

        return NextResponse.json({url, status: "initiated"}, {status: 201});
    } catch (error) {
        const {message, status} = crmErrorResponse(error);
        return NextResponse.json({error: message}, {status});
    }
}
