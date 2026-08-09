import {createClient, type SupabaseClient} from "@supabase/supabase-js";
import {cookies} from "next/headers";
import type {NextRequest, NextResponse} from "next/server";
import type {CrmActor, Profile} from "@/features/crm/types";
import {CRM_ACCESS_COOKIE, CRM_AUTH_COOKIE_OPTIONS, CRM_REFRESH_COOKIE} from "@/lib/crm/auth-cookies";
import {CrmApiError} from "@/lib/crm/errors";

export {CrmApiError, crmErrorResponse} from "@/lib/crm/errors";

export function createCrmAuthClient() {
    const {url, publicKey} = getCrmSupabaseConfig();
    return createClient(url, publicKey, {auth: {autoRefreshToken: false, persistSession: false}});
}

export function createCrmUserClient(accessToken: string) {
    const {url, publicKey} = getCrmSupabaseConfig();
    return createClient(url, publicKey, {
        auth: {autoRefreshToken: false, persistSession: false},
        global: {headers: {Authorization: `Bearer ${accessToken}`}},
    });
}

export async function getCrmRequestContext(request: NextRequest) {
    const accessToken = request.cookies.get(CRM_ACCESS_COOKIE)?.value;

    if (!accessToken) {
        throw new CrmApiError("Your session has expired. Sign in again.", 401);
    }

    return getContextFromToken(accessToken);
}

export async function getCrmPageActor() {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get(CRM_ACCESS_COOKIE)?.value;

    if (!accessToken) return null;

    try {
        return (await getContextFromToken(accessToken)).actor;
    } catch {
        return null;
    }
}

export function setCrmSessionCookies(response: NextResponse, session: {access_token: string; refresh_token: string; expires_in?: number}) {
    response.cookies.set(CRM_ACCESS_COOKIE, session.access_token, {
        ...CRM_AUTH_COOKIE_OPTIONS,
        maxAge: Math.max(60, session.expires_in || 3600),
    });
    response.cookies.set(CRM_REFRESH_COOKIE, session.refresh_token, {
        ...CRM_AUTH_COOKIE_OPTIONS,
        maxAge: 60 * 60 * 24 * 30,
    });
}

export function clearCrmSessionCookies(response: NextResponse) {
    response.cookies.set(CRM_ACCESS_COOKIE, "", {...CRM_AUTH_COOKIE_OPTIONS, maxAge: 0});
    response.cookies.set(CRM_REFRESH_COOKIE, "", {...CRM_AUTH_COOKIE_OPTIONS, maxAge: 0});
}

export function requireCrmRoles(actor: CrmActor, roles: CrmActor["role"][]) {
    if (!roles.includes(actor.role)) {
        throw new CrmApiError("You do not have permission to perform this action.", 403);
    }
}

async function getContextFromToken(accessToken: string): Promise<{client: SupabaseClient; actor: CrmActor}> {
    const client = createCrmUserClient(accessToken);
    const {data: userData, error: userError} = await client.auth.getUser(accessToken);

    if (userError || !userData.user?.email) {
        throw new CrmApiError("Your session has expired. Sign in again.", 401);
    }

    const {data, error} = await client
        .from("profiles")
        .select("id,full_name,email,role,avatar_url,active,created_at,updated_at")
        .eq("id", userData.user.id)
        .maybeSingle();

    if (error) throw new CrmApiError("The CRM profile could not be loaded. Apply the latest Supabase migration.", 503);
    const profile = data as Profile | null;
    if (!profile?.active) throw new CrmApiError("Your CRM access is disabled.", 403);

    return {
        client,
        actor: {
            id: profile.id,
            email: profile.email,
            fullName: profile.full_name || profile.email.split("@")[0],
            role: profile.role,
            avatarUrl: profile.avatar_url,
        },
    };
}

function getCrmSupabaseConfig() {
    const url = normalize(process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL);
    const publicKey = normalize(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_PUBLISHABLE_KEY);
    if (!url || !publicKey) throw new CrmApiError("Supabase Auth is not configured.", 503);
    return {url, publicKey};
}

function normalize(value?: string) {
    return value?.trim().replace(/^['"]|['"]$/g, "") || "";
}
