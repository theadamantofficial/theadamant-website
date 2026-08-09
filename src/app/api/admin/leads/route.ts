import {NextRequest, NextResponse} from "next/server";
import {LEAD_SOURCES, LEAD_STATUSES, PRIORITIES} from "@/features/crm/constants";
import type {LeadSource, LeadStatus, Priority} from "@/features/crm/types";
import {crmErrorResponse, CrmApiError, getCrmRequestContext, requireCrmRoles} from "@/lib/crm/auth";
import {LEAD_WITH_RELATIONS} from "@/lib/crm/queries";
import {cleanSearch, parseLeadInput, parsePage} from "@/lib/crm/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
    try {
        const {client} = await getCrmRequestContext(request);
        const {page, pageSize, from, to} = parsePage(request.nextUrl.searchParams);
        const search = cleanSearch(request.nextUrl.searchParams.get("search"));
        const status = request.nextUrl.searchParams.get("status") as LeadStatus | null;
        const source = request.nextUrl.searchParams.get("source") as LeadSource | null;
        const assignedTo = request.nextUrl.searchParams.get("assignedTo");
        const priority = request.nextUrl.searchParams.get("priority") as Priority | null;
        const createdAfter = request.nextUrl.searchParams.get("createdAfter");

        let query = client.from("leads")
            .select(LEAD_WITH_RELATIONS, {count: "exact"})
            .order("created_at", {ascending: false})
            .range(from, to);
        if (search) query = query.or(`customer_name.ilike.%${search}%,email.ilike.%${search}%,company_name.ilike.%${search}%,phone.ilike.%${search}%`);
        if (status && LEAD_STATUSES.includes(status)) query = query.eq("status", status);
        if (source && LEAD_SOURCES.includes(source)) query = query.eq("lead_source", source);
        if (assignedTo) query = assignedTo === "unassigned" ? query.is("assigned_to", null) : query.eq("assigned_to", assignedTo);
        if (priority && PRIORITIES.includes(priority)) query = query.eq("priority", priority);
        if (createdAfter && !Number.isNaN(new Date(createdAfter).getTime())) query = query.gte("created_at", new Date(createdAfter).toISOString());
        const {data, error, count} = await query;
        if (error) throw new CrmApiError("Leads could not be loaded.", 502);
        return NextResponse.json({leads: data || [], pagination: {page, pageSize, total: count || 0, pages: Math.ceil((count || 0) / pageSize)}});
    } catch (error) {
        const {message, status} = crmErrorResponse(error);
        return NextResponse.json({error: message}, {status});
    }
}

export async function POST(request: NextRequest) {
    try {
        const {client, actor} = await getCrmRequestContext(request);
        requireCrmRoles(actor, ["super_admin", "admin"]);
        const payload = await request.json() as Record<string, unknown>;
        const input = parseLeadInput(payload);
        const {data, error} = await client.from("leads").insert({...input, created_by: actor.id}).select(LEAD_WITH_RELATIONS).single();
        if (error) throw new CrmApiError(error.message, 400);
        return NextResponse.json({lead: data}, {status: 201});
    } catch (error) {
        const {message, status} = crmErrorResponse(error);
        return NextResponse.json({error: message}, {status});
    }
}
