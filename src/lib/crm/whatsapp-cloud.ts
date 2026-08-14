import {createHmac, timingSafeEqual} from "node:crypto";
import type {SupabaseClient} from "@supabase/supabase-js";
import {CrmApiError} from "@/lib/crm/errors";
import {getCrmServiceClient} from "@/lib/crm/server-client";

export type WhatsAppInboundEvent = {
    kind: "message";
    messageId: string;
    phoneNumberId: string;
    businessAccountId: string | null;
    waId: string;
    contactName: string;
    messageType: string;
    body: string;
    mediaId: string | null;
    timestamp: string;
    contextMessageId: string | null;
};

export type WhatsAppStatusEvent = {
    kind: "status";
    messageId: string;
    status: "sent" | "delivered" | "read" | "failed";
    timestamp: string;
    recipientId: string | null;
    errorCode: string | null;
    errorMessage: string | null;
};

export type WhatsAppWebhookEvent = WhatsAppInboundEvent | WhatsAppStatusEvent;

type JsonRecord = Record<string, unknown>;

export function getWhatsAppWebhookChallenge(searchParams: URLSearchParams, expectedToken = env("WHATSAPP_WEBHOOK_VERIFY_TOKEN")) {
    const mode = searchParams.get("hub.mode");
    const token = searchParams.get("hub.verify_token") || "";
    const challenge = searchParams.get("hub.challenge");
    if (!expectedToken) throw new CrmApiError("WhatsApp webhook verification is not configured.", 503);
    if (mode !== "subscribe" || !challenge || !safeTextEqual(token, expectedToken)) {
        throw new CrmApiError("WhatsApp webhook verification failed.", 403);
    }
    return challenge;
}

export function verifyWhatsAppWebhookSignature(rawBody: string, signature: string | null, appSecret = env("META_APP_SECRET")) {
    if (!appSecret || !signature?.startsWith("sha256=")) return false;
    const expected = `sha256=${createHmac("sha256", appSecret).update(rawBody).digest("hex")}`;
    return safeTextEqual(signature, expected);
}

export function parseWhatsAppWebhook(payload: unknown): WhatsAppWebhookEvent[] {
    if (!isRecord(payload) || !Array.isArray(payload.entry)) return [];
    const events: WhatsAppWebhookEvent[] = [];

    for (const entryValue of payload.entry) {
        if (!isRecord(entryValue) || !Array.isArray(entryValue.changes)) continue;
        const businessAccountId = text(entryValue.id);
        for (const changeValue of entryValue.changes) {
            if (!isRecord(changeValue) || !isRecord(changeValue.value)) continue;
            const value = changeValue.value;
            const metadata = isRecord(value.metadata) ? value.metadata : {};
            const phoneNumberId = text(metadata.phone_number_id);
            const contacts = Array.isArray(value.contacts) ? value.contacts : [];
            const contactNames = new Map<string, string>();
            for (const contact of contacts) {
                if (!isRecord(contact)) continue;
                const profile = isRecord(contact.profile) ? contact.profile : {};
                const waId = digits(text(contact.wa_id));
                if (waId) contactNames.set(waId, text(profile.name));
            }

            if (phoneNumberId && Array.isArray(value.messages)) {
                for (const item of value.messages) {
                    if (!isRecord(item)) continue;
                    const messageId = text(item.id);
                    const waId = digits(text(item.from));
                    if (!messageId || !waId) continue;
                    const content = extractMessageContent(item);
                    events.push({
                        kind: "message",
                        messageId,
                        phoneNumberId,
                        businessAccountId,
                        waId,
                        contactName: contactNames.get(waId) || "",
                        messageType: text(item.type) || "unknown",
                        body: content.body,
                        mediaId: content.mediaId,
                        timestamp: timestamp(text(item.timestamp)),
                        contextMessageId: isRecord(item.context) ? text(item.context.id) : null,
                    });
                }
            }

            if (Array.isArray(value.statuses)) {
                for (const item of value.statuses) {
                    if (!isRecord(item)) continue;
                    const messageId = text(item.id);
                    const status = mapProviderStatus(text(item.status));
                    if (!messageId || !status) continue;
                    const errors = Array.isArray(item.errors) ? item.errors : [];
                    const firstError = isRecord(errors[0]) ? errors[0] : {};
                    const errorData = isRecord(firstError.error_data) ? firstError.error_data : {};
                    events.push({
                        kind: "status",
                        messageId,
                        status,
                        timestamp: timestamp(text(item.timestamp)),
                        recipientId: digits(text(item.recipient_id)) || null,
                        errorCode: text(firstError.code) || null,
                        errorMessage: truncate(text(errorData.details) || text(firstError.title), 500) || null,
                    });
                }
            }
        }
    }
    return events;
}

export async function processWhatsAppWebhook(events: WhatsAppWebhookEvent[]) {
    const client = getCrmServiceClient();
    let processed = 0;
    for (const event of events) {
        if (event.kind === "message") {
            if (await ingestInboundMessage(client, event)) processed += 1;
        } else {
            if (await updateMessageStatus(client, event)) processed += 1;
        }
    }
    return processed;
}

export function getWhatsAppIntegrationStatus() {
    const accessToken = env("WHATSAPP_ACCESS_TOKEN");
    const phoneNumberId = env("WHATSAPP_PHONE_NUMBER_ID");
    const businessAccountId = env("WHATSAPP_BUSINESS_ACCOUNT_ID");
    const appSecret = env("META_APP_SECRET");
    const verifyToken = env("WHATSAPP_WEBHOOK_VERIFY_TOKEN");
    return {
        configured: Boolean(accessToken && phoneNumberId && businessAccountId && appSecret && verifyToken),
        accessToken: Boolean(accessToken),
        phoneNumberId: Boolean(phoneNumberId),
        businessAccountId: Boolean(businessAccountId),
        appSecret: Boolean(appSecret),
        verifyToken: Boolean(verifyToken),
    };
}

export async function sendWhatsAppText(to: string, body: string) {
    const accessToken = env("WHATSAPP_ACCESS_TOKEN");
    const phoneNumberId = env("WHATSAPP_PHONE_NUMBER_ID");
    const version = env("WHATSAPP_GRAPH_API_VERSION") || "v25.0";
    if (!accessToken || !phoneNumberId) {
        throw new CrmApiError("WhatsApp sending is not configured.", 503);
    }

    const response = await fetch(`https://graph.facebook.com/${version}/${encodeURIComponent(phoneNumberId)}/messages`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            messaging_product: "whatsapp",
            recipient_type: "individual",
            to,
            type: "text",
            text: {preview_url: false, body},
        }),
        cache: "no-store",
    });
    const payload = await response.json().catch(() => ({})) as JsonRecord;
    if (!response.ok) {
        const providerError = isRecord(payload.error) ? payload.error : {};
        const providerMessage = truncate(text(providerError.message), 400);
        throw new CrmApiError(providerMessage || "Meta could not send this WhatsApp message.", response.status >= 500 ? 502 : 400);
    }
    const messages = Array.isArray(payload.messages) ? payload.messages : [];
    const firstMessage = isRecord(messages[0]) ? messages[0] : {};
    const messageId = text(firstMessage.id);
    if (!messageId) throw new CrmApiError("Meta accepted the request without returning a message ID.", 502);
    return {messageId};
}

async function ingestInboundMessage(client: SupabaseClient, event: WhatsAppInboundEvent) {
    const duplicate = await client.from("whatsapp_messages").select("id").eq("whatsapp_message_id", event.messageId).maybeSingle();
    if (duplicate.error) throw new CrmApiError("WhatsApp message deduplication failed.", 502);
    if (duplicate.data) return false;

    const lead = await findOrCreateWhatsAppLead(client, event);
    const conversation = await findOrCreateConversation(client, event, lead.id, lead.assigned_to);
    const {error: messageError} = await client.from("whatsapp_messages").insert({
        conversation_id: conversation.id,
        whatsapp_message_id: event.messageId,
        direction: "inbound",
        message_type: event.messageType,
        body: event.body,
        media_id: event.mediaId,
        status: "received",
        sent_by: null,
        message_timestamp: event.timestamp,
        metadata: event.contextMessageId ? {context_message_id: event.contextMessageId} : {},
    });
    if (messageError?.code === "23505") return false;
    if (messageError) throw new CrmApiError("The inbound WhatsApp message could not be stored.", 502);

    const unreadCount = Math.max(0, Number(conversation.unread_count) || 0) + 1;
    const serviceWindow = new Date(new Date(event.timestamp).getTime() + 24 * 60 * 60 * 1000).toISOString();
    const {error: conversationError} = await client.from("whatsapp_conversations").update({
        contact_name: event.contactName || conversation.contact_name,
        lead_id: lead.id,
        assigned_to: lead.assigned_to,
        status: "open",
        unread_count: unreadCount,
        customer_service_window_expires_at: serviceWindow,
        last_message_at: event.timestamp,
        last_message_preview: truncate(event.body, 180),
        last_message_direction: "inbound",
    }).eq("id", conversation.id);
    if (conversationError) throw new CrmApiError("The WhatsApp conversation could not be updated.", 502);
    return true;
}

async function findOrCreateWhatsAppLead(client: SupabaseClient, event: WhatsAppInboundEvent) {
    const reference = `whatsapp:${event.waId}`;
    const existing = await client.from("leads").select("id,assigned_to").eq("external_reference", reference).maybeSingle();
    if (existing.error) throw new CrmApiError("The WhatsApp lead could not be matched.", 502);
    if (existing.data) return existing.data as {id: string; assigned_to: string | null};

    const phoneMatch = await client.from("leads").select("id,assigned_to,external_reference")
        .in("phone", [event.waId, `+${event.waId}`]).order("created_at", {ascending: false}).limit(1).maybeSingle();
    if (phoneMatch.error) throw new CrmApiError("The WhatsApp phone number could not be matched.", 502);
    if (phoneMatch.data) {
        if (!phoneMatch.data.external_reference) {
            await client.from("leads").update({external_reference: reference}).eq("id", phoneMatch.data.id);
        }
        return {id: String(phoneMatch.data.id), assigned_to: phoneMatch.data.assigned_to as string | null};
    }

    const contactName = truncate(event.contactName.trim(), 300) || `WhatsApp contact ${event.waId.slice(-4)}`;
    const inserted = await client.from("leads").insert({
        customer_name: contactName,
        phone: `+${event.waId}`,
        email: null,
        company_name: null,
        service_required: "Other",
        lead_source: "whatsapp",
        status: "new",
        estimated_value: 0,
        assigned_to: null,
        next_followup: null,
        priority: "medium",
        description: "Inbound WhatsApp conversation. Continue the conversation from the CRM WhatsApp inbox.",
        external_reference: reference,
        origin_metadata: {channel: "whatsapp"},
        created_by: null,
    }).select("id,assigned_to").single();
    if (inserted.error?.code === "23505") {
        const raced = await client.from("leads").select("id,assigned_to").eq("external_reference", reference).single();
        if (!raced.error && raced.data) return raced.data as {id: string; assigned_to: string | null};
    }
    if (inserted.error || !inserted.data) throw new CrmApiError("The WhatsApp lead could not be created.", 502);
    return inserted.data as {id: string; assigned_to: string | null};
}

async function findOrCreateConversation(client: SupabaseClient, event: WhatsAppInboundEvent, leadId: string, assignedTo: string | null) {
    const existing = await client.from("whatsapp_conversations").select("id,contact_name,unread_count")
        .eq("phone_number_id", event.phoneNumberId).eq("wa_id", event.waId).maybeSingle();
    if (existing.error) throw new CrmApiError("The WhatsApp conversation could not be matched.", 502);
    if (existing.data) return existing.data as {id: string; contact_name: string; unread_count: number};

    const inserted = await client.from("whatsapp_conversations").insert({
        whatsapp_business_account_id: event.businessAccountId || env("WHATSAPP_BUSINESS_ACCOUNT_ID") || null,
        phone_number_id: event.phoneNumberId,
        wa_id: event.waId,
        contact_name: event.contactName,
        lead_id: leadId,
        assigned_to: assignedTo,
        unread_count: 0,
    }).select("id,contact_name,unread_count").single();
    if (inserted.error?.code === "23505") {
        const raced = await client.from("whatsapp_conversations").select("id,contact_name,unread_count")
            .eq("phone_number_id", event.phoneNumberId).eq("wa_id", event.waId).single();
        if (!raced.error && raced.data) return raced.data as {id: string; contact_name: string; unread_count: number};
    }
    if (inserted.error || !inserted.data) throw new CrmApiError("The WhatsApp conversation could not be created.", 502);
    return inserted.data as {id: string; contact_name: string; unread_count: number};
}

async function updateMessageStatus(client: SupabaseClient, event: WhatsAppStatusEvent) {
    const existing = await client.from("whatsapp_messages").select("id,status").eq("whatsapp_message_id", event.messageId).maybeSingle();
    if (existing.error) throw new CrmApiError("WhatsApp delivery status could not be matched.", 502);
    if (!existing.data) return false;
    if (statusRank(event.status) < statusRank(String(existing.data.status))) return false;
    const {error} = await client.from("whatsapp_messages").update({
        status: event.status,
        error_code: event.errorCode,
        error_message: event.errorMessage,
        metadata: event.recipientId ? {recipient_id: event.recipientId, status_timestamp: event.timestamp} : {status_timestamp: event.timestamp},
    }).eq("id", existing.data.id);
    if (error) throw new CrmApiError("WhatsApp delivery status could not be saved.", 502);
    return true;
}

function extractMessageContent(message: JsonRecord) {
    const type = text(message.type) || "unknown";
    const value = isRecord(message[type]) ? message[type] : {};
    if (type === "text") return {body: truncate(text(value.body), 4096), mediaId: null};
    if (type === "button") return {body: truncate(text(value.text) || text(value.payload), 4096), mediaId: null};
    if (type === "interactive") {
        const reply = isRecord(value.button_reply) ? value.button_reply : isRecord(value.list_reply) ? value.list_reply : {};
        return {body: truncate(text(reply.title) || text(reply.id) || "[Interactive reply]", 4096), mediaId: null};
    }
    if (type === "location") {
        const name = text(value.name) || "Shared location";
        const latitude = text(value.latitude);
        const longitude = text(value.longitude);
        return {body: truncate(latitude && longitude ? `[Location] ${name} (${latitude}, ${longitude})` : `[Location] ${name}`, 4096), mediaId: null};
    }
    if (["image", "video", "audio", "document", "sticker"].includes(type)) {
        const caption = text(value.caption) || text(value.filename);
        return {body: truncate(`[${type[0].toUpperCase()}${type.slice(1)}]${caption ? ` ${caption}` : ""}`, 4096), mediaId: text(value.id) || null};
    }
    return {body: `[${type[0]?.toUpperCase() || "U"}${type.slice(1)} message]`, mediaId: null};
}

function mapProviderStatus(value: string): WhatsAppStatusEvent["status"] | null {
    return value === "sent" || value === "delivered" || value === "read" || value === "failed" ? value : null;
}

function statusRank(value: string) {
    return ({queued: 0, received: 1, sent: 1, delivered: 2, read: 3, failed: 4} as Record<string, number>)[value] ?? -1;
}

function timestamp(seconds: string) {
    const value = Number(seconds);
    return Number.isFinite(value) && value > 0 ? new Date(value * 1000).toISOString() : new Date().toISOString();
}

function digits(value: string) {
    return value.replace(/\D/g, "").slice(0, 15);
}

function safeTextEqual(left: string, right: string) {
    const leftBuffer = Buffer.from(left);
    const rightBuffer = Buffer.from(right);
    return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

function isRecord(value: unknown): value is JsonRecord {
    return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function text(value: unknown) {
    return typeof value === "string" || typeof value === "number" ? String(value).trim() : "";
}

function truncate(value: string, limit: number) {
    return value.length > limit ? value.slice(0, limit) : value;
}

function env(name: string) {
    return process.env[name]?.trim().replace(/^['"]|['"]$/g, "") || "";
}
