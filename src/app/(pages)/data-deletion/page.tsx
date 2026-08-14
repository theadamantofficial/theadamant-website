import type {Metadata} from "next";
import LegalPage, {LegalSection} from "@/views/legal-page";
import {buildOpenGraphMetadata, buildTwitterMetadata} from "@/lib/social-metadata";

const title = "Data Deletion Instructions";
const description = "How to request deletion of personal information held by The Adamant, including website enquiries, CRM records, and WhatsApp conversation data.";

export const metadata: Metadata = {
    title,
    description,
    alternates: {canonical: "/data-deletion"},
    openGraph: buildOpenGraphMetadata({title, description, pagePath: "/data-deletion"}),
    twitter: buildTwitterMetadata({title, description}),
};

const sections: LegalSection[] = [
    {
        id: "request-overview",
        title: "Requesting deletion",
        content: (
            <p>
                You may ask JSSS Adamant Technologies Private Limited, operating as The Adamant, to delete
                personal information connected with your website enquiry, project communication, customer
                record, authorised company account, or WhatsApp conversation. These instructions are also
                provided for users of Meta and WhatsApp integrations connected to The Adamant.
            </p>
        ),
    },
    {
        id: "email-request",
        title: "Send your request by email",
        content: (
            <>
                <p>Email <a href="mailto:admin@theadamant.com?subject=Data%20Deletion%20Request">admin@theadamant.com</a> with the subject line <strong>Data Deletion Request</strong>.</p>
                <p>Include enough information for us to locate the correct records:</p>
                <ul>
                    <li>Your full name.</li>
                    <li>The email address and telephone or WhatsApp number used to contact us.</li>
                    <li>Your company name, if relevant.</li>
                    <li>The service or channel you used, such as website enquiry, WhatsApp, CRM account, website audit, or project communication.</li>
                    <li>A short description of the information you want deleted.</li>
                    <li>Any enquiry reference, project reference, or account identifier available to you.</li>
                </ul>
                <p>Do not send passwords, one-time codes, payment-card information, or unnecessary identity documents in your first email.</p>
            </>
        ),
    },
    {
        id: "verification",
        title: "Identity verification",
        content: (
            <p>
                To protect customers and employees, we may verify that the request comes from the person
                associated with the information. We may reply to the email address or WhatsApp number already
                on record or ask for limited additional information. If an authorised representative submits
                the request, we may ask for evidence of their authority.
            </p>
        ),
    },
    {
        id: "what-we-delete",
        title: "What we will delete",
        content: (
            <>
                <p>Subject to the exceptions below, a verified request may cover:</p>
                <ul>
                    <li>Contact-form, enquiry, website-audit, and lead information stored by The Adamant.</li>
                    <li>WhatsApp contact details, message content, conversation metadata, and linked CRM records under our control.</li>
                    <li>Customer notes, assignments, comments, and service communications associated with the requester.</li>
                    <li>An authorised company user’s profile and access, after any required offboarding and security review.</li>
                </ul>
                <p>You may request deletion of specific records or all personal information we can reasonably identify as belonging to you.</p>
            </>
        ),
    },
    {
        id: "timeframe",
        title: "What happens next",
        content: (
            <p>
                We will acknowledge a valid request and aim to complete it within 30 days. Complex requests,
                identity questions, technical dependencies, or legal requirements may take longer. If more
                time is needed, we will provide an update using the contact details supplied with the request.
                Deleted information may remain temporarily in restricted backups until those backups rotate
                through their normal retention cycle.
            </p>
        ),
    },
    {
        id: "exceptions",
        title: "Information we may retain",
        content: (
            <>
                <p>We may retain limited information where reasonably necessary to:</p>
                <ul>
                    <li>Comply with tax, accounting, employment, contractual, regulatory, or legal obligations.</li>
                    <li>Establish, exercise, or defend legal claims and resolve disputes.</li>
                    <li>Protect systems, investigate fraud or misuse, and maintain security or access logs.</li>
                    <li>Record a communication opt-out so we do not contact you again against your preference.</li>
                    <li>Preserve anonymised or aggregated information that no longer identifies you.</li>
                </ul>
                <p>Where retention is required, we will limit the information and restrict it from ordinary business use.</p>
            </>
        ),
    },
    {
        id: "third-party-data",
        title: "Meta, WhatsApp, and other providers",
        content: (
            <p>
                We can delete information held in systems under The Adamant’s control. Meta, WhatsApp, and
                other providers may retain information independently under their own policies. Deleting a chat
                from your WhatsApp application does not necessarily delete the corresponding business record
                in our CRM, and deleting our CRM record does not control data held independently by Meta. You
                may need to use the privacy tools offered directly by the relevant provider as well.
            </p>
        ),
    },
    {
        id: "questions",
        title: "Questions or complaints",
        content: (
            <p>
                If you have questions about a deletion request or believe it was not handled correctly, reply
                to the request email or contact <a href="mailto:admin@theadamant.com">admin@theadamant.com</a>
                with the original request details. You may also have the right to contact the relevant data
                protection or regulatory authority where you live.
            </p>
        ),
    },
];

export default function DataDeletionPage() {
    return (
        <LegalPage
            eyebrow="Privacy request"
            title="Data Deletion Instructions"
            description={description}
            lastUpdated="14 August 2026"
            sections={sections}
        />
    );
}
