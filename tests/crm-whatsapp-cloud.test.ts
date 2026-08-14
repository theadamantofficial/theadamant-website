import {createHmac} from "node:crypto";
import {describe, expect, it} from "vitest";
import {getWhatsAppWebhookChallenge, parseWhatsAppWebhook, verifyWhatsAppWebhookSignature} from "@/lib/crm/whatsapp-cloud";

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
});
