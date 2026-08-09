import {NextRequest, NextResponse} from "next/server";
import {clearCrmSessionCookies, createCrmAuthClient, setCrmSessionCookies} from "@/lib/crm/auth";
import {CRM_REFRESH_COOKIE} from "@/lib/crm/auth-cookies";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
    const nextPath = safeNextPath(request.nextUrl.searchParams.get("next"));
    const refreshToken = request.cookies.get(CRM_REFRESH_COOKIE)?.value;

    if (!refreshToken) return redirectToLogin(request, nextPath);

    const {data, error} = await createCrmAuthClient().auth.refreshSession({refresh_token: refreshToken});
    if (error || !data.session) return redirectToLogin(request, nextPath);

    const response = NextResponse.redirect(new URL(nextPath, request.url));
    setCrmSessionCookies(response, data.session);
    return response;
}

function redirectToLogin(request: NextRequest, nextPath: string) {
    const response = NextResponse.redirect(new URL(`/admin/login?next=${encodeURIComponent(nextPath)}`, request.url));
    clearCrmSessionCookies(response);
    return response;
}

function safeNextPath(value: string | null) {
    return value?.startsWith("/admin/") && !value.startsWith("//") ? value : "/admin/dashboard";
}
