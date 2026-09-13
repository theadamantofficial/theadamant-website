import {afterEach, describe, expect, it, vi} from "vitest";
import {clientProposalEmailBody, getProposalRecipients, PROPOSAL_PDF_FILENAME} from "@/lib/crm/proposal-email";
import {getProposalEmailConfig, readProposalPdf, sendProposalEmail} from "@/lib/crm/proposal-email-server";

afterEach(() => vi.unstubAllEnvs());

describe("client proposal email content and attachments", () => {
    it("prefers corporate addresses, extracts annotations and lists all distinct recipients", () => {
        expect(getProposalRecipients({
            corporate_email: "Business@company.example (Accept_all), second@company.example (OK)",
            company_email: "business@company.example, team@company.example",
            email: "personal@example.com (OK)",
        })).toEqual([
            {email: "Business@company.example", label: "Corporate email"},
            {email: "second@company.example", label: "Corporate email"},
            {email: "team@company.example", label: "Company email"},
            {email: "personal@example.com", label: "Email"},
        ]);
    });

    it("copies the template wording while substituting exactly the supplied three links", () => {
        expect(clientProposalEmailBody("Our work: {{1}}, {{ 2 }}, {{3}}. Please review our proposal."))
            .toBe("Our work: https://aetherseo.com/en, https://prep-vista-five.vercel.app/, https://prep-vista-five.vercel.app/. Please review our proposal.");
    });

    it("loads the actual bundled two-page PDF without exposing a public asset URL", async () => {
        const pdf = await readProposalPdf();
        expect(pdf.length).toBe(65779);
        expect(pdf.subarray(0, 5).toString()).toBe("%PDF-");
    });

    it("reuses the configured EmailJS service with a separate proposal template and actual PDF bytes", async () => {
        vi.stubEnv("NEXT_PUBLIC_EMAILJS_SERVICE_ID", "existing-service");
        vi.stubEnv("NEXT_PUBLIC_EMAILJS_PUBLIC_KEY", "existing-public-key");
        vi.stubEnv("NEXT_PUBLIC_EMAILJS_TEMPLATE_ID", "contact-template");
        vi.stubEnv("EMAILJS_PROPOSAL_TEMPLATE_ID", "proposal-template");
        vi.stubEnv("EMAILJS_PRIVATE_KEY", "private-key");
        const fetcher = vi.fn().mockResolvedValue(new Response("OK", {status: 200}));
        const pdf = Buffer.from("%PDF-1.7\nproposal content");
        await sendProposalEmail({to: "client@example.com", name: "Client", subject: "Proposal", message: "Our proposal", pdf}, fetcher);
        const [url, options] = fetcher.mock.calls[0];
        expect(url).toBe("https://api.emailjs.com/api/v1.0/email/send");
        const body = JSON.parse(options.body);
        expect(body).toMatchObject({service_id: "existing-service", template_id: "proposal-template", user_id: "existing-public-key", accessToken: "private-key"});
        expect(body.template_params).toMatchObject({to_email: "client@example.com", subject: "Proposal", message: "Our proposal", attachment_name: PROPOSAL_PDF_FILENAME});
        expect(Buffer.from(body.template_params.proposal_pdf.split(",")[1], "base64")).toEqual(pdf);
    });

    it("refuses the contact template as a proposal template", async () => {
        vi.stubEnv("NEXT_PUBLIC_EMAILJS_PUBLIC_KEY", "public-key");
        vi.stubEnv("NEXT_PUBLIC_EMAILJS_TEMPLATE_ID", "contact-template");
        vi.stubEnv("EMAILJS_PROPOSAL_TEMPLATE_ID", "contact-template");
        const fetcher = vi.fn();
        expect(getProposalEmailConfig().configured).toBe(false);
        await expect(sendProposalEmail({to: "client@example.com", name: "Client", subject: "Proposal", message: "Our proposal", pdf: Buffer.from("PDF")}, fetcher)).rejects.toMatchObject({status: 503});
        expect(fetcher).not.toHaveBeenCalled();
    });

    it("reports attachment/provider errors and redacts the private key", async () => {
        vi.stubEnv("NEXT_PUBLIC_EMAILJS_PUBLIC_KEY", "public-key");
        vi.stubEnv("EMAILJS_PROPOSAL_TEMPLATE_ID", "proposal-template");
        vi.stubEnv("EMAILJS_PRIVATE_KEY", "private-key");
        const fetcher = vi.fn().mockResolvedValue(new Response("Attachment rejected private-key", {status: 400}));
        await expect(sendProposalEmail({to: "client@example.com", name: "Client", subject: "Proposal", message: "Our proposal", pdf: Buffer.from("PDF")}, fetcher)).rejects.toThrow("Attachment rejected [redacted]");
    });
});
