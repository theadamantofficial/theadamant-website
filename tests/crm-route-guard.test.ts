import {beforeEach, describe, expect, it, vi} from "vitest";
import {NextRequest} from "next/server";

const {getCrmRequestContext} = vi.hoisted(() => ({getCrmRequestContext: vi.fn()}));

vi.mock("@/lib/crm/auth", () => ({
    getCrmRequestContext,
    crmErrorResponse: () => ({message: "Your session has expired. Sign in again.", status: 401}),
}));

describe("CRM route protection", () => {
    beforeEach(() => {
        getCrmRequestContext.mockRejectedValue(new Error("missing session"));
    });

    it("does not expose the leads collection without a valid session", async () => {
        const {GET} = await import("@/app/api/admin/leads/route");
        const response = await GET(new NextRequest("https://theadamant.com/api/admin/leads"));
        expect(response.status).toBe(401);
        await expect(response.json()).resolves.toEqual({error: "Your session has expired. Sign in again."});
    });

    it("does not expose dashboard analytics without a valid session", async () => {
        const {GET} = await import("@/app/api/admin/dashboard/route");
        const response = await GET(new NextRequest("https://theadamant.com/api/admin/dashboard"));
        expect(response.status).toBe(401);
    });

    it("does not expose the external prospect database without a valid session", async () => {
        const {GET} = await import("@/app/api/admin/prospects/route");
        const response = await GET(new NextRequest("https://theadamant.com/api/admin/prospects"));
        expect(response.status).toBe(401);
    });

    it("does not initiate WhatsApp outreach without a valid session", async () => {
        const {POST} = await import("@/app/api/admin/prospects/whatsapp/route");
        const response = await POST(new NextRequest("https://theadamant.com/api/admin/prospects/whatsapp", {
            method: "POST",
            body: JSON.stringify({recordId: 1, message: "Hello"}),
        }));
        expect(response.status).toBe(401);
    });

    it("does not expose the WhatsApp inbox without a valid session", async () => {
        const {GET} = await import("@/app/api/admin/whatsapp/conversations/route");
        const response = await GET(new NextRequest("https://theadamant.com/api/admin/whatsapp/conversations"));
        expect(response.status).toBe(401);
    });
});
