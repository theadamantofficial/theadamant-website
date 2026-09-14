import {NextRequest, NextResponse} from "next/server";
import {CrmApiError, crmErrorResponse} from "@/lib/crm/errors";
import {getCrmServiceClient} from "@/lib/crm/server-client";
import {parseTestimonial, TESTIMONIAL_PUBLIC_FIELDS} from "@/lib/testimonials";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const {data, error} = await getCrmServiceClient().from("testimonials")
            .select(TESTIMONIAL_PUBLIC_FIELDS).eq("status", "approved")
            .order("created_at", {ascending: false}).limit(60);
        if (error) throw new CrmApiError("Testimonials are temporarily unavailable.", 503);
        return NextResponse.json({testimonials: data || []}, {headers: {"Cache-Control": "no-store"}});
    } catch (error) {
        const {message, status} = crmErrorResponse(error);
        return NextResponse.json({error: message}, {status});
    }
}

export async function POST(request: NextRequest) {
    try {
        const origin = request.headers.get("origin");
        if (origin && origin !== request.nextUrl.origin) throw new CrmApiError("Submit this form from our website.", 403);
        if (Number(request.headers.get("content-length")) > 16000) throw new CrmApiError("Your submission is too long.", 413);
        const body = await request.text();
        if (body.length > 16000) throw new CrmApiError("Your submission is too long.", 413);
        let payload: unknown;
        try { payload = JSON.parse(body); } catch { throw new CrmApiError("Invalid testimonial details."); }
        const input = parseTestimonial(payload);
        const {error} = await getCrmServiceClient().rpc("submit_testimonial", {
            p_name: input.name, p_email: input.email, p_company: input.company,
            p_rating: input.rating, p_message: input.message,
        });
        if (error?.code === "P0001") throw new CrmApiError("You have already submitted a testimonial today. Please try again tomorrow.", 429);
        if (error) throw new CrmApiError("Your testimonial could not be saved. Please try again shortly.", 503);
        return NextResponse.json({success: true, status: "pending"}, {status: 201});
    } catch (error) {
        const {message, status} = crmErrorResponse(error);
        return NextResponse.json({error: message}, {status});
    }
}
