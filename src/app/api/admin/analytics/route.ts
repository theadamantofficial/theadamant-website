import {NextRequest, NextResponse} from "next/server";
import {crmErrorResponse, CrmApiError, getCrmRequestContext} from "@/lib/crm/auth";
import {canViewWebsiteAnalytics} from "@/features/crm/permissions";
import {getWebsiteAnalytics, parseAnalyticsDays} from "@/lib/crm/website-analytics";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
    try {
        const {actor} = await getCrmRequestContext(request);
        if (!canViewWebsiteAnalytics(actor.role)) throw new CrmApiError("Website analytics is available to administrators only.", 403);
        const data = await getWebsiteAnalytics(parseAnalyticsDays(request.nextUrl.searchParams.get("days")));
        return NextResponse.json(data, {headers: {"Cache-Control": "private, no-store"}});
    } catch (error) {
        const {message, status} = crmErrorResponse(error);
        return NextResponse.json({error: message}, {status, headers: {"Cache-Control": "private, no-store"}});
    }
}
