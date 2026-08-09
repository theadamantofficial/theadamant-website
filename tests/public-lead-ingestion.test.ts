import {describe, expect, it} from "vitest";
import {
    buildWebsiteAuditExternalReference,
    mapContactInquiryToService,
    nameFromEmail,
} from "@/lib/crm/public-lead-ingestion";

describe("public CRM lead mapping", () => {
    it("maps website enquiry purposes to CRM services", () => {
        expect(mapContactInquiryToService("website-development")).toBe("Web Development");
        expect(mapContactInquiryToService("app-development")).toBe("Mobile App Development");
        expect(mapContactInquiryToService("digital-marketing")).toBe("Digital Marketing");
        expect(mapContactInquiryToService("partnership")).toBe("Other");
    });

    it("deduplicates the same audit submission within an hourly bucket", () => {
        const first = buildWebsiteAuditExternalReference(
            "LEAD@example.com",
            "https://example.com/",
            new Date("2026-08-09T08:05:00.000Z"),
        );
        const retry = buildWebsiteAuditExternalReference(
            "lead@example.com",
            "https://example.com/",
            new Date("2026-08-09T08:55:00.000Z"),
        );
        const later = buildWebsiteAuditExternalReference(
            "lead@example.com",
            "https://example.com/",
            new Date("2026-08-09T09:01:00.000Z"),
        );

        expect(first).toBe(retry);
        expect(later).not.toBe(first);
    });

    it("creates a readable fallback name from an email address", () => {
        expect(nameFromEmail("rahul.patel@example.com")).toBe("Rahul Patel");
    });
});
