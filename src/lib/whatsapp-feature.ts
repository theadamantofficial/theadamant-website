/**
 * WhatsApp CRM is enabled by default. Set the flag to false to pause its routes.
 */
export function isWhatsAppCrmEnabled() {
    return process.env.WHATSAPP_CRM_ENABLED?.trim().toLowerCase() !== "false";
}
