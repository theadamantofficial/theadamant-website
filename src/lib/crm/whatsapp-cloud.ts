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

type StoredConversation = {
    id: string;
    contact_name: string;
    unread_count: number;
    customer_service_window_expires_at: string | null;
};

export const DEFAULT_WHATSAPP_AUTO_REPLY = "Hi! 👋 Thank you for contacting Adamant Technologies. We've received your message and our team will get back to you shortly.";

export const WHATSAPP_AUTOMATION_REPLIES = {
    services: "Here’s what Adamant Technologies can help with:\n\n• UI/UX design\n• SEO-friendly websites and landing pages\n• Mobile apps for Android and iOS\n• SaaS and digital product development\n• Digital marketing, social media and paid ads\n\nExplore our services: https://theadamant.com/#services\n\nReply with the service you need and a short description of your project.",
    website: "Great — we’d be happy to help with your website. Please share:\n\n1. Business or brand name\n2. Type of website you need\n3. Required pages and features\n4. Reference websites you like\n5. Target launch date\n6. Approximate budget range\n\nOur team will review the details and reply with the next steps.",
    app: "Great — we design and develop mobile apps for Android and iOS. Please share:\n\n1. A short description of the app\n2. Your target users\n3. The main features you need\n4. Android, iOS or both\n5. Any reference apps\n6. Target timeline and budget range\n\nOur team will review your idea and get back to you.",
    quote: "To prepare an accurate quotation, please share:\n\n• The service you need\n• Project scope and required features\n• Target launch date\n• Reference links, if available\n• Approximate budget range\n\nYou can also submit your brief at https://theadamant.com/#contact. Our team will review it and reply with the next steps.",
    portfolio: "You can explore our work and capabilities at https://theadamant.com/#services\n\nOur in-house SEO product: https://aetherseo.com/en\n\nTell us what type of project you are planning and our team can share the most relevant examples.",
    contact: "You can contact Adamant Technologies here:\n\n• WhatsApp: +91 93154 14827\n• Email: admin@theadamant.com\n• Website: https://theadamant.com\n\nYou can also share your requirement directly in this chat and our team will help you.",
    support: "For technical support, please send:\n\n• Project or website name\n• A description of the issue\n• A screenshot or screen recording, if possible\n• When the issue started\n• Your preferred contact details\n\nPlease do not share passwords, OTPs or API keys in this chat. Our team will review the issue and assist you.",
} as const;

type WhatsAppAutomationReply = keyof typeof WHATSAPP_AUTOMATION_REPLIES;

const WHATSAPP_AUTOMATION_TRIGGERS: Record<string, WhatsAppAutomationReply> = {
    "/services": "services",
    "/website": "website",
    "/app": "app",
    "/quote": "quote",
    "/portfolio": "portfolio",
    "/contact": "contact",
    "/support": "support",
    "what services do you offer": "services",
    "i want to build a website": "website",
    "i need a mobile application": "app",
    "how can i get a quotation": "quote",
};

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

export function shouldSendWhatsAppAutoReply(previousWindowExpiresAt: string | null, inboundTimestamp: string, gapHours = getWhatsAppAutoReplyGapHours()) {
    if (!previousWindowExpiresAt) return true;
    const previousExpiry = new Date(previousWindowExpiresAt).getTime();
    const inboundTime = new Date(inboundTimestamp).getTime();
    const previousInboundTime = previousExpiry - 24 * 60 * 60 * 1000;
    const gapMilliseconds = gapHours * 60 * 60 * 1000;
    return !Number.isFinite(previousExpiry) || !Number.isFinite(inboundTime) || inboundTime - previousInboundTime >= gapMilliseconds;
}

export function isWhatsAppAutoReplyEnabled(configuredValue = env("WHATSAPP_AUTO_REPLY_ENABLED")) {
    return !["0", "false", "no", "off"].includes(configuredValue.toLowerCase());
}

export function getWhatsAppAutoReplyMessage(configuredValue = env("WHATSAPP_AUTO_REPLY_MESSAGE")) {
    return truncate(configuredValue || DEFAULT_WHATSAPP_AUTO_REPLY, 4096);
}

export function getWhatsAppAutoReplyGapHours(configuredValue = env("WHATSAPP_AUTO_REPLY_GAP_HOURS")) {
    const hours = Number(configuredValue);
    return Number.isFinite(hours) && hours >= 24 ? hours : 48;
}

export function getWhatsAppAutomationReply(messageBody: string) {
    const normalized = messageBody.trim().toLowerCase().replace(/\s+/g, " ").replace(/[?.!]+$/g, "");
    const trigger = normalized.startsWith("/") ? normalized.split(" ", 1)[0] : normalized;
    const replyKey = WHATSAPP_AUTOMATION_TRIGGERS[trigger];
    return replyKey ? WHATSAPP_AUTOMATION_REPLIES[replyKey] : null;
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
    return sendWhatsAppMessage(to, {
        type: "text",
        text: {preview_url: false, body},
    });
}

export async function sendWhatsAppInteractive(to: string, interactive: JsonRecord) {
    return sendWhatsAppMessage(to, {type: "interactive", interactive});
}

async function sendWhatsAppMessage(to: string, content: JsonRecord) {
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
            ...content,
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

export async function downloadWhatsAppMedia(
    mediaId: string,
    phoneNumberId: string,
    range: string | null = null,
    fetcher: typeof fetch = fetch,
) {
    const accessToken = env("WHATSAPP_ACCESS_TOKEN");
    const version = env("WHATSAPP_GRAPH_API_VERSION") || "v25.0";
    if (!accessToken) throw new CrmApiError("WhatsApp media playback is not configured.", 503);
    if (!mediaId) throw new CrmApiError("This WhatsApp message has no media attachment.", 404);

    const metadataUrl = new URL(`https://graph.facebook.com/${version}/${encodeURIComponent(mediaId)}`);
    if (phoneNumberId) metadataUrl.searchParams.set("phone_number_id", phoneNumberId);
    const metadataResponse = await fetcher(metadataUrl, {
        headers: {Authorization: `Bearer ${accessToken}`},
        cache: "no-store",
    });
    const metadata = await metadataResponse.json().catch(() => ({})) as JsonRecord;
    if (!metadataResponse.ok) {
        const providerError = isRecord(metadata.error) ? metadata.error : {};
        const providerMessage = truncate(text(providerError.message), 300);
        throw new CrmApiError(providerMessage || "Meta could not retrieve this WhatsApp media.", metadataResponse.status === 404 ? 404 : 502);
    }

    const downloadUrl = text(metadata.url);
    if (!downloadUrl) throw new CrmApiError("Meta did not return a WhatsApp media URL.", 502);
    let parsedDownloadUrl: URL;
    try {
        parsedDownloadUrl = new URL(downloadUrl);
    } catch {
        throw new CrmApiError("Meta returned an invalid WhatsApp media URL.", 502);
    }
    if (parsedDownloadUrl.protocol !== "https:") throw new CrmApiError("Meta returned an insecure WhatsApp media URL.", 502);

    const downloadHeaders = new Headers({Authorization: `Bearer ${accessToken}`});
    if (range && /^bytes=\d*-\d*$/.test(range)) downloadHeaders.set("Range", range);
    const mediaResponse = await fetcher(parsedDownloadUrl, {
        headers: downloadHeaders,
        cache: "no-store",
    });
    if (!mediaResponse.ok) {
        throw new CrmApiError("This WhatsApp media could not be downloaded from Meta.", mediaResponse.status === 404 ? 404 : 502);
    }

    const metadataFileSize = Number(metadata.file_size);
    return {
        response: mediaResponse,
        mimeType: mediaResponse.headers.get("content-type") || text(metadata.mime_type) || "application/octet-stream",
        fileSize: Number.isFinite(metadataFileSize) && metadataFileSize >= 0 ? metadataFileSize : null,
    };
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
    const autoReplyEnabled = isWhatsAppAutoReplyEnabled();
    const automationReply = autoReplyEnabled ? getWhatsAppAutomationReply(event.body) : null;
    const shouldAutoReply = !automationReply && autoReplyEnabled
        && shouldSendWhatsAppAutoReply(conversation.customer_service_window_expires_at, event.timestamp)
        && await claimAutoReplyWindow(client, conversation, serviceWindow);
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

    if (automationReply || shouldAutoReply) {
        try {
            await sendAndStoreWhatsAppAutoReply(
                client,
                conversation.id,
                event.waId,
                automationReply || getWhatsAppAutoReplyMessage(),
                automationReply ? {automatic_automation_reply: true, trigger: event.body} : {automatic_acknowledgement: true},
            );
        } catch (error) {
            console.error("WhatsApp automatic reply failed.", {
                conversationId: conversation.id,
                message: error instanceof Error ? error.message : "Unknown error",
            });
        }
    }
    return true;
}

async function claimAutoReplyWindow(client: SupabaseClient, conversation: StoredConversation, serviceWindow: string) {
    let query = client.from("whatsapp_conversations")
        .update({customer_service_window_expires_at: serviceWindow})
        .eq("id", conversation.id);
    query = conversation.customer_service_window_expires_at
        ? query.eq("customer_service_window_expires_at", conversation.customer_service_window_expires_at)
        : query.is("customer_service_window_expires_at", null);
    const {data, error} = await query.select("id").maybeSingle();
    if (error) throw new CrmApiError("The WhatsApp automatic acknowledgement could not be scheduled.", 502);
    return Boolean(data);
}

async function sendAndStoreWhatsAppAutoReply(client: SupabaseClient, conversationId: string, waId: string, body: string, metadata: JsonRecord) {
    const timestamp = new Date().toISOString();
    const queued = await client.from("whatsapp_messages").insert({
        conversation_id: conversationId,
        whatsapp_message_id: null,
        direction: "outbound",
        message_type: "text",
        body,
        status: "queued",
        sent_by: null,
        message_timestamp: timestamp,
        metadata,
    }).select("id").single();
    if (queued.error || !queued.data) throw new CrmApiError("The WhatsApp automatic reply could not be queued.", 502);

    const localMessageId = String(queued.data.id);
    try {
        const sent = await sendWhatsAppText(waId, body);
        const {error: messageError} = await client.from("whatsapp_messages").update({
            whatsapp_message_id: sent.messageId,
            status: "sent",
            message_timestamp: timestamp,
        }).eq("id", localMessageId);
        if (messageError) throw new CrmApiError("The WhatsApp automatic reply was sent but could not be saved.", 502);
        const {error: conversationError} = await client.from("whatsapp_conversations").update({
            last_message_at: timestamp,
            last_message_preview: truncate(body, 180),
            last_message_direction: "outbound",
        }).eq("id", conversationId);
        if (conversationError) throw new CrmApiError("The WhatsApp automatic reply summary could not be saved.", 502);
    } catch (error) {
        const message = error instanceof Error ? truncate(error.message, 500) : "Meta could not send the automatic reply.";
        await client.from("whatsapp_messages").update({status: "failed", error_message: message}).eq("id", localMessageId);
        throw error;
    }
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
    const existing = await client.from("whatsapp_conversations").select("id,contact_name,unread_count,customer_service_window_expires_at")
        .eq("phone_number_id", event.phoneNumberId).eq("wa_id", event.waId).maybeSingle();
    if (existing.error) throw new CrmApiError("The WhatsApp conversation could not be matched.", 502);
    if (existing.data) return existing.data as StoredConversation;

    const inserted = await client.from("whatsapp_conversations").insert({
        whatsapp_business_account_id: event.businessAccountId || env("WHATSAPP_BUSINESS_ACCOUNT_ID") || null,
        phone_number_id: event.phoneNumberId,
        wa_id: event.waId,
        contact_name: event.contactName,
        lead_id: leadId,
        assigned_to: assignedTo,
        unread_count: 0,
    }).select("id,contact_name,unread_count,customer_service_window_expires_at").single();
    if (inserted.error?.code === "23505") {
        const raced = await client.from("whatsapp_conversations").select("id,contact_name,unread_count,customer_service_window_expires_at")
            .eq("phone_number_id", event.phoneNumberId).eq("wa_id", event.waId).single();
        if (!raced.error && raced.data) return raced.data as StoredConversation;
    }
    if (inserted.error || !inserted.data) throw new CrmApiError("The WhatsApp conversation could not be created.", 502);
    return inserted.data as StoredConversation;
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
