/**
 * WhatsApp CRM is intentionally paused. Keep the implementation in place so it
 * can be restored by setting WHATSAPP_CRM_ENABLED=true.
 */
export function isWhatsAppCrmEnabled() {
    return process.env.WHATSAPP_CRM_ENABLED?.trim().toLowerCase() === "true";
}
