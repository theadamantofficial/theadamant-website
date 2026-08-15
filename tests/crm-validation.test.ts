import {describe, expect, it} from "vitest";
import {parseCrmCompanyEmail, parseCrmPassword, parseCrmSignupInput, parseLeadInput, parsePage, parseTaskInput} from "@/lib/crm/validation";

describe("CRM input validation", () => {
    it("normalizes a complete lead payload", () => {
        expect(parseLeadInput({
            customer_name: "  Rahul Sharma  ",
            service_required: "Web Development",
            email: "rahul@example.com",
            lead_source: "website",
            status: "proposal_sent",
            priority: "high",
            estimated_value: "150000",
        })).toMatchObject({
            customer_name: "Rahul Sharma",
            service_required: "Web Development",
            email: "rahul@example.com",
            lead_source: "website",
            status: "proposal_sent",
            priority: "high",
            estimated_value: 150000,
        });
    });

    it("rejects unknown lead stages", () => {
        expect(() => parseLeadInput({
            customer_name: "Rahul",
            service_required: "SEO",
            status: "qualified",
        })).toThrow("valid lead status");
    });

    it("requires an assignee and due date for new tasks", () => {
        expect(() => parseTaskInput({title: "Follow up"})).toThrow("assigned user");
    });

    it("caps API pagination at one hundred rows", () => {
        const params = new URLSearchParams({page: "3", pageSize: "500"});
        expect(parsePage(params)).toEqual({page: 3, pageSize: 100, from: 200, to: 299});
    });

    it("accepts only normalized Adamant company emails", () => {
        expect(parseCrmCompanyEmail("  TEAM@THEADAMANT.COM ")).toBe("team@theadamant.com");
        expect(() => parseCrmCompanyEmail("team@gmail.com")).toThrow("@theadamant.com");
    });

    it("validates the minimal CRM sign-up fields", () => {
        expect(parseCrmSignupInput({
            fullName: "  Adamant Teammate  ",
            email: "teammate@theadamant.com",
            password: "securepass123",
        })).toEqual({
            fullName: "Adamant Teammate",
            email: "teammate@theadamant.com",
            password: "securepass123",
        });
        expect(() => parseCrmSignupInput({fullName: "A", email: "a@theadamant.com", password: "short"})).toThrow("full name");
    });

    it("enforces password length for password recovery", () => {
        expect(parseCrmPassword("securepass123")).toBe("securepass123");
        expect(() => parseCrmPassword("short")).toThrow("at least 8");
        expect(() => parseCrmPassword("x".repeat(129))).toThrow("128 characters");
    });
});
