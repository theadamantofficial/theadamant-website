import {describe, expect, it} from "vitest";
import {
    buildWhatsAppOrderDetails,
    buildWhatsAppOrderStatus,
    parseWhatsAppPaymentDraft,
} from "@/lib/crm/whatsapp-payments";

describe("WhatsApp payment orders", () => {
    it("validates line items and reconciles INR amounts in paise", () => {
        const draft = parseWhatsAppPaymentDraft({
            body: "Please review and pay for your project.",
            footer: "Adamant Technologies",
            items: [{name: "Website development", amount: "1250.50", quantity: 2}],
            tax: "450",
            discount: "100",
            quickPay: true,
            expiresInMinutes: 1440,
        });

        expect(draft.items[0]).toEqual({name: "Website development", amount_paise: 125050, quantity: 2});
        expect(draft.subtotal_paise).toBe(250100);
        expect(draft.tax_paise).toBe(45000);
        expect(draft.discount_paise).toBe(10000);
        expect(draft.total_paise).toBe(285100);
    });

    it("builds Meta's order_details payload with the active payment configuration", () => {
        const draft = parseWhatsAppPaymentDraft({
            body: "Please complete the payment.",
            footer: "Adamant Technologies",
            items: [{name: "UI/UX design", amount: "5000", quantity: 1}],
            tax: "900",
            discount: "0",
            quickPay: false,
            expiresInMinutes: 60,
        });
        const message = buildWhatsAppOrderDetails(draft, "AD-ORDER-1001", "Adamant.Technologies", new Date("2026-08-15T04:00:00.000Z"));
        const parameters = message.action.parameters;

        expect(message.type).toBe("order_details");
        expect(parameters).toMatchObject({
            reference_id: "AD-ORDER-1001",
            type: "digital-goods",
            payment_type: "upi",
            payment_configuration: "Adamant.Technologies",
            currency: "INR",
            total_amount: {value: 590000, offset: 100},
        });
        expect(parameters.order).toMatchObject({
            status: "pending",
            subtotal: {value: 500000, offset: 100},
            tax: {value: 90000, offset: 100},
            expiration: {timestamp: "1786770000"},
        });
    });

    it("builds auditable customer-visible order status updates", () => {
        expect(buildWhatsAppOrderStatus("AD-ORDER-1001", "processing", "Payment received. Your order is being processed."))
            .toMatchObject({
                type: "order_status",
                action: {
                    name: "review_order",
                    parameters: {
                        reference_id: "AD-ORDER-1001",
                        order: {status: "processing", description: "Payment received. Your order is being processed."},
                    },
                },
            });
    });

    it.each([
        [{body: "Pay", items: [], tax: "0", discount: "0"}, "Add at least one"],
        [{body: "Pay", items: [{name: "Service", amount: "12.345", quantity: 1}], tax: "0", discount: "0"}, "valid amount"],
        [{body: "Pay", items: [{name: "Service", amount: "100", quantity: 0}], tax: "0", discount: "0"}, "Quantity"],
        [{body: "Pay", items: [{name: "Service", amount: "100", quantity: 1}], tax: "0", discount: "101"}, "greater than"],
        [{body: "Pay", items: [{name: "Service", amount: "9007199254740", quantity: 999}], tax: "0", discount: "0"}, "too large"],
    ])("rejects invalid or unreconciled payment drafts", (payload, expected) => {
        expect(() => parseWhatsAppPaymentDraft(payload)).toThrow(expected);
    });

    it("rejects unknown payment configurations and invalid references", () => {
        const draft = parseWhatsAppPaymentDraft({body: "Pay", items: [{name: "Service", amount: "100", quantity: 1}]});
        expect(() => buildWhatsAppOrderDetails(draft, "not valid reference", "Adamant.Technologies")).toThrow("reference");
        expect(() => buildWhatsAppOrderDetails(draft, "AD-1", "")).toThrow("configuration");
    });
});
