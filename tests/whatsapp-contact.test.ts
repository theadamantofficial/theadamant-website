import {describe, expect, it} from "vitest";
import {ADAMANT_WHATSAPP_NUMBER, buildWhatsAppContactUrl} from "@/lib/whatsapp-contact";

describe("public WhatsApp contact link", () => {
    it("opens Adamant's number with editable enquiry details", () => {
        const url = new URL(buildWhatsAppContactUrl({
            name: "  Rahul Patel ",
            service: "Website Development",
            message: "I need a five-page site by October.",
        }));
        expect(url.origin + url.pathname).toBe(`https://wa.me/${ADAMANT_WHATSAPP_NUMBER}`);
        expect(url.searchParams.get("text")).toContain("I'm Rahul Patel.");
        expect(url.searchParams.get("text")).toContain("I'm interested in Website Development.");
        expect(url.searchParams.get("text")).toContain("Project details: I need a five-page site by October.");
    });

    it("creates a useful generic message when the form is empty", () => {
        const url = new URL(buildWhatsAppContactUrl({}));
        expect(url.searchParams.get("text")).toContain("I'm interested in your services.");
        expect(url.searchParams.get("text")).toContain("Please share the next steps.");
    });
});
