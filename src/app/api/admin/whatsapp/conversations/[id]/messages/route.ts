import {NextRequest, NextResponse} from "next/server";
import {crmErrorResponse, CrmApiError, getCrmRequestContext} from "@/lib/crm/auth";
import {getCrmServiceClient} from "@/lib/crm/server-client";
import {sendWhatsAppText} from "@/lib/crm/whatsapp-cloud";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Context = {params: Promise<{id: string}>};

export async function GET(request: NextRequest, context: Context) {
    try {
        const {client} = await getCrmRequestContext(request);
        const {id} = await context.params;
        await requireAccessibleConversation(client, id);
        const {data, error} = await client.from("whatsapp_messages")
            .select("id,conversation_id,whatsapp_message_id,direction,message_type,body,media_id,status,error_code,error_message,sent_by,message_timestamp,created_at,updated_at,sender:profiles!whatsapp_messages_sent_by_fkey(id,full_name,email,avatar_url)")
            .eq("conversation_id", id)
            .order("message_timestamp", {ascending: true})
            .order("created_at", {ascending: true})
            .limit(500);
        if (error) throw new CrmApiError("WhatsApp messages could not be loaded. Apply the latest Supabase migration.", 502);
        return NextResponse.json({messages: data || []});
    } catch (error) {
        const {message, status} = crmErrorResponse(error);
        return NextResponse.json({error: message}, {status});
    }
}

export async function POST(request: NextRequest, context: Context) {
    let localMessageId = "";
    try {
        const {client, actor} = await getCrmRequestContext(request);
        const {id} = await context.params;
        const conversation = await requireAccessibleConversation(client, id);
        const payload = await request.json() as {body?: unknown};
        const body = typeof payload.body === "string" ? payload.body.trim() : "";
        if (!body) throw new CrmApiError("Write a message before sending.");
        if (body.length > 4096) throw new CrmApiError("WhatsApp messages must be 4,096 characters or fewer.");
        if (!conversation.customer_service_window_expires_at || new Date(conversation.customer_service_window_expires_at).getTime() <= Date.now()) {
            throw new CrmApiError("The 24-hour customer reply window is closed. Ask the customer to message again or use an approved Meta message template.", 409);
        }

        const serviceClient = getCrmServiceClient();
        const queued = await serviceClient.from("whatsapp_messages").insert({
            conversation_id: id,
            whatsapp_message_id: null,
            direction: "outbound",
            message_type: "text",
            body,
            status: "queued",
            sent_by: actor.id,
            message_timestamp: new Date().toISOString(),
        }).select("id").single();
        if (queued.error || !queued.data) throw new CrmApiError("The outgoing WhatsApp message could not be queued.", 502);
        localMessageId = String(queued.data.id);

        let sent: {messageId: string};
        try {
            sent = await sendWhatsAppText(conversation.wa_id, body);
        } catch (sendError) {
            const message = sendError instanceof Error ? sendError.message.slice(0, 500) : "Meta could not send this message.";
            await serviceClient.from("whatsapp_messages").update({status: "failed", error_message: message}).eq("id", localMessageId);
            throw sendError;
        }

        const timestamp = new Date().toISOString();
        const {error: updateError} = await serviceClient.from("whatsapp_messages").update({
            whatsapp_message_id: sent.messageId,
            status: "sent",
            message_timestamp: timestamp,
        }).eq("id", localMessageId);
        if (updateError) throw new CrmApiError("The message was sent, but its delivery record could not be updated.", 502);
        const {error: conversationError} = await serviceClient.from("whatsapp_conversations").update({
            last_message_at: timestamp,
            last_message_preview: body.slice(0, 180),
            last_message_direction: "outbound",
        }).eq("id", id);
        if (conversationError) console.error("WhatsApp conversation summary update failed.", {conversationId: id});

        const saved = await client.from("whatsapp_messages")
            .select("id,conversation_id,whatsapp_message_id,direction,message_type,body,status,sent_by,message_timestamp,created_at,updated_at,sender:profiles!whatsapp_messages_sent_by_fkey(id,full_name,email,avatar_url)")
            .eq("id", localMessageId).single();
        if (saved.error) throw new CrmApiError("The sent message could not be loaded.", 502);
        return NextResponse.json({message: saved.data}, {status: 201});
    } catch (error) {
        const {message, status} = crmErrorResponse(error);
        return NextResponse.json({error: message, localMessageId: localMessageId || undefined}, {status});
    }
}

async function requireAccessibleConversation(client: Awaited<ReturnType<typeof getCrmRequestContext>>["client"], id: string) {
    const {data, error} = await client.from("whatsapp_conversations")
        .select("id,wa_id,customer_service_window_expires_at").eq("id", id).maybeSingle();
    if (error) throw new CrmApiError("WhatsApp conversation could not be loaded.", 502);
    if (!data) throw new CrmApiError("WhatsApp conversation not found or unavailable.", 404);
    return data as {id: string; wa_id: string; customer_service_window_expires_at: string | null};
}
