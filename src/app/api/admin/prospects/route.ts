import {NextRequest, NextResponse} from "next/server";
import {canViewProspectDatabase} from "@/features/crm/permissions";
import {crmErrorResponse, CrmApiError, getCrmRequestContext} from "@/lib/crm/auth";
import {queryProspects} from "@/lib/crm/prospect-database";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
    try {
        const {actor} = await getCrmRequestContext(request);
        if (!canViewProspectDatabase(actor)) {
            throw new CrmApiError("You do not have access to the lead database.", 403);
        }

        const params = request.nextUrl.searchParams;
        const after = parseNonNegativeInteger(params.get("after"), 0);
        const pageSize = Math.min(100, Math.max(10, parseNonNegativeInteger(params.get("pageSize"), 50)));
        const result = await queryProspects({
            after,
            pageSize,
            search: clean(params.get("search"), 120),
            state: clean(params.get("state"), 100),
            city: clean(params.get("city"), 100),
            industry: clean(params.get("industry"), 100),
            hasPhone: params.get("hasPhone") === "true",
        });
        return NextResponse.json(result);
    } catch (error) {
        const {message, status} = crmErrorResponse(error);
        return NextResponse.json({error: message}, {status});
    }
}

function parseNonNegativeInteger(value: string | null, fallback: number) {
    const parsed = Number.parseInt(value || "", 10);
    return Number.isSafeInteger(parsed) && parsed >= 0 ? parsed : fallback;
}

function clean(value: string | null, maxLength: number) {
    return value?.trim().slice(0, maxLength) || undefined;
}
