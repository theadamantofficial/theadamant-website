import {NextRequest, NextResponse} from "next/server";
import {
    ADMIN_SESSION_COOKIE,
    AdminApiError,
    SUPER_ADMIN_EMAIL,
    adminErrorResponse,
    createAdminSessionToken,
    getAdminSessionCookieOptions,
    getSupabaseAdminClient,
    getSupabaseLoginClient,
    isAdminBackendConfigured,
    normalizeEmail,
} from "@/lib/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
    try {
        if (!isAdminBackendConfigured()) {
            throw new AdminApiError("The admin panel is not configured yet.", 503);
        }

        const payload = await request.json() as {email?: string; password?: string};
        const email = normalizeEmail(payload.email || "");
        const password = payload.password || "";

        if (!email || !password) {
            throw new AdminApiError("Enter your email and password.", 400);
        }

        const {data, error} = await getSupabaseLoginClient().auth.signInWithPassword({email, password});

        if (error || !data.user?.email) {
            throw new AdminApiError("Incorrect email or password.", 401);
        }

        const userEmail = normalizeEmail(data.user.email);
        const serviceClient = getSupabaseAdminClient();

        if (userEmail === SUPER_ADMIN_EMAIL) {
            const {error: profileError} = await serviceClient.from("admin_members").upsert({
                user_id: data.user.id,
                email: userEmail,
                full_name: String(data.user.user_metadata?.full_name || "Adamant Admin"),
                role: "super_admin",
                active: true,
            }, {onConflict: "user_id"});

            if (profileError) {
                throw new AdminApiError("Admin access is not initialized. Apply the latest Supabase migration.", 503);
            }
        } else {
            const {data: member, error: memberError} = await serviceClient
                .from("admin_members")
                .select("active")
                .eq("user_id", data.user.id)
                .maybeSingle();

            if (memberError) {
                throw new AdminApiError("Admin access is not initialized. Apply the latest Supabase migration.", 503);
            }

            if (!member?.active) {
                throw new AdminApiError("Your account does not have admin panel access.", 403);
            }
        }

        const response = NextResponse.json({authenticated: true});
        response.cookies.set(
            ADMIN_SESSION_COOKIE,
            createAdminSessionToken({id: data.user.id, email: userEmail}),
            getAdminSessionCookieOptions(),
        );
        return response;
    } catch (error) {
        const {message, status} = adminErrorResponse(error);
        return NextResponse.json({error: message}, {status});
    }
}
