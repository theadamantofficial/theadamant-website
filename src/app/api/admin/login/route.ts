import {NextRequest, NextResponse} from "next/server";
import {createCrmAuthClient, crmErrorResponse, CrmApiError, createCrmUserClient, setCrmSessionCookies} from "@/lib/crm/auth";
import type {Profile} from "@/features/crm/types";
import {parseCrmCompanyEmail} from "@/lib/crm/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
    try {
        const payload = await request.json() as {email?: string; password?: string};
        const email = parseCrmCompanyEmail(payload.email);
        const password = payload.password || "";
        if (!password) throw new CrmApiError("Enter your email and password.");

        const {data, error} = await createCrmAuthClient().auth.signInWithPassword({email, password});
        if (error || !data.session || !data.user) throw new CrmApiError("Incorrect email or password.", 401);

        const userClient = createCrmUserClient(data.session.access_token);
        const {data: profileData, error: profileError} = await userClient
            .from("profiles")
            .select("id,full_name,email,role,avatar_url,active,created_at,updated_at")
            .eq("id", data.user.id)
            .maybeSingle();
        const profile = profileData as Profile | null;
        if (profileError) throw new CrmApiError("CRM access is not initialized. Apply the latest Supabase migration.", 503);
        if (!profile?.active) throw new CrmApiError("Your account does not have active CRM access.", 403);

        const response = NextResponse.json({authenticated: true});
        setCrmSessionCookies(response, data.session);
        return response;
    } catch (error) {
        const {message, status} = crmErrorResponse(error);
        return NextResponse.json({error: message}, {status});
    }
}
