import type {Prospect} from "@/features/crm/types";
import {CLIENT_PROPOSAL_LINKS} from "@/lib/crm/whatsapp-proposal";

export const PROPOSAL_PDF_FILENAME = "Adamant_Technologies_Client_Proposal.pdf";
export type ProposalRecipient = {email: string; label: string};

export function getProposalRecipients(prospect: Pick<Prospect, "email" | "corporate_email" | "company_email">): ProposalRecipient[] {
    const seen = new Set<string>();
    const recipients: ProposalRecipient[] = [];
    for (const [label, raw] of [["Corporate email", prospect.corporate_email], ["Company email", prospect.company_email], ["Email", prospect.email]]) {
        for (const email of raw?.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi) || []) {
            if (seen.has(email.toLowerCase())) continue;
            seen.add(email.toLowerCase());
            recipients.push({email, label: label || "Email"});
        }
    }
    return recipients;
}

export function clientProposalEmailBody(templateBody?: string) {
    if (templateBody?.trim()) {
        return templateBody.replace(/{{\s*([123])\s*}}/g, (_, key: string) => CLIENT_PROPOSAL_LINKS[key]);
    }
    // Editable draft drawn from the supplied PDF until exact template text is available.
    return [
        "Hello,",
        "",
        "Adamant Technologies helps businesses turn ideas and operational needs into modern websites, mobile applications, custom software and practical digital solutions.",
        "",
        "Explore selected live work delivered by our team:",
        `1. ${CLIENT_PROPOSAL_LINKS["1"]}`,
        `2. ${CLIENT_PROPOSAL_LINKS["2"]}`,
        `3. ${CLIENT_PROPOSAL_LINKS["3"]}`,
        "",
        "Our client proposal is attached for your review.",
        "",
        "Have a project in mind? Share your requirement and we will explore the best way to bring it to life.",
        "",
        "Adamant Technologies",
        "https://theadamant.com",
    ].join("\n");
}
