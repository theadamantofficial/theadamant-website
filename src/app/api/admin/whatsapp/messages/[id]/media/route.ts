import {NextRequest, NextResponse} from "next/server";
import {crmErrorResponse, CrmApiError, getCrmRequestContext} from "@/lib/crm/auth";
import {downloadWhatsAppMedia} from "@/lib/crm/whatsapp-cloud";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Context = {params: Promise<{id: string}>};

export async function GET(request: NextRequest, context: Context) {
    try {
        const {client} = await getCrmRequestContext(request);
        const {id} = await context.params;
        const {data: message, error: messageError} = await client.from("whatsapp_messages")
            .select("id,conversation_id,message_type,media_id")
            .eq("id", id)
            .maybeSingle();
        if (messageError) throw new CrmApiError("The WhatsApp attachment could not be loaded.", 502);
        if (!message) throw new CrmApiError("WhatsApp attachment not found or unavailable.", 404);
        if (!message.media_id) throw new CrmApiError("This WhatsApp message has no media attachment.", 404);

        const {data: conversation, error: conversationError} = await client.from("whatsapp_conversations")
            .select("phone_number_id")
            .eq("id", message.conversation_id)
            .maybeSingle();
        if (conversationError) throw new CrmApiError("The WhatsApp conversation could not be loaded.", 502);
        if (!conversation) throw new CrmApiError("WhatsApp attachment not found or unavailable.", 404);

        const media = await downloadWhatsAppMedia(
            String(message.media_id),
            String(conversation.phone_number_id),
            request.headers.get("range"),
        );
        const headers = new Headers({
            "Cache-Control": "private, no-store, max-age=0",
            "Content-Type": media.mimeType,
            "Content-Disposition": "inline",
            "X-Content-Type-Options": "nosniff",
        });
        for (const name of ["accept-ranges", "content-length", "content-range"]) {
            const value = media.response.headers.get(name);
            if (value) headers.set(name, value);
        }
        if (!headers.has("content-length") && media.fileSize !== null && media.response.status === 200) {
            headers.set("Content-Length", String(media.fileSize));
        }

        return new NextResponse(media.response.body, {status: media.response.status, headers});
    } catch (error) {
        const {message, status} = crmErrorResponse(error);
        return NextResponse.json({error: message}, {status});
    }
}
