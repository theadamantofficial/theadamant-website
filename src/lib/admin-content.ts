import type {NextRequest} from "next/server";
import {CrmApiError, getCrmRequestContext, requireCrmRoles} from "@/lib/crm/auth";

export async function authorizeContentAdmin(request: NextRequest) {
    const {actor} = await getCrmRequestContext(request);
    requireCrmRoles(actor, ["super_admin", "admin"]);
    const origin = request.headers.get("origin");
    if (origin && origin !== request.nextUrl.origin) throw new CrmApiError("Invalid request origin.", 403);
    return actor;
}

export async function readContentPayload(request: NextRequest) {
    if (Number(request.headers.get("content-length")) > 20000) throw new CrmApiError("Submission is too long.", 413);
    const body = await request.text();
    if (body.length > 20000) throw new CrmApiError("Submission is too long.", 413);
    let payload: unknown;
    try { payload = JSON.parse(body); } catch { throw new CrmApiError("Invalid submission details."); }
    if (!payload || typeof payload !== "object" || Array.isArray(payload)) throw new CrmApiError("Invalid submission details.");
    return payload as Record<string, unknown>;
}

export function contentRecordId(value: unknown) {
    if (typeof value !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)) throw new CrmApiError("Choose a valid record.");
    return value;
}
