import {NextRequest, NextResponse} from "next/server";
import {CRM_ROLES} from "@/features/crm/constants";
import type {CrmRole} from "@/features/crm/types";
import {crmErrorResponse, CrmApiError, getCrmRequestContext, requireCrmRoles} from "@/lib/crm/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
    try {
        const {client, actor} = await getCrmRequestContext(request);
        requireCrmRoles(actor, ["super_admin", "admin"]);
        const {data, error} = await client.rpc("crm_team_directory");
        if (error) throw new CrmApiError("Team members could not be loaded.", 502);
        return NextResponse.json({members: data || []});
    } catch (error) {
        const {message, status} = crmErrorResponse(error);
        return NextResponse.json({error: message}, {status});
    }
}

export async function PATCH(request: NextRequest) {
    try {
        const {client, actor} = await getCrmRequestContext(request);
        requireCrmRoles(actor, ["super_admin"]);
        const payload = await request.json() as {id?: string; role?: CrmRole; active?: boolean};
        if (!payload.id) throw new CrmApiError("Choose a team member.");
        const {data: target} = await client.from("profiles").select("email,role").eq("id", payload.id).maybeSingle();
        if (!target) throw new CrmApiError("Team member not found.", 404);
        const changes: Record<string, unknown> = {};
        if (payload.role !== undefined) {
            if (!CRM_ROLES.includes(payload.role)) throw new CrmApiError("Choose a valid role.");
            if (payload.role === "super_admin" && target.email !== "admin@theadamant.com") {
                throw new CrmApiError("The super admin role is reserved for admin@theadamant.com.", 403);
            }
            changes.role = target.email === "admin@theadamant.com" ? "super_admin" : payload.role;
        }
        if (typeof payload.active === "boolean") changes.active = target.email === "admin@theadamant.com" ? true : payload.active;
        const {data, error} = await client.from("profiles").update(changes).eq("id", payload.id).select("id,full_name,email,role,avatar_url,active,created_at,updated_at").single();
        if (error) throw new CrmApiError(error.message, 400);
        return NextResponse.json({member: data});
    } catch (error) {
        const {message, status} = crmErrorResponse(error);
        return NextResponse.json({error: message}, {status});
    }
}
