import {NextRequest, NextResponse} from "next/server";
import {LEAD_STATUSES} from "@/features/crm/constants";
import {crmErrorResponse, CrmApiError, getCrmRequestContext} from "@/lib/crm/auth";
import {LEAD_WITH_RELATIONS} from "@/lib/crm/queries";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
    try {
        const {client} = await getCrmRequestContext(request);
        const [results, summaryResult] = await Promise.all([Promise.all(LEAD_STATUSES.map(async (status) => {
            const {data, error, count} = await client.from("leads").select(LEAD_WITH_RELATIONS, {count: "exact"}).eq("status", status).order("updated_at", {ascending: false}).limit(60);
            if (error) throw error;
            return {status, count: count || 0, leads: data || []};
        })), client.rpc("crm_pipeline_summary")]);
        if (summaryResult.error) throw summaryResult.error;
        return NextResponse.json({columns: results, summary: summaryResult.data || []});
    } catch (error) {
        if (!(error instanceof CrmApiError)) console.error("Pipeline query failed.", error);
        const {message, status} = crmErrorResponse(error instanceof CrmApiError ? error : new CrmApiError("Pipeline could not be loaded.", 502));
        return NextResponse.json({error: message}, {status});
    }
}
