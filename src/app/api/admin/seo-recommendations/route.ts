import {NextRequest, NextResponse} from "next/server";
import {crmErrorResponse, CrmApiError, getCrmRequestContext, requireCrmRoles} from "@/lib/crm/auth";
import {getCrmServiceClient} from "@/lib/crm/server-client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
    try {
        const {actor} = await getCrmRequestContext(request);
        requireCrmRoles(actor, ["super_admin", "admin"]);
        const status = request.nextUrl.searchParams.get("status") || "pending";
        const {data, error} = await getCrmServiceClient().from("seo_keyword_recommendations")
            .select("*").eq("status", status).order("created_at", {ascending: false}).limit(100);
        if (error) throw new CrmApiError("SEO recommendations could not be loaded.", 503);
        return NextResponse.json({recommendations: data || []}, {headers: {"Cache-Control": "private, no-store"}});
    } catch (error) {
        const {message, status} = crmErrorResponse(error);
        return NextResponse.json({error: message}, {status});
    }
}

export async function PATCH(request: NextRequest) {
    try {
        const {actor} = await getCrmRequestContext(request);
        requireCrmRoles(actor, ["super_admin", "admin"]);
        const body = await request.json() as {id?: string; status?: string};
        if (!body.id || !["approved", "rejected"].includes(body.status || "")) {
            throw new CrmApiError("A recommendation id and approved or rejected status are required.", 400);
        }
        const {data, error} = await getCrmServiceClient().from("seo_keyword_recommendations")
            .update({status: body.status, reviewed_by: actor.id, reviewed_at: new Date().toISOString()})
            .eq("id", body.id).eq("status", "pending").select("*").maybeSingle();
        if (error) throw new CrmApiError("SEO recommendation could not be updated.", 503);
        if (!data) throw new CrmApiError("Pending SEO recommendation not found.", 404);
        return NextResponse.json({recommendation: data});
    } catch (error) {
        const {message, status} = crmErrorResponse(error);
        return NextResponse.json({error: message}, {status});
    }
}
