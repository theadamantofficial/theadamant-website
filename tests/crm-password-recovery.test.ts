import {beforeEach, describe, expect, it, vi} from "vitest";
import {NextRequest} from "next/server";
import {middleware} from "../middleware";

const mocks = vi.hoisted(() => ({
    resetPasswordForEmail: vi.fn(),
    setSession: vi.fn(),
    updateUser: vi.fn(),
    profileMaybeSingle: vi.fn(),
}));

vi.mock("@/lib/crm/auth", async () => {
    const actual = await vi.importActual<typeof import("@/lib/crm/auth")>("@/lib/crm/auth");
    return {
        ...actual,
        createCrmAuthClient: () => ({
            auth: {
                resetPasswordForEmail: mocks.resetPasswordForEmail,
                setSession: mocks.setSession,
                updateUser: mocks.updateUser,
            },
            from: () => {
                const query = {
                    select: () => query,
                    eq: () => query,
                    maybeSingle: mocks.profileMaybeSingle,
                };
                return query;
            },
        }),
    };
});

describe("CRM password recovery", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mocks.resetPasswordForEmail.mockResolvedValue({error: null});
        mocks.setSession.mockResolvedValue({data: {user: {id: "user-1", email: "team@theadamant.com"}}, error: null});
        mocks.profileMaybeSingle.mockResolvedValue({data: {active: true}, error: null});
        mocks.updateUser.mockResolvedValue({error: null});
    });

    it("sends a recovery link to a company email with the trusted redirect", async () => {
        const {POST} = await import("@/app/api/admin/forgot-password/route");
        const response = await POST(new NextRequest("https://theadamant.com/api/admin/forgot-password", {
            method: "POST",
            body: JSON.stringify({email: "TEAM@THEADAMANT.COM"}),
        }));
        expect(response.status).toBe(200);
        expect(mocks.resetPasswordForEmail).toHaveBeenCalledWith("team@theadamant.com", {
            redirectTo: "https://theadamant.com/admin/reset-password",
        });
        await expect(response.json()).resolves.toMatchObject({sent: true});
    });

    it("does not send recovery email outside the company domain", async () => {
        const {POST} = await import("@/app/api/admin/forgot-password/route");
        const response = await POST(new NextRequest("https://theadamant.com/api/admin/forgot-password", {
            method: "POST",
            body: JSON.stringify({email: "team@gmail.com"}),
        }));
        expect(response.status).toBe(400);
        expect(mocks.resetPasswordForEmail).not.toHaveBeenCalled();
    });

    it("updates the password only with valid recovery tokens and an active profile", async () => {
        const {POST} = await import("@/app/api/admin/reset-password/route");
        const response = await POST(new NextRequest("https://theadamant.com/api/admin/reset-password", {
            method: "POST",
            body: JSON.stringify({
                accessToken: "a".repeat(40),
                refreshToken: "r".repeat(40),
                password: "new-secure-password",
            }),
        }));
        expect(response.status).toBe(200);
        expect(mocks.setSession).toHaveBeenCalledWith({access_token: "a".repeat(40), refresh_token: "r".repeat(40)});
        expect(mocks.updateUser).toHaveBeenCalledWith({password: "new-secure-password"});
    });

    it("rejects inactive accounts before changing their password", async () => {
        mocks.profileMaybeSingle.mockResolvedValueOnce({data: {active: false}, error: null});
        const {POST} = await import("@/app/api/admin/reset-password/route");
        const response = await POST(new NextRequest("https://theadamant.com/api/admin/reset-password", {
            method: "POST",
            body: JSON.stringify({accessToken: "a".repeat(40), refreshToken: "r".repeat(40), password: "new-secure-password"}),
        }));
        expect(response.status).toBe(403);
        expect(mocks.updateUser).not.toHaveBeenCalled();
    });

    it("keeps the reset page public so recovery links are not sent back to login", () => {
        const response = middleware(new NextRequest("https://theadamant.com/admin/reset-password"));
        expect(response.status).toBe(200);
        expect(response.headers.get("x-middleware-next")).toBe("1");
    });
});
