import {NextRequest, NextResponse} from "next/server";
import {createCrmAuthClient, crmErrorResponse, CrmApiError} from "@/lib/crm/auth";
import {parseCrmCompanyEmail, parseCrmPassword} from "@/lib/crm/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
    try {
        const payload = await request.json() as {accessToken?: unknown; refreshToken?: unknown; password?: unknown};
        const accessToken = token(payload.accessToken);
        const refreshToken = token(payload.refreshToken);
        const password = parseCrmPassword(payload.password);
        const client = createCrmAuthClient();
        const {data, error: sessionError} = await client.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
        });
        if (sessionError || !data.user?.email) {
            throw new CrmApiError("This password reset link is invalid or has expired. Request a new link.", 401);
        }
        parseCrmCompanyEmail(data.user.email);

        const {data: profile, error: profileError} = await client.from("profiles")
            .select("active")
            .eq("id", data.user.id)
            .maybeSingle();
        if (profileError || !profile?.active) {
            throw new CrmApiError("This CRM account is not active. Contact an administrator.", 403);
        }

        const {error: updateError} = await client.auth.updateUser({password});
        if (updateError) {
            if (updateError.message.toLowerCase().includes("same password")) {
                throw new CrmApiError("Choose a password you have not used for this account.");
            }
            throw new CrmApiError("Your password could not be updated. Request a new reset link and try again.", 400);
        }
        return NextResponse.json({updated: true});
    } catch (error) {
        const {message, status} = crmErrorResponse(error);
        return NextResponse.json({error: message}, {status});
    }
}

function token(value: unknown) {
    const normalized = typeof value === "string" ? value.trim() : "";
    if (normalized.length < 20 || normalized.length > 8_192) {
        throw new CrmApiError("This password reset link is invalid or has expired. Request a new link.", 401);
    }
    return normalized;
}
