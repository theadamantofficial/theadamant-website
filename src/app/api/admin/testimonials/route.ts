import {NextRequest, NextResponse} from "next/server";
import {crmErrorResponse, CrmApiError} from "@/lib/crm/errors";
import {authorizeContentAdmin, contentRecordId, readContentPayload} from "@/lib/admin-content";
import {getCrmServiceClient} from "@/lib/crm/server-client";
import {parseTestimonial, parseTestimonialStatus, TESTIMONIAL_PUBLIC_FIELDS} from "@/lib/testimonials";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const FIELDS = `${TESTIMONIAL_PUBLIC_FIELDS},email,status`;

function errorResponse(error: unknown) {
    const {message, status} = crmErrorResponse(error);
    return NextResponse.json({error: message}, {status});
}

export async function GET(request: NextRequest) {
    try {
        await authorizeContentAdmin(request);
        const {data, error} = await getCrmServiceClient().from("testimonials")
            .select(FIELDS).order("created_at", {ascending: false}).limit(200);
        if (error) throw new CrmApiError("Testimonials could not be loaded.", 503);
        return NextResponse.json({testimonials: data || []}, {headers: {"Cache-Control": "no-store"}});
    } catch (error) { return errorResponse(error); }
}

export async function POST(request: NextRequest) {
    try {
        await authorizeContentAdmin(request);
        const payload = await readContentPayload(request);
        const input = parseTestimonial(payload);
        const status = parseTestimonialStatus(payload.status);
        const {data, error} = await getCrmServiceClient().from("testimonials")
            .insert({...input, status}).select(FIELDS).single();
        if (error) throw new CrmApiError("Testimonial could not be saved.", 503);
        return NextResponse.json({testimonial: data}, {status: 201});
    } catch (error) { return errorResponse(error); }
}

export async function PATCH(request: NextRequest) {
    try {
        await authorizeContentAdmin(request);
        const payload = await readContentPayload(request);
        const id = contentRecordId(payload.id);
        const status = parseTestimonialStatus(payload.status);
        // Status-only requests support quick moderation. Edits validate all fields.
        const changes = payload.name === undefined ? {status} : {...parseTestimonial(payload), status};
        const {data, error} = await getCrmServiceClient().from("testimonials")
            .update(changes).eq("id", id).select(FIELDS).maybeSingle();
        if (error) throw new CrmApiError("Testimonial could not be updated.", 503);
        if (!data) throw new CrmApiError("Testimonial not found.", 404);
        return NextResponse.json({testimonial: data});
    } catch (error) { return errorResponse(error); }
}

export async function DELETE(request: NextRequest) {
    try {
        await authorizeContentAdmin(request);
        const id = contentRecordId((await readContentPayload(request)).id);
        const {data, error} = await getCrmServiceClient().from("testimonials")
            .delete().eq("id", id).select("id").maybeSingle();
        if (error) throw new CrmApiError("Testimonial could not be deleted.", 503);
        if (!data) throw new CrmApiError("Testimonial not found.", 404);
        return NextResponse.json({success: true});
    } catch (error) { return errorResponse(error); }
}
