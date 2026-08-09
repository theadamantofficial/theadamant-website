import {NextRequest, NextResponse} from "next/server";
import {clearCrmSessionCookies, createCrmUserClient} from "@/lib/crm/auth";
import {CRM_ACCESS_COOKIE} from "@/lib/crm/auth-cookies";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
    const accessToken = request.cookies.get(CRM_ACCESS_COOKIE)?.value;
    if (accessToken) await createCrmUserClient(accessToken).auth.signOut().catch(() => undefined);
    const response = NextResponse.json({authenticated: false});
    clearCrmSessionCookies(response);
    return response;
}
