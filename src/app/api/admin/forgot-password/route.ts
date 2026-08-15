import {NextRequest, NextResponse} from "next/server";
import {createCrmAuthClient, crmErrorResponse, CrmApiError} from "@/lib/crm/auth";
import {parseCrmCompanyEmail} from "@/lib/crm/validation";
import {getSiteUrl} from "@/lib/site-url";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
    try {
        const payload = await request.json() as {email?: unknown};
        const email = parseCrmCompanyEmail(payload.email);
        const {error} = await createCrmAuthClient().auth.resetPasswordForEmail(email, {
            redirectTo: `${getSiteUrl()}/admin/reset-password`,
        });
        if (error) {
            if (error.message.toLowerCase().includes("rate limit")) {
                throw new CrmApiError("Too many reset requests. Please wait a few minutes and try again.", 429);
            }
            throw new CrmApiError("The password reset email could not be sent. Please try again.", 502);
        }
        return NextResponse.json({
            sent: true,
            message: "If an active CRM account exists for that email, a password reset link has been sent.",
        });
    } catch (error) {
        const {message, status} = crmErrorResponse(error);
        return NextResponse.json({error: message}, {status});
    }
}
