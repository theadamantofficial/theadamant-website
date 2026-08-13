import {NextRequest, NextResponse} from "next/server";
import {adminErrorResponse, canEditLeads, canManageTeam, getAdminActor} from "@/lib/admin-auth";
import {isCrmConfigured} from "@/lib/admin-crm";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
    try {
        const actor = await getAdminActor(request);

        return NextResponse.json({
            authenticated: true,
            actor,
            permissions: {
                editLeads: canEditLeads(actor.role),
                manageTeam: canManageTeam(actor.role),
            },
            crmConfigured: isCrmConfigured(),
        });
    } catch (error) {
        const {message, status} = adminErrorResponse(error);
        return NextResponse.json({authenticated: false, error: message}, {status});
    }
}
