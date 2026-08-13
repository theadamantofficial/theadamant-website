import {describe, expect, it} from "vitest";
import {cleanProspectEmail, createWhatsAppUrl, normalizeWhatsAppPhone} from "@/lib/crm/whatsapp";

describe("CRM WhatsApp preparation", () => {
    it("normalizes common USA source phone numbers", () => {
        expect(normalizeWhatsAppPhone("(312) 612-0082", "USA")).toBe("13126120082");
        expect(normalizeWhatsAppPhone("+1 800 554 8010", "United States")).toBe("18005548010");
    });

    it("rejects unusable destination numbers", () => {
        expect(() => normalizeWhatsAppPhone("N/A", "USA")).toThrow("valid WhatsApp phone");
    });

    it("creates an encoded click-to-chat URL", () => {
        expect(createWhatsAppUrl("13126120082", "Hello & welcome"))
            .toBe("https://wa.me/13126120082?text=Hello%20%26%20welcome");
    });

    it("extracts a usable email from source annotations", () => {
        expect(cleanProspectEmail("qiara@cosmoconcierge.com (Accept_all)"))
            .toBe("qiara@cosmoconcierge.com");
    });
});
