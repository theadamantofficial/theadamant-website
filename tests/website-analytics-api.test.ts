import {NextRequest} from "next/server";
import {afterEach, beforeEach, describe, expect, it, vi} from "vitest";
import {CrmApiError} from "@/lib/crm/errors";
import {canViewWebsiteAnalytics} from "@/features/crm/permissions";
import type {CrmRole} from "@/features/crm/types";

const mocks = vi.hoisted(() => ({context: vi.fn(), reports: vi.fn()}));
vi.mock("@/lib/crm/auth", async () => ({...await import("@/lib/crm/errors"), getCrmRequestContext: mocks.context}));
vi.mock("@/lib/crm/website-analytics", async (actual) => ({...await actual<typeof import("@/lib/crm/website-analytics")>(), getWebsiteAnalytics: mocks.reports}));
import {GET} from "@/app/api/admin/analytics/route";
const request = (query = "") => new NextRequest(`http://localhost/api/admin/analytics${query}`);

beforeEach(() => {
    vi.clearAllMocks();
    mocks.context.mockResolvedValue({actor: {role: "admin"}});
    mocks.reports.mockResolvedValue({connection: {configured: false}, report: null});
});
afterEach(() => vi.restoreAllMocks());

describe("admin website analytics authorization", () => {
    it.each<CrmRole>(["admin", "super_admin"])("allows %s to read reports with private cache headers", async (role) => {
        mocks.context.mockResolvedValue({actor: {role}});
        expect(canViewWebsiteAnalytics(role)).toBe(true);
        const response = await GET(request("?days=7"));
        expect(response.status).toBe(200);
        expect(response.headers.get("Cache-Control")).toBe("private, no-store");
        expect(mocks.reports).toHaveBeenCalledWith(7);
    });

    it.each<CrmRole>(["employee", "cto", "developer", "qa", "developer_qa"])("denies %s before contacting Google", async (role) => {
        mocks.context.mockResolvedValue({actor: {role}});
        expect(canViewWebsiteAnalytics(role)).toBe(false);
        expect((await GET(request())).status).toBe(403);
        expect(mocks.reports).not.toHaveBeenCalled();
    });

    it("denies unauthenticated requests and rejects unbounded dates", async () => {
        mocks.context.mockRejectedValueOnce(new CrmApiError("Sign in", 401));
        expect((await GET(request())).status).toBe(401);
        expect((await GET(request("?days=36500"))).status).toBe(400);
        expect(mocks.reports).not.toHaveBeenCalled();
    });

    it("defaults to 30 days and returns report failures as errors", async () => {
        await GET(request());
        expect(mocks.reports).toHaveBeenCalledWith(30);
        mocks.reports.mockRejectedValueOnce(new CrmApiError("Google Analytics access was denied", 502));
        const response = await GET(request());
        expect(response.status).toBe(502);
        expect(await response.json()).toEqual({error: "Google Analytics access was denied"});
    });
});
