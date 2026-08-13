import {CrmApiError} from "@/lib/crm/errors";

export function normalizeWhatsAppPhone(value: string, country?: string | null) {
    const raw = value.trim();
    const beforeExtension = raw.split(/(?:ext\.?|extension|x)\s*\d+/i)[0];
    let digits = beforeExtension.replace(/\D/g, "");
    if (digits.startsWith("00")) digits = digits.slice(2);

    const likelyUsNumber = !country || /^(us|usa|united states|united states of america)$/i.test(country.trim());
    if (likelyUsNumber && digits.length === 10) digits = `1${digits}`;
    if (digits.length < 8 || digits.length > 15) {
        throw new CrmApiError("This lead does not have a valid WhatsApp phone number.");
    }
    return digits;
}

export function createWhatsAppUrl(phone: string, message: string) {
    const body = message.trim();
    if (!body) throw new CrmApiError("Write a message before opening WhatsApp.");
    if (body.length > 2000) throw new CrmApiError("WhatsApp messages must be 2,000 characters or fewer.");
    return `https://wa.me/${phone}?text=${encodeURIComponent(body)}`;
}

export function cleanProspectEmail(value?: string | null) {
    return value?.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0] || null;
}
