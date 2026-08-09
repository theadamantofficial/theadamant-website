import {NextRequest, NextResponse} from "next/server";
import {crmErrorResponse, getCrmRequestContext} from "@/lib/crm/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
    try {
        const {actor} = await getCrmRequestContext(request);
        return NextResponse.json({authenticated: true, actor});
    } catch (error) {
        const {message, status} = crmErrorResponse(error);
        return NextResponse.json({authenticated: false, error: message}, {status});
    }
}
