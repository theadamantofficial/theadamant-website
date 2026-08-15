export const ADAMANT_WHATSAPP_NUMBER = "919315414827";

export function buildWhatsAppContactUrl({name, service, message}: {name?: string; service?: string; message?: string}) {
    const customerName = cleanText(name, 100);
    const serviceName = cleanText(service, 160) || "your services";
    const projectMessage = cleanText(message, 1_200);
    const lines = [
        "Hi Adamant Technologies,",
        "",
        customerName ? `I'm ${customerName}.` : "I'd like to discuss a project with your team.",
        `I'm interested in ${serviceName}.`,
        ...(projectMessage ? ["", `Project details: ${projectMessage}`] : []),
        "",
        "Please share the next steps.",
    ];
    return `https://wa.me/${ADAMANT_WHATSAPP_NUMBER}?text=${encodeURIComponent(lines.join("\n"))}`;
}

function cleanText(value: string | undefined, maxLength: number) {
    return (value || "").trim().replace(/\s+/g, " ").slice(0, maxLength);
}
