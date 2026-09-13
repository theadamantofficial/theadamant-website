import {NextRequest} from "next/server";
import {afterEach, beforeEach, describe, expect, it, vi} from "vitest";

const mocks = vi.hoisted(() => ({
    context: vi.fn(), service: vi.fn(), prospect: vi.fn(), text: vi.fn(), template: vi.fn(),
}));
vi.mock("@/lib/crm/auth", async () => ({
    ...await import("@/lib/crm/errors"), getCrmRequestContext: mocks.context,
}));
vi.mock("@/lib/crm/server-client", () => ({getCrmServiceClient: mocks.service}));
vi.mock("@/lib/crm/prospect-database", () => ({getProspectById: mocks.prospect}));
vi.mock("@/lib/crm/whatsapp-cloud", () => ({
    sendWhatsAppText: mocks.text, sendWhatsAppTemplate: mocks.template, sendWhatsAppReaction: vi.fn(),
}));
import {POST as prepare} from "@/app/api/admin/prospects/whatsapp/route";
import {POST as send} from "@/app/api/admin/whatsapp/conversations/[id]/messages/route";

const conversation = {id: "conversation-1", wa_id: "13125550123", customer_service_window_expires_at: null as string | null};
let actor: {id: string; role: string; canAccessProspectDatabase: boolean};
let accessible: typeof conversation | null;
let failAudit: boolean;
const inserts = vi.fn();
const updates = vi.fn();
const upserts = vi.fn();

function client() {
    return {from(table: string) {
        return {
            select() {
                const query = {
                    eq: vi.fn(() => query),
                    maybeSingle: async () => ({data: accessible, error: null}),
                    single: async () => ({data: {id: "message-1", status: "sent"}, error: null}),
                };
                return query;
            },
            insert(row: unknown) {
                inserts(table, row);
                return {select: () => ({single: async () => ({
                    data: {id: table === "whatsapp_messages" ? "message-1" : "outreach-1"},
                    error: table === "prospect_outreach_events" && failAudit ? {message: "unavailable"} : null,
                })})};
            },
            update(row: unknown) {
                updates(table, row);
                return {eq: async () => ({error: null})};
            },
            upsert: async (row: unknown, options: unknown) => {upserts(table, row, options); return {error: null};},
        };
    }};
}

beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("WHATSAPP_ACCESS_TOKEN", "test-token");
    vi.stubEnv("WHATSAPP_PHONE_NUMBER_ID", "test-sender");
    actor = {id: "actor-1", role: "admin", canAccessProspectDatabase: false};
    accessible = {...conversation};
    failAudit = false;
    mocks.context.mockImplementation(async () => ({client: client(), actor}));
    mocks.service.mockImplementation(client);
    mocks.prospect.mockResolvedValue({record_id: 7, phone: "(312) 555-0123", country: "USA", name: "Test contact"});
    mocks.text.mockResolvedValue({messageId: "wamid.test"});
    mocks.template.mockResolvedValue({messageId: "wamid.test"});
});
afterEach(() => vi.unstubAllEnvs());

const request = (payload: unknown) => new NextRequest("http://localhost/api/admin/prospects/whatsapp", {
    method: "POST", body: JSON.stringify(payload),
});
const context = {params: Promise.resolve({id: conversation.id})};

describe("sending purchased lead messages through the CRM", () => {
    it("prepares a CRM conversation without opening WhatsApp, sending or creating an operational lead", async () => {
        const response = await prepare(request({recordId: 7}));
        expect(response.status).toBe(200);
        expect(await response.json()).toEqual({conversation});
        expect(upserts).toHaveBeenCalledWith("whatsapp_conversations", expect.objectContaining({
            wa_id: conversation.wa_id, lead_id: null,
        }), {onConflict: "phone_number_id,wa_id", ignoreDuplicates: true});
        expect(inserts).not.toHaveBeenCalled();
        expect(mocks.text).not.toHaveBeenCalled();
        expect(mocks.template).not.toHaveBeenCalled();
    });

    it("assigns a new employee conversation to its creator without overwriting an existing assignment", async () => {
        actor.role = "employee";
        actor.canAccessProspectDatabase = true;
        accessible = null;
        const response = await prepare(request({recordId: 7}));
        expect(response.status).toBe(403);
        expect(upserts).toHaveBeenCalledWith("whatsapp_conversations", expect.objectContaining({assigned_to: actor.id}),
            expect.objectContaining({ignoreDuplicates: true}));
        expect(updates).not.toHaveBeenCalled();
    });

    it("blocks employees without database access before preparing a conversation", async () => {
        actor.role = "employee";
        expect((await prepare(request({recordId: 7}))).status).toBe(403);
        expect(upserts).not.toHaveBeenCalled();
    });

    it("requires an approved template when the reply window is closed", async () => {
        const response = await send(request({body: "Hello", prospectRecordId: 7}), context);
        expect(response.status).toBe(409);
        expect(inserts).not.toHaveBeenCalled();
        expect(mocks.text).not.toHaveBeenCalled();
    });

    it("sends a template using the business provider and links its CRM history and outreach", async () => {
        const response = await send(request({body: "Hello", prospectRecordId: 7,
            template: {name: "welcome", language: "en_US", parameters: []}}), context);
        expect(response.status).toBe(201);
        expect(mocks.template).toHaveBeenCalledWith(conversation.wa_id, "welcome", "en_US", [], undefined);
        expect(inserts).toHaveBeenCalledWith("whatsapp_messages", expect.objectContaining({status: "queued", message_type: "template"}));
        expect(inserts).toHaveBeenCalledWith("prospect_outreach_events", expect.objectContaining({
            prospect_record_id: 7, destination: conversation.wa_id,
            metadata: expect.objectContaining({conversation_id: conversation.id, local_message_id: "message-1"}),
        }));
        expect(updates).toHaveBeenCalledWith("whatsapp_messages", expect.objectContaining({metadata: {prospect_outreach_id: "outreach-1"}}));
        expect(updates).toHaveBeenCalledWith("prospect_outreach_events", {provider_message_id: "wamid.test", status: "sent"});
    });

    it("sends free-form text during an open reply window", async () => {
        accessible!.customer_service_window_expires_at = new Date(Date.now() + 60000).toISOString();
        expect((await send(request({body: "Hello", prospectRecordId: 7}), context)).status).toBe(201);
        expect(mocks.text).toHaveBeenCalledWith(conversation.wa_id, "Hello");
        expect(mocks.template).not.toHaveBeenCalled();
    });

    it("rejects a source record whose phone differs from the accessible conversation", async () => {
        mocks.prospect.mockResolvedValue({record_id: 7, phone: "+15555550199", country: "USA"});
        const response = await send(request({prospectRecordId: 7, template: {name: "welcome", language: "en_US"}}), context);
        expect(response.status).toBe(409);
        expect(inserts).not.toHaveBeenCalled();
        expect(mocks.template).not.toHaveBeenCalled();
    });

    it("marks provider failures in both histories without reporting success", async () => {
        const {CrmApiError} = await import("@/lib/crm/errors");
        mocks.template.mockRejectedValue(new CrmApiError("Provider rejected the send", 400));
        const response = await send(request({prospectRecordId: 7, template: {name: "welcome", language: "en_US"}}), context);
        expect(response.status).toBe(400);
        expect(updates).toHaveBeenCalledWith("whatsapp_messages", {status: "failed"});
        expect(updates).toHaveBeenCalledWith("prospect_outreach_events", {status: "failed"});
        expect(updates).not.toHaveBeenCalledWith("prospect_outreach_events", expect.objectContaining({status: "sent"}));
    });

    it("does not call the provider when recording outreach fails", async () => {
        failAudit = true;
        const response = await send(request({prospectRecordId: 7, template: {name: "welcome", language: "en_US"}}), context);
        expect(response.status).toBe(502);
        expect(mocks.template).not.toHaveBeenCalled();
        expect(updates).toHaveBeenCalledWith("whatsapp_messages", {status: "failed"});
    });
});
