import {NextRequest, NextResponse} from "next/server";
import {crmErrorResponse, CrmApiError, getCrmRequestContext} from "@/lib/crm/auth";
import {getCrmServiceClient} from "@/lib/crm/server-client";
import {sendWhatsAppReaction, sendWhatsAppTemplate, sendWhatsAppText, type WhatsAppTemplateParameter} from "@/lib/crm/whatsapp-cloud";
import {translateEnglishForWhatsApp, translateWhatsAppMessagesToEnglish} from "@/lib/crm/whatsapp-translation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Context = {params: Promise<{id: string}>};

export async function GET(request: NextRequest, context: Context) {
    try {
        const {client} = await getCrmRequestContext(request);
        const {id} = await context.params;
        await requireAccessibleConversation(client, id);
        const {data, error} = await client.from("whatsapp_messages")
            .select("id,conversation_id,whatsapp_message_id,direction,message_type,body,media_id,status,error_code,error_message,sent_by,message_timestamp,metadata,created_at,updated_at,sender:profiles!whatsapp_messages_sent_by_fkey(id,full_name,email,avatar_url)")
            .eq("conversation_id", id)
            .order("message_timestamp", {ascending: true})
            .order("created_at", {ascending: true})
            .limit(500);
        if (error) throw new CrmApiError("WhatsApp messages could not be loaded. Apply the latest Supabase migration.", 502);
        const messages = data || [];
        const untranslated = messages.filter((message) => message.direction === "inbound"
            && message.message_type !== "reaction"
            && message.body?.trim()
            && !asRecord(message.metadata).translation).slice(-100);
        if (untranslated.length) {
            try {
                const translations = await translateWhatsAppMessagesToEnglish(untranslated.map((message) => ({id: String(message.id), text: String(message.body)})));
                const serviceClient = getCrmServiceClient();
                await Promise.all(messages.map(async (message) => {
                    const translation = translations.get(String(message.id));
                    if (!translation) return;
                    const metadata = {...asRecord(message.metadata), translation};
                    message.metadata = metadata;
                    await serviceClient.from("whatsapp_messages").update({metadata}).eq("id", message.id);
                }));
            } catch (translationError) {
                console.error("WhatsApp inbox translation failed.", {message: translationError instanceof Error ? translationError.message : "Unknown error"});
            }
        }
        return NextResponse.json({messages});
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
        const payload = await request.json() as {body?: unknown; template?: unknown; reaction?: unknown; translation?: unknown};
        const reaction = parseReaction(payload.reaction);
        if (reaction) {
            const target = await client.from("whatsapp_messages").select("id,whatsapp_message_id").eq("id", reaction.messageId).eq("conversation_id", id).maybeSingle();
            if (target.error || !target.data?.whatsapp_message_id) throw new CrmApiError("This message cannot be reacted to.", 400);
            const timestamp = new Date().toISOString();
            const sent = await sendWhatsAppReaction(conversation.wa_id, String(target.data.whatsapp_message_id), reaction.emoji);
            const serviceClient = getCrmServiceClient();
            const saved = await serviceClient.from("whatsapp_messages").insert({
                conversation_id: id,
                whatsapp_message_id: sent.messageId,
                direction: "outbound",
                message_type: "reaction",
                body: reaction.emoji ? `Reacted ${reaction.emoji}` : "Removed a reaction",
                status: "sent",
                sent_by: actor.id,
                message_timestamp: timestamp,
                metadata: {reacted_to_message_id: target.data.whatsapp_message_id, emoji: reaction.emoji},
            }).select("id").single();
            if (saved.error) throw new CrmApiError("The reaction was sent but could not be saved.", 502);
            return NextResponse.json({message: saved.data}, {status: 201});
        }
        const body = typeof payload.body === "string" ? payload.body.trim() : "";
        const template = parseTemplate(payload.template);
        if (!body && !template) throw new CrmApiError("Write a message or choose an approved template before sending.");
        if (body.length > 4096) throw new CrmApiError("WhatsApp messages must be 4,096 characters or fewer.");
        const windowOpen = Boolean(conversation.customer_service_window_expires_at && new Date(conversation.customer_service_window_expires_at).getTime() > Date.now());
        if (!windowOpen && !template) {
            throw new CrmApiError("The 24-hour customer reply window is closed. Ask the customer to message again or use an approved Meta message template.", 409);
        }
        const storedBody = template ? (body || `Template: ${template.name}`) : body;
        const translation = template ? null : parseTranslation(payload.translation);
        const sentBody = translation ? await translateEnglishForWhatsApp(body, translation.targetLanguage, translation.targetLanguageCode) : body;

        const serviceClient = getCrmServiceClient();
        const queued = await serviceClient.from("whatsapp_messages").insert({
            conversation_id: id,
            whatsapp_message_id: null,
            direction: "outbound",
            message_type: template ? "template" : "text",
            body: storedBody,
            status: "queued",
            sent_by: actor.id,
            message_timestamp: new Date().toISOString(),
            metadata: translation ? {translation: {englishText: body, translatedText: sentBody, detectedLanguage: "English", detectedLanguageCode: "en", targetLanguage: translation.targetLanguage, targetLanguageCode: translation.targetLanguageCode}} : {},
        }).select("id").single();
        if (queued.error || !queued.data) throw new CrmApiError("The outgoing WhatsApp message could not be queued.", 502);
        localMessageId = String(queued.data.id);

        let sent: {messageId: string};
        try {
            sent = template
                ? await sendWhatsAppTemplate(conversation.wa_id, template.name, template.language, template.parameters, template.document)
                : await sendWhatsAppText(conversation.wa_id, sentBody);
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
            last_message_preview: storedBody.slice(0, 180),
            last_message_direction: "outbound",
        }).eq("id", id);
        if (conversationError) console.error("WhatsApp conversation summary update failed.", {conversationId: id});

        const saved = await client.from("whatsapp_messages")
            .select("id,conversation_id,whatsapp_message_id,direction,message_type,body,media_id,status,error_code,error_message,sent_by,message_timestamp,metadata,created_at,updated_at,sender:profiles!whatsapp_messages_sent_by_fkey(id,full_name,email,avatar_url)")
            .eq("id", localMessageId).single();
        if (saved.error) throw new CrmApiError("The sent message could not be loaded.", 502);
        return NextResponse.json({message: saved.data}, {status: 201});
    } catch (error) {
        const {message, status} = crmErrorResponse(error);
        return NextResponse.json({error: message, localMessageId: localMessageId || undefined}, {status});
    }
}

function parseReaction(value: unknown) {
    if (!value || typeof value !== "object" || Array.isArray(value)) return null;
    const candidate = value as {messageId?: unknown; emoji?: unknown};
    const messageId = typeof candidate.messageId === "string" ? candidate.messageId.trim() : "";
    const emoji = typeof candidate.emoji === "string" ? candidate.emoji.trim() : "";
    if (!messageId || !/^[0-9a-f-]{36}$/i.test(messageId) || !emoji || emoji.length > 16) throw new CrmApiError("Choose a valid message reaction.");
    return {messageId, emoji};
}

function parseTranslation(value: unknown) {
    if (!value || typeof value !== "object" || Array.isArray(value)) return null;
    const candidate = value as {targetLanguage?: unknown; targetLanguageCode?: unknown};
    const targetLanguage = typeof candidate.targetLanguage === "string" ? candidate.targetLanguage.trim().slice(0, 80) : "";
    const targetLanguageCode = typeof candidate.targetLanguageCode === "string" ? candidate.targetLanguageCode.trim().toLowerCase().slice(0, 16) : "";
    if (!targetLanguage || /^english$/i.test(targetLanguage) || targetLanguageCode === "en") return null;
    if (!/^[\p{L} .()'-]+$/u.test(targetLanguage) || (targetLanguageCode && !/^[a-z]{2,3}(?:-[a-z0-9]{2,8})?$/i.test(targetLanguageCode))) {
        throw new CrmApiError("The detected WhatsApp language is invalid.");
    }
    return {targetLanguage, targetLanguageCode};
}

function asRecord(value: unknown): Record<string, unknown> {
    return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function parseTemplate(value: unknown): {name: string; language: string; parameters: WhatsAppTemplateParameter[]; document?: {mediaId: string; filename: string}} | null {
    if (!value || typeof value !== "object" || Array.isArray(value)) return null;
    const candidate = value as {name?: unknown; language?: unknown; parameters?: unknown; document?: unknown};
    const name = typeof candidate.name === "string" ? candidate.name.trim() : "";
    const language = typeof candidate.language === "string" ? candidate.language.trim() : "";
    if (!name || !/^[a-z0-9_]+$/.test(name) || !language || language.length > 35 || !/^[a-z]{2,3}(?:_[A-Z]{2})?$/.test(language)) {
        throw new CrmApiError("Choose a valid approved WhatsApp template.");
    }
    const rawParameters = Array.isArray(candidate.parameters) ? candidate.parameters : [];
    if (rawParameters.length > 20) throw new CrmApiError("This template has too many variables.");
    const parameters = rawParameters.map((parameter) => {
        const item: {name?: unknown; value?: unknown} = parameter && typeof parameter === "object" && !Array.isArray(parameter)
            ? parameter as {name?: unknown; value?: unknown}
            : {value: parameter};
        const parameterValue = typeof item.value === "string" ? item.value.trim() : "";
        const parameterName = typeof item.name === "string" ? item.name.trim() : "";
        if (!parameterValue || parameterValue.length > 1024) throw new CrmApiError("Fill in every WhatsApp template variable.");
        if (parameterName && !/^[a-z0-9_]+$/.test(parameterName)) throw new CrmApiError("A WhatsApp template variable name is invalid.");
        return {value: parameterValue, ...(parameterName ? {name: parameterName} : {})};
    });
    const documentCandidate = candidate.document && typeof candidate.document === "object" && !Array.isArray(candidate.document) ? candidate.document as {mediaId?: unknown; filename?: unknown} : null;
    const mediaId = typeof documentCandidate?.mediaId === "string" ? documentCandidate.mediaId.trim() : "";
    const filename = typeof documentCandidate?.filename === "string" ? documentCandidate.filename.trim() : "";
    if (documentCandidate && (!/^\d+$/.test(mediaId) || !/^[^/\\]{1,180}\.pdf$/i.test(filename))) throw new CrmApiError("Choose a valid PDF attachment.");
    return {name, language, parameters, ...(mediaId ? {document: {mediaId, filename}} : {})};
}

async function requireAccessibleConversation(client: Awaited<ReturnType<typeof getCrmRequestContext>>["client"], id: string) {
    const {data, error} = await client.from("whatsapp_conversations")
        .select("id,wa_id,customer_service_window_expires_at").eq("id", id).maybeSingle();
    if (error) throw new CrmApiError("WhatsApp conversation could not be loaded.", 502);
    if (!data) throw new CrmApiError("WhatsApp conversation not found or unavailable.", 404);
    return data as {id: string; wa_id: string; customer_service_window_expires_at: string | null};
}
