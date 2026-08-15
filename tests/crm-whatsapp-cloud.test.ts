import {createHmac} from "node:crypto";
import {afterEach, describe, expect, it, vi} from "vitest";
import {
    DEFAULT_WHATSAPP_AUTO_REPLY,
    downloadWhatsAppMedia,
    getWhatsAppAutoReplyGapHours,
    getWhatsAppAutoReplyMessage,
    getWhatsAppAutomationReply,
    getWhatsAppWebhookChallenge,
    isWhatsAppAutoReplyEnabled,
    parseWhatsAppWebhook,
    shouldSendWhatsAppAutoReply,
    verifyWhatsAppWebhookSignature,
} from "@/lib/crm/whatsapp-cloud";

afterEach(() => {
    delete process.env.WHATSAPP_ACCESS_TOKEN;
    delete process.env.WHATSAPP_GRAPH_API_VERSION;
});

describe("WhatsApp Cloud API webhook", () => {
    it("completes Meta's verification challenge only for the configured token", () => {
        const params = new URLSearchParams({
            "hub.mode": "subscribe",
            "hub.verify_token": "adamant-secret",
            "hub.challenge": "123456",
        });
        expect(getWhatsAppWebhookChallenge(params, "adamant-secret")).toBe("123456");
        expect(() => getWhatsAppWebhookChallenge(params, "wrong-secret")).toThrow("verification failed");
    });

    it("verifies the raw request body with the Meta app secret", () => {
        const rawBody = JSON.stringify({object: "whatsapp_business_account"});
        const signature = `sha256=${createHmac("sha256", "app-secret").update(rawBody).digest("hex")}`;
        expect(verifyWhatsAppWebhookSignature(rawBody, signature, "app-secret")).toBe(true);
        expect(verifyWhatsAppWebhookSignature(`${rawBody} `, signature, "app-secret")).toBe(false);
    });

    it("extracts inbound text and delivery status events", () => {
        const events = parseWhatsAppWebhook({
            object: "whatsapp_business_account",
            entry: [{
                id: "waba-123",
                changes: [{
                    field: "messages",
                    value: {
                        metadata: {phone_number_id: "phone-123"},
                        contacts: [{wa_id: "919876543210", profile: {name: "Asha"}}],
                        messages: [{from: "919876543210", id: "wamid.inbound", timestamp: "1786650000", type: "text", text: {body: "Hello Adamant"}}],
                        statuses: [{id: "wamid.outbound", status: "read", timestamp: "1786650100", recipient_id: "919876543210"}],
                    },
                }],
            }],
        });
        expect(events).toHaveLength(2);
        expect(events[0]).toMatchObject({kind: "message", contactName: "Asha", body: "Hello Adamant", waId: "919876543210"});
        expect(events[1]).toMatchObject({kind: "status", status: "read", messageId: "wamid.outbound"});
    });

    it("represents media messages without storing the webhook payload", () => {
        const [event] = parseWhatsAppWebhook({entry: [{id: "waba", changes: [{value: {
            metadata: {phone_number_id: "phone"},
            messages: [{from: "919876543210", id: "wamid.image", type: "image", timestamp: "1786650000", image: {id: "media-1", caption: "Reference"}}],
        }}]}]});
        expect(event).toMatchObject({kind: "message", messageType: "image", body: "[Image] Reference", mediaId: "media-1"});
    });

    it("keeps the media ID needed to play inbound audio", () => {
        const [event] = parseWhatsAppWebhook({entry: [{id: "waba", changes: [{value: {
            metadata: {phone_number_id: "phone"},
            messages: [{from: "919876543210", id: "wamid.audio", type: "audio", timestamp: "1786650000", audio: {id: "voice-1", mime_type: "audio/ogg"}}],
        }}]}]});
        expect(event).toMatchObject({kind: "message", messageType: "audio", body: "[Audio]", mediaId: "voice-1"});
    });

    it("resolves Meta's temporary media URL and downloads audio with authentication", async () => {
        process.env.WHATSAPP_ACCESS_TOKEN = "media-token";
        process.env.WHATSAPP_GRAPH_API_VERSION = "v23.0";
        const fetcher = vi.fn(async (input: string | URL | Request, init?: RequestInit) => {
            const url = String(input);
            const headers = new Headers(init?.headers);
            expect(headers.get("Authorization")).toBe("Bearer media-token");
            if (url.startsWith("https://graph.facebook.com/")) {
                expect(url).toContain("/v23.0/voice-1");
                expect(url).toContain("phone_number_id=phone-1");
                return Response.json({url: "https://lookaside.fbsbx.com/whatsapp/media", mime_type: "audio/ogg", file_size: 4});
            }
            expect(headers.get("Range")).toBe("bytes=0-3");
            return new Response(new Uint8Array([1, 2, 3, 4]), {
                status: 206,
                headers: {"content-type": "audio/ogg", "content-range": "bytes 0-3/4"},
            });
        });

        const media = await downloadWhatsAppMedia("voice-1", "phone-1", "bytes=0-3", fetcher as typeof fetch);
        expect(media.mimeType).toBe("audio/ogg");
        expect(media.fileSize).toBe(4);
        expect((await media.response.arrayBuffer()).byteLength).toBe(4);
        expect(fetcher).toHaveBeenCalledTimes(2);
    });

    it("acknowledges the first message and returning customers after a two-day gap", () => {
        expect(shouldSendWhatsAppAutoReply(null, "2026-08-15T02:00:00.000Z", 48)).toBe(true);
        expect(shouldSendWhatsAppAutoReply("2026-08-15T03:00:00.000Z", "2026-08-16T02:59:59.000Z", 48)).toBe(false);
        expect(shouldSendWhatsAppAutoReply("2026-08-15T03:00:00.000Z", "2026-08-16T03:00:00.000Z", 48)).toBe(true);
    });

    it("supports configurable automatic acknowledgement settings", () => {
        expect(isWhatsAppAutoReplyEnabled("")).toBe(true);
        expect(isWhatsAppAutoReplyEnabled("false")).toBe(false);
        expect(getWhatsAppAutoReplyMessage("")).toBe(DEFAULT_WHATSAPP_AUTO_REPLY);
        expect(getWhatsAppAutoReplyMessage("Thanks for reaching out.")).toBe("Thanks for reaching out.");
        expect(getWhatsAppAutoReplyGapHours("")).toBe(48);
        expect(getWhatsAppAutoReplyGapHours("72")).toBe(72);
        expect(getWhatsAppAutoReplyGapHours("12")).toBe(48);
    });

    it.each([
        ["What services do you offer?", "UI/UX design"],
        ["I want to build a website", "Business or brand name"],
        ["I need a mobile application", "Android and iOS"],
        ["How can I get a quotation?", "accurate quotation"],
        ["/services", "Explore our services"],
        ["/website please", "Required pages and features"],
        ["/app", "target users"],
        ["/quote", "Project scope"],
        ["/portfolio", "aetherseo.com"],
        ["/contact", "admin@theadamant.com"],
        ["/support", "do not share passwords"],
    ])("creates the correct automatic reply for %s", (trigger, expectedText) => {
        expect(getWhatsAppAutomationReply(trigger)).toContain(expectedText);
    });

    it("does not answer unrelated messages as commands", () => {
        expect(getWhatsAppAutomationReply("Hello, is anyone available?")).toBeNull();
    });
});
