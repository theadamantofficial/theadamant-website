import {NextRequest, NextResponse} from "next/server";
import {crmErrorResponse, CrmApiError, getCrmRequestContext, requireCrmRoles} from "@/lib/crm/auth";
import {getCrmServiceClient} from "@/lib/crm/server-client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CONVERSATION_SELECT = [
    "id",
    "whatsapp_business_account_id",
    "phone_number_id",
    "wa_id",
    "contact_name",
    "lead_id",
    "assigned_to",
    "status",
    "unread_count",
    "customer_service_window_expires_at",
    "last_message_at",
    "last_message_preview",
    "last_message_direction",
    "created_at",
    "updated_at",
    "lead:leads!whatsapp_conversations_lead_id_fkey(id,customer_name,phone,email,company_name,status,assigned_to)",
    "assigned_profile:profiles!whatsapp_conversations_assigned_to_fkey(id,full_name,email,avatar_url)",
].join(",");

export async function POST(request: NextRequest) {
    try {
        const {actor} = await getCrmRequestContext(request);
        requireCrmRoles(actor, ["super_admin", "admin"]);
        const payload = await request.json() as {phone?: unknown; name?: unknown};
        const raw = typeof payload.phone === "string" ? payload.phone.trim() : "";
        if (!/^\+[1-9][\d ()-]+$/.test(raw)) throw new CrmApiError("Enter an international phone number starting with + and its country code.");
        const phone = raw.replace(/\D/g, "");
        if (!/^[1-9]\d{7,14}$/.test(phone)) throw new CrmApiError("Enter a valid international phone number.");
        const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID?.trim();
        if (!phoneNumberId) throw new CrmApiError("WhatsApp sending is not configured.", 503);
        const client = getCrmServiceClient();
        // Ignore duplicates so an existing contact's assignment and reply window survive.
        const inserted = await client.from("whatsapp_conversations").upsert({
            phone_number_id: phoneNumberId,
            whatsapp_business_account_id: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID?.trim() || null,
            wa_id: phone,
            contact_name: typeof payload.name === "string" ? payload.name.trim().slice(0, 300) : "",
            lead_id: null,
            assigned_to: null,
        }, {onConflict: "phone_number_id,wa_id", ignoreDuplicates: true});
        if (inserted.error) throw new CrmApiError("The conversation could not be created.", 502);
        const result = await client.from("whatsapp_conversations").select(CONVERSATION_SELECT)
            .eq("phone_number_id", phoneNumberId).eq("wa_id", phone).single();
        if (result.error) throw new CrmApiError("The conversation could not be loaded.", 502);
        return NextResponse.json({conversation: result.data});
    } catch (error) {
        const {message, status} = crmErrorResponse(error);
        return NextResponse.json({error: message}, {status});
    }
}

export async function GET(request: NextRequest) {
    try {
        const {client} = await getCrmRequestContext(request);
        const leadId = request.nextUrl.searchParams.get("leadId")?.trim() || "";
        let query = client.from("whatsapp_conversations")
            .select(CONVERSATION_SELECT)
            .order("last_message_at", {ascending: false, nullsFirst: false})
            .limit(200);
        if (leadId) query = query.eq("lead_id", leadId);
        const {data, error} = await query;
        if (error) throw new CrmApiError("WhatsApp conversations could not be loaded. Apply the latest Supabase migration.", 502);
        return NextResponse.json({conversations: data || []});
    } catch (error) {
        const {message, status} = crmErrorResponse(error);
        return NextResponse.json({error: message}, {status});
    }
}
