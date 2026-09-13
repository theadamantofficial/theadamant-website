import {NextRequest} from "next/server";
import {afterEach, beforeEach, describe, expect, it, vi} from "vitest";

const mocks = vi.hoisted(() => ({context: vi.fn(), service: vi.fn(), prospect: vi.fn(), send: vi.fn(), pdf: vi.fn(), templates: vi.fn()}));
vi.mock("@/lib/crm/auth", async () => ({...await import("@/lib/crm/errors"), getCrmRequestContext: mocks.context}));
vi.mock("@/lib/crm/server-client", () => ({getCrmServiceClient: mocks.service}));
vi.mock("@/lib/crm/prospect-database", () => ({getProspectById: mocks.prospect}));
vi.mock("@/lib/crm/proposal-email-server", async (actual) => ({
    ...await actual<typeof import("@/lib/crm/proposal-email-server")>(), readProposalPdf: mocks.pdf, sendProposalEmail: mocks.send,
}));
vi.mock("@/lib/crm/whatsapp-cloud", () => ({getApprovedWhatsAppTemplates: mocks.templates}));
import {GET, POST} from "@/app/api/admin/prospects/email/route";

const insert = vi.fn();
const update = vi.fn();
let actor: {id: string; role: string; canAccessProspectDatabase: boolean};
let auditError: boolean;
let statusError: boolean;
const pdf = Buffer.from("%PDF-1.7\nproposal");

beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("NEXT_PUBLIC_EMAILJS_PUBLIC_KEY", "public-key");
    vi.stubEnv("EMAILJS_PROPOSAL_TEMPLATE_ID", "proposal-template");
    vi.stubEnv("WHATSAPP_ACCESS_TOKEN", "meta-token");
    vi.stubEnv("WHATSAPP_BUSINESS_ACCOUNT_ID", "meta-account");
    actor = {id: "actor-1", role: "admin", canAccessProspectDatabase: false};
    auditError = false;
    statusError = false;
    mocks.context.mockImplementation(async () => ({client: {source: "authenticated"}, actor}));
    mocks.pdf.mockResolvedValue(pdf);
    mocks.send.mockResolvedValue(undefined);
    mocks.prospect.mockResolvedValue({record_id: 7, corporate_email: "client@example.com (OK)", email: "personal@example.com", name: "Client"});
    mocks.templates.mockResolvedValue([{name: "client_proposal", language: "en_US", components: [{type: "BODY", text: "Our work {{1}}, {{2}}, {{3}}. Proposal attached."}]}]);
    mocks.service.mockReturnValue({from: (table: string) => ({
        insert: (row: unknown) => {insert(table, row); return {select: () => ({single: async () => ({data: {id: "outreach-1"}, error: auditError ? {code: "23514"} : null})})};},
        update: (row: unknown) => {update(table, row); return {eq: async () => ({error: statusError ? {code: "failed"} : null})};},
    })});
});
afterEach(() => vi.unstubAllEnvs());

const request = (payload?: unknown, suffix = "") => new NextRequest(`http://localhost/api/admin/prospects/email${suffix}`, payload ? {method: "POST", body: JSON.stringify(payload)} : {});
const payload = {recordId: 7, to: "client@example.com", subject: "Client proposal", message: "Our proposal is attached."};

describe("authenticated client proposal email API", () => {
    it("loads the exact approved template wording with the supplied links and pre-attached PDF metadata", async () => {
        const response = await GET(request());
        expect(response.status).toBe(200);
        expect(await response.json()).toMatchObject({configured: true, draftSource: "Client proposal template",
            message: "Our work https://aetherseo.com/en, https://prep-vista-five.vercel.app/, https://prep-vista-five.vercel.app/. Proposal attached.",
            attachment: {filename: "Adamant_Technologies_Client_Proposal.pdf", size: pdf.length}});
        expect(mocks.send).not.toHaveBeenCalled();
    });

    it("labels its PDF-based draft when the live template cannot be loaded", async () => {
        mocks.templates.mockRejectedValue(new Error("Meta unavailable"));
        const response = await GET(request());
        expect(await response.json()).toMatchObject({draftSource: "Draft from proposal PDF", message: expect.stringContaining("Our client proposal is attached")});
    });

    it("serves a private PDF preview only after checking database and CRM access", async () => {
        const response = await GET(request(undefined, "?attachment=1"));
        expect(response.headers.get("Content-Type")).toBe("application/pdf");
        expect(response.headers.get("Cache-Control")).toBe("private, no-store");
        expect(Buffer.from(await response.arrayBuffer())).toEqual(pdf);
        actor.role = "employee";
        expect((await GET(request(undefined, "?attachment=1"))).status).toBe(403);
    });

    it("rejects an ungranted employee before contacting the source, audit or provider", async () => {
        actor.role = "employee";
        expect((await POST(request(payload))).status).toBe(403);
        expect(mocks.prospect).not.toHaveBeenCalled();
        expect(insert).not.toHaveBeenCalled();
        expect(mocks.send).not.toHaveBeenCalled();
    });

    it("sends to a verified corporate recipient with the actual PDF and records outreach", async () => {
        const response = await POST(request(payload));
        expect(response.status).toBe(201);
        expect(await response.json()).toEqual({sent: true, outreachLogged: true});
        expect(mocks.send).toHaveBeenCalledWith({to: payload.to, name: "Client", subject: payload.subject, message: payload.message, pdf});
        expect(insert).toHaveBeenCalledWith("prospect_outreach_events", expect.objectContaining({channel: "email", prospect_record_id: 7, destination: payload.to, status: "initiated"}));
        expect(update).toHaveBeenCalledWith("prospect_outreach_events", {status: "sent"});
    });

    it("allows a granted employee to send and records their identity", async () => {
        actor.role = "employee";
        actor.canAccessProspectDatabase = true;
        expect((await POST(request(payload))).status).toBe(201);
        expect(insert).toHaveBeenCalledWith("prospect_outreach_events", expect.objectContaining({user_id: actor.id}));
    });

    it("refuses an address that does not belong to the chosen lead", async () => {
        expect((await POST(request({...payload, to: "other@example.com"}))).status).toBe(400);
        expect(mocks.send).not.toHaveBeenCalled();
        expect(insert).not.toHaveBeenCalled();
    });

    it.each([{subject: "Injected\r\nBcc: other@example.com"}, {message: "Fill {{customer_name}}"}, {message: ""}])("rejects invalid content before sending: %j", async (invalid) => {
        expect((await POST(request({...payload, ...invalid}))).status).toBe(400);
        expect(mocks.send).not.toHaveBeenCalled();
    });

    it("does not send when the email-channel audit migration is missing", async () => {
        auditError = true;
        expect((await POST(request(payload))).status).toBe(503);
        expect(mocks.send).not.toHaveBeenCalled();
    });

    it("records provider rejection as failed", async () => {
        const {CrmApiError} = await import("@/lib/crm/errors");
        mocks.send.mockRejectedValue(new CrmApiError("Attachment rejected", 502));
        expect((await POST(request(payload))).status).toBe(502);
        expect(update).toHaveBeenCalledWith("prospect_outreach_events", {status: "failed"});
    });

    it("keeps an accepted send successful if its audit-status update fails", async () => {
        statusError = true;
        const response = await POST(request(payload));
        expect(response.status).toBe(201);
        expect(await response.json()).toEqual({sent: true, outreachLogged: false});
        expect(update).not.toHaveBeenCalledWith("prospect_outreach_events", {status: "failed"});
    });
});
