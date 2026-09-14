import {CrmApiError} from "@/lib/crm/errors";
import {CLIENT_PROPOSAL_LINKS} from "@/lib/crm/whatsapp-proposal";

export function getProposalEmailConfig() {
    const serviceId = process.env.EMAILJS_SERVICE_ID?.trim() || process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID?.trim() || "default_service";
    const publicKey = process.env.EMAILJS_PUBLIC_KEY?.trim() || process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY?.trim() || "";
    const templateId = process.env.EMAILJS_PROPOSAL_TEMPLATE_ID?.trim() || "";
    const privateKey = process.env.EMAILJS_PRIVATE_KEY?.trim() || "";
    const replyTo = process.env.EMAILJS_PROPOSAL_REPLY_TO?.trim() || "admin@theadamant.com";
    const contactTemplate = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID?.trim();
    return {serviceId, publicKey, templateId, privateKey, replyTo,
        configured: Boolean(publicKey && templateId && templateId !== contactTemplate)};
}

export async function sendProposalEmail(input: {to: string; name: string; subject: string; message: string}, fetcher: typeof fetch = fetch) {
    const config = getProposalEmailConfig();
    if (!config.configured) throw new CrmApiError("Configure the client proposal EmailJS template before sending.", 503);
    const response = await fetcher("https://api.emailjs.com/api/v1.0/email/send", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
            service_id: config.serviceId,
            template_id: config.templateId,
            user_id: config.publicKey,
            ...(config.privateKey ? {accessToken: config.privateKey} : {}),
            template_params: {
                to_email: input.to,
                email: input.to,
                to_name: input.name,
                subject: input.subject,
                message: input.message,
                reply_to: config.replyTo,
                ...CLIENT_PROPOSAL_LINKS,
            },
        }),
        cache: "no-store",
    });
    if (!response.ok) {
        let detail = (await response.text().catch(() => "")).slice(0, 500);
        if (config.privateKey) detail = detail.replaceAll(config.privateKey, "[redacted]");
        throw new CrmApiError(`EmailJS rejected the proposal (${response.status})${detail ? `: ${detail}` : ". Check the proposal template configuration."}`, response.status === 429 ? 429 : 502);
    }
}
