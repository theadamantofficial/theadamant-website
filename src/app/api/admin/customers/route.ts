import {NextRequest, NextResponse} from "next/server";
import {crmErrorResponse, CrmApiError, getCrmRequestContext} from "@/lib/crm/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
    try {
        const {client} = await getCrmRequestContext(request);
        const {data, error} = await client.rpc("crm_customers_directory");
        if (error) throw new CrmApiError("Customers could not be loaded.", 502);
        return NextResponse.json({customers: data || []});
    } catch (error) {
        const {message, status} = crmErrorResponse(error);
        return NextResponse.json({error: message}, {status});
    }
}
