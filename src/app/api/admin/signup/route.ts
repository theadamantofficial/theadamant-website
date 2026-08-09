import {NextRequest, NextResponse} from "next/server";
import {createCrmAuthClient, crmErrorResponse, CrmApiError, setCrmSessionCookies} from "@/lib/crm/auth";
import {parseCrmSignupInput} from "@/lib/crm/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
    try {
        const payload = await request.json() as Record<string, unknown>;
        const {fullName, email, password} = parseCrmSignupInput(payload);

        const {data, error} = await createCrmAuthClient().auth.signUp({
            email,
            password,
            options: {data: {full_name: fullName}},
        });

        if (error) {
            const normalizedMessage = error.message.toLowerCase();
            if (normalizedMessage.includes("already registered") || normalizedMessage.includes("already exists")) {
                throw new CrmApiError("An account with this company email already exists. Sign in instead.", 409);
            }
            if (normalizedMessage.includes("rate limit")) {
                throw new CrmApiError("Too many sign-up attempts. Please wait a few minutes and try again.", 429);
            }
            throw new CrmApiError("Unable to create your account. Please try again.", 400);
        }

        if (!data.user) throw new CrmApiError("Unable to create your account. Please try again.", 502);

        if (!data.session) {
            return NextResponse.json({created: true, requiresEmailConfirmation: true});
        }

        const response = NextResponse.json({created: true, authenticated: true});
        setCrmSessionCookies(response, data.session);
        return response;
    } catch (error) {
        const {message, status} = crmErrorResponse(error);
        return NextResponse.json({error: message}, {status});
    }
}
