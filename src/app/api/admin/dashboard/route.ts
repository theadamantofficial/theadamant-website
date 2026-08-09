import {NextRequest, NextResponse} from "next/server";
import type {Activity, DashboardMetrics, Lead, PipelineSummary} from "@/features/crm/types";
import {crmErrorResponse, CrmApiError, getCrmRequestContext} from "@/lib/crm/auth";
import {ACTIVITY_WITH_RELATIONS, LEAD_WITH_RELATIONS} from "@/lib/crm/queries";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
    try {
        const {client} = await getCrmRequestContext(request);
        const start = new Date();
        start.setHours(0, 0, 0, 0);
        const end = new Date(start);
        end.setDate(end.getDate() + 1);

        const [metricsResult, pipelineResult, recentResult, followupsResult, activityResult] = await Promise.all([
            client.rpc("crm_dashboard_metrics"),
            client.rpc("crm_pipeline_summary"),
            client.from("leads").select(LEAD_WITH_RELATIONS).order("created_at", {ascending: false}).limit(8),
            client.from("leads").select(LEAD_WITH_RELATIONS).gte("next_followup", start.toISOString()).lt("next_followup", end.toISOString()).not("status", "in", "(won,lost)").order("next_followup").limit(8),
            client.from("activities").select(ACTIVITY_WITH_RELATIONS).order("created_at", {ascending: false}).limit(10),
        ]);

        const error = metricsResult.error || pipelineResult.error || recentResult.error || followupsResult.error || activityResult.error;
        if (error) throw new CrmApiError("Dashboard data could not be loaded.", 502);

        return NextResponse.json({
            metrics: metricsResult.data as DashboardMetrics,
            pipeline: (pipelineResult.data || []) as PipelineSummary[],
            recentLeads: (recentResult.data || []) as unknown as Lead[],
            followups: (followupsResult.data || []) as unknown as Lead[],
            activities: (activityResult.data || []) as unknown as Activity[],
        });
    } catch (error) {
        const {message, status} = crmErrorResponse(error);
        return NextResponse.json({error: message}, {status});
    }
}
