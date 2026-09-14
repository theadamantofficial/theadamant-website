import {NextResponse} from "next/server";
import {crmErrorResponse, CrmApiError} from "@/lib/crm/errors";
import {getCrmServiceClient} from "@/lib/crm/server-client";
import {PROJECT_PUBLIC_FIELDS} from "@/lib/projects";
import {getProjectPreview} from "@/lib/project-previews";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const {data, error} = await getCrmServiceClient().from("projects")
            .select(PROJECT_PUBLIC_FIELDS).eq("status", "published")
            .order("sort_order").order("created_at", {ascending: false}).limit(200);
        if (error) throw new CrmApiError("Projects are temporarily unavailable.", 503);
        const projects = (data || []).map(({image_alt, ...project}) => ({...project, ...getProjectPreview({...project, imageAlt: image_alt})}));
        return NextResponse.json({projects}, {headers: {"Cache-Control": "no-store"}});
    } catch (error) {
        const {message, status} = crmErrorResponse(error);
        return NextResponse.json({error: message}, {status});
    }
}
