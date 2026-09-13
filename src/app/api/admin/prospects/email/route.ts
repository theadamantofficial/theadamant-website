import {NextRequest, NextResponse} from "next/server";
import {canAccessSales, canViewProspectDatabase} from "@/features/crm/permissions";
import {crmErrorResponse, CrmApiError, getCrmRequestContext} from "@/lib/crm/auth";
import {getProspectById} from "@/lib/crm/prospect-database";
import {clientProposalEmailBody, getProposalRecipients} from "@/lib/crm/proposal-email";
import {getProposalEmailConfig, sendProposalEmail} from "@/lib/crm/proposal-email-server";
import {getCrmServiceClient} from "@/lib/crm/server-client";
import {getApprovedWhatsAppTemplates} from "@/lib/crm/whatsapp-cloud";
import {isClientProposalTemplate} from "@/lib/crm/whatsapp-proposal";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function getProposalContext(request: NextRequest) {
    const context = await getCrmRequestContext(request);
    if (!canAccessSales(context.actor.role) || !canViewProspectDatabase(context.actor)) {
        throw new CrmApiError("You do not have access to send proposals from the lead database.", 403);
    }
    return context;
}

export async function GET(request: NextRequest) {
    try {
        await getProposalContext(request);
        let templateBody = "";
        if (process.env.WHATSAPP_ACCESS_TOKEN?.trim() && process.env.WHATSAPP_BUSINESS_ACCOUNT_ID?.trim()) {
            try {
                const templates = await getApprovedWhatsAppTemplates();
                const template = templates.find((item) => isClientProposalTemplate(item.name) && /^en(?:_|$)/i.test(item.language))
                    || templates.find((item) => isClientProposalTemplate(item.name));
                const body = template?.components.find((component: {type?: unknown; text?: unknown}) => component.type === "BODY");
                if (typeof body?.text === "string") templateBody = body.text;
            } catch { /* Keep the PDF-based draft available if Meta is unavailable. */ }
        }
        return NextResponse.json({
            configured: getProposalEmailConfig().configured,
            subject: "Client Proposal | Adamant Technologies",
            message: clientProposalEmailBody(templateBody),
            draftSource: templateBody ? "Client proposal template" : "Draft from proposal PDF",
        });
    } catch (error) {
        const {message, status} = crmErrorResponse(error);
        return NextResponse.json({error: message}, {status});
    }
}

export async function POST(request: NextRequest) {
    let outreachId = "";
    let accepted = false;
    try {
        const {client, actor} = await getProposalContext(request);
        const payload = await request.json() as {recordId?: unknown; to?: unknown; subject?: unknown; message?: unknown};
        if (typeof payload.recordId !== "number" || !Number.isSafeInteger(payload.recordId) || payload.recordId <= 0) {
            throw new CrmApiError("Choose a valid source lead.");
        }
        const to = typeof payload.to === "string" ? payload.to.trim() : "";
        const subject = typeof payload.subject === "string" ? payload.subject.trim() : "";
        const message = typeof payload.message === "string" ? payload.message.trim() : "";
        if (!subject || subject.length > 240 || /[\r\n]/.test(subject)) throw new CrmApiError("Enter a subject up to 240 characters on one line.");
        if (!message || message.length > 16000 || Buffer.byteLength(message, "utf8") > 30000) throw new CrmApiError("Enter a proposal message up to 16,000 characters.");
        if (/{{[^}]+}}/.test(message)) throw new CrmApiError("Replace all template placeholders before sending.");
        const prospect = await getProspectById(payload.recordId, client);
        if (!prospect) throw new CrmApiError("Lead not found in the source database.", 404);
        if (!getProposalRecipients(prospect).some((recipient) => recipient.email.toLowerCase() === to.toLowerCase())) {
            throw new CrmApiError("Choose an email address belonging to this lead.");
        }
        const config = getProposalEmailConfig();
        if (!config.configured) throw new CrmApiError("Configure the client proposal EmailJS template before sending.", 503);
        const service = getCrmServiceClient();
        const logged = await service.from("prospect_outreach_events").insert({
            prospect_source: "usa_leads_sqlite",
            prospect_record_id: prospect.record_id,
            user_id: actor.id,
            channel: "email",
            destination: to,
            message_body: message,
            status: "initiated",
            metadata: {subject,
                provider: "emailjs", template_id: config.templateId,
                contact_name: prospect.name || prospect.contact_person,
                company_name: prospect.company_name || prospect.business_name},
        }).select("id").single();
        if (logged.error || !logged.data) throw new CrmApiError("The email outreach could not be logged. Apply the email outreach migration before sending.", 503);
        outreachId = String(logged.data.id);
        await sendProposalEmail({to, name: prospect.name || prospect.contact_person || "Client", subject, message});
        accepted = true;
        let outreachLogged = false;
        try {
            const saved = await service.from("prospect_outreach_events").update({status: "sent"}).eq("id", outreachId);
            outreachLogged = !saved.error;
        } catch { /* Email is already accepted; do not invite a duplicate retry. */ }
        return NextResponse.json({sent: true, outreachLogged}, {status: 201});
    } catch (error) {
        if (outreachId && !accepted) {
            try { await getCrmServiceClient().from("prospect_outreach_events").update({status: "failed"}).eq("id", outreachId); }
            catch { console.error("Proposal email failure status could not be saved."); }
        }
        const {message, status} = crmErrorResponse(error);
        return NextResponse.json({error: message}, {status});
    }
}
