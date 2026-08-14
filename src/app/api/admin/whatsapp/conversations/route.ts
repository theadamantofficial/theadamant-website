import {NextRequest, NextResponse} from "next/server";
import {crmErrorResponse, CrmApiError, getCrmRequestContext} from "@/lib/crm/auth";

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
