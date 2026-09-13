import {afterEach, beforeEach, describe, expect, it, vi} from "vitest";
import type {SupabaseClient} from "@supabase/supabase-js";
import {getProspectById, queryProspects} from "@/lib/crm/prospect-database";

beforeEach(() => vi.stubEnv("PROSPECT_DATABASE_MODE", "supabase"));
afterEach(() => vi.unstubAllEnvs());

function rpcClient(data: unknown, code?: string) {
    const rpc = vi.fn().mockResolvedValue({data, error: code ? {code} : null});
    return {rpc, client: {rpc} as unknown as SupabaseClient};
}

describe("production WhatsApp lead database", () => {
    it("uses the signed-in Supabase client on Vercel even without a local source file", async () => {
        vi.stubEnv("PROSPECT_DATABASE_MODE", "");
        vi.stubEnv("VERCEL", "1");
        vi.stubEnv("USA_LEADS_DATABASE_PATH", "/unavailable-purchased-database.sqlite");
        const {client, rpc} = rpcClient({rows: [], database: {total: 0, createdAt: null}});
        const result = await queryProspects({after: 0, pageSize: 50}, client);
        expect(result.database.total).toBe(0);
        expect(rpc).toHaveBeenCalledOnce();
    });

    it("keeps cursor pagination without returning the extra row", async () => {
        const rows = Array.from({length: 51}, (_, i) => ({record_id: 101 + i}));
        const {client} = rpcClient({rows, database: {total: 1000, createdAt: "2026-08-13"}});
        const result = await queryProspects({after: 100, pageSize: 50}, client);
        expect(result.prospects).toHaveLength(50);
        expect(result.page).toEqual({hasMore: true, nextAfter: 150});
        expect(result.database.total).toBe(1000);
    });

    it("passes search and filters as RPC parameters, including literal SQL punctuation", async () => {
        const {client, rpc} = rpcClient({rows: [], database: {total: 1, createdAt: null}});
        await queryProspects({after: 12, pageSize: 50, search: " O'Hare, 10%_ ", state: " CA ", city: " Oakland ", industry: " Retail ", hasPhone: true}, client);
        expect(rpc).toHaveBeenCalledWith("query_whatsapp_lead_db", {
            p_after: 12, p_page_size: 50, p_search: "O'Hare, 10%_",
            p_state: "CA", p_city: "Oakland", p_industry: "Retail", p_has_phone: true,
        });
    });

    it("requires a signed-in client instead of falling back to a secret or local file", async () => {
        await expect(queryProspects({after: 0, pageSize: 50})).rejects.toMatchObject({status: 401});
        await expect(getProspectById(1)).rejects.toMatchObject({status: 401});
    });

    it("looks up WhatsApp recipients only in the separate purchased table", async () => {
        const maybeSingle = vi.fn().mockResolvedValue({data: {record_id: 9, phone: "+15555550123"}, error: null});
        const eq = vi.fn().mockReturnValue({maybeSingle});
        const select = vi.fn().mockReturnValue({eq});
        const from = vi.fn().mockReturnValue({select});
        const result = await getProspectById(9, {from} as unknown as SupabaseClient);
        expect(from).toHaveBeenCalledWith("whatsapp-lead-db");
        expect(eq).toHaveBeenCalledWith("record_id", 9);
        expect(select.mock.calls[0][0]).toContain("source_file,source_sheet");
        expect(select.mock.calls[0][0]).not.toContain("source_record");
        expect(result?.record_id).toBe(9);
    });

    it.each([["57014", 408], ["42501", 403], ["PGRST202", 503]])("preserves the expected API status for %s", async (code, status) => {
        const {client} = rpcClient(null, code);
        await expect(queryProspects({after: 0, pageSize: 50}, client)).rejects.toMatchObject({status});
    });
});
