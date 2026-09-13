import {afterEach, describe, expect, it, vi} from "vitest";
import type {SupabaseClient} from "@supabase/supabase-js";
import type {Prospect} from "@/features/crm/types";
import {getProspectWhatsAppStatus} from "@/lib/crm/prospect-whatsapp-status";
import {CLIENT_PROPOSAL_LINKS, isClientProposalTemplate} from "@/lib/crm/whatsapp-proposal";

afterEach(() => vi.unstubAllEnvs());
const prospect = (id: number, phone: string) => ({record_id: id, phone, country: "USA"}) as Prospect;

describe("purchased lead CRM contact indicators", () => {
    it("matches normalized phone numbers and deduplicates repeated source contacts", async () => {
        vi.stubEnv("WHATSAPP_PHONE_NUMBER_ID", "sender-1");
        const rpc = vi.fn().mockResolvedValue({data: [
            {destination: "13125550123", conversation_id: "crm-1", initial_message_sent: true},
            {destination: "13125550124", conversation_id: "crm-2", initial_message_sent: false},
            {destination: "13125550125", conversation_id: null, initial_message_sent: false},
        ], error: null});
        const result = await getProspectWhatsAppStatus({rpc} as unknown as SupabaseClient, [
            prospect(1, "(312) 555-0123"), prospect(2, "+1 312 555 0123"),
            prospect(3, "3125550124"), prospect(4, "3125550125"), prospect(5, "N/A"),
        ]);
        expect(rpc).toHaveBeenCalledWith("prospect_whatsapp_contact_status", {
            p_phone_number_id: "sender-1", p_destinations: ["13125550123", "13125550124", "13125550125"],
        });
        expect(result.whatsappStatusAvailable).toBe(true);
        expect(result.prospects.map((item) => item.whatsapp)).toEqual([
            {conversationId: "crm-1", initialMessageSent: true},
            {conversationId: "crm-1", initialMessageSent: true},
            {conversationId: "crm-2", initialMessageSent: false},
            {conversationId: null, initialMessageSent: false}, undefined,
        ]);
    });

    it("shows unavailable status instead of falsely reporting uncontacted leads on RPC failure", async () => {
        vi.stubEnv("WHATSAPP_PHONE_NUMBER_ID", "sender-1");
        const rpc = vi.fn().mockResolvedValue({data: null, error: {code: "PGRST202"}});
        const result = await getProspectWhatsAppStatus({rpc} as unknown as SupabaseClient, [prospect(1, "3125550123")]);
        expect(result.whatsappStatusAvailable).toBe(false);
        expect(result.prospects[0].whatsapp).toBeUndefined();
    });

    it("keeps the specified three proposal links, including the repeated third link", () => {
        expect(CLIENT_PROPOSAL_LINKS).toEqual({
            "1": "https://aetherseo.com/en",
            "2": "https://prep-vista-five.vercel.app/",
            "3": "https://prep-vista-five.vercel.app/",
        });
        expect(isClientProposalTemplate("client_proposal")).toBe(true);
        expect(isClientProposalTemplate("Client Proposal")).toBe(true);
        expect(isClientProposalTemplate("welcome")).toBe(false);
    });
});
