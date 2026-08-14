import type {Metadata} from "next";
import Link from "next/link";
import LegalPage, {LegalSection} from "@/views/legal-page";
import {buildOpenGraphMetadata, buildTwitterMetadata} from "@/lib/social-metadata";

const title = "Privacy Policy";
const description = "How The Adamant collects, uses, stores, and protects personal information across its website, CRM, and WhatsApp communications.";

export const metadata: Metadata = {
    title,
    description,
    alternates: {canonical: "/privacy-policy"},
    openGraph: buildOpenGraphMetadata({title, description, pagePath: "/privacy-policy"}),
    twitter: buildTwitterMetadata({title, description}),
};

const sections: LegalSection[] = [
    {
        id: "who-we-are",
        title: "Who we are",
        content: (
            <p>
                This Privacy Policy applies to JSSS Adamant Technologies Private Limited, operating as
                The Adamant (“The Adamant”, “we”, “us”, or “our”). It covers the website at
                theadamant.com, our enquiry and website-audit tools, our internal customer relationship
                management system, and business communications conducted through email, telephone, and
                WhatsApp.
            </p>
        ),
    },
    {
        id: "information-we-collect",
        title: "Information we collect",
        content: (
            <>
                <p>Depending on how you interact with us, we may collect:</p>
                <ul>
                    <li>Identity and contact information such as your name, email address, telephone number, WhatsApp number, company name, and job title.</li>
                    <li>Enquiry and project information such as service requirements, budgets, timelines, business goals, website URLs, messages, attachments, notes, and meeting details.</li>
                    <li>WhatsApp information such as your profile name, phone number, message content, message identifiers, timestamps, delivery status, and conversation history.</li>
                    <li>CRM and account information for authorised team members, including company email address, name, role, assigned leads, comments, activity records, and authentication metadata.</li>
                    <li>Technical information that may be produced when you use the website, including IP address, browser and device information, requested pages, referral information, error logs, and security events.</li>
                    <li>Preferences stored on your device, such as language and light or dark theme settings.</li>
                </ul>
                <p>We do not intentionally request payment-card details through our website or CRM. Payments handled by third-party providers are subject to those providers’ own policies.</p>
            </>
        ),
    },
    {
        id: "how-we-collect-information",
        title: "How we collect information",
        content: (
            <>
                <p>We collect information when you submit a form, request an audit or proposal, communicate with us, send a WhatsApp message, engage us for services, create an authorised company account, or otherwise provide information directly to us.</p>
                <p>We may also receive information through our service providers and connected business tools when needed to operate our website, route enquiries, maintain the CRM, deliver notifications, or respond to a conversation.</p>
            </>
        ),
    },
    {
        id: "how-we-use-information",
        title: "How we use information",
        content: (
            <>
                <p>We use personal information to:</p>
                <ul>
                    <li>Respond to enquiries and provide proposals, services, support, and project communications.</li>
                    <li>Create and manage leads, customers, assignments, tasks, notes, and conversation history in our internal CRM.</li>
                    <li>Send service updates, requested follow-ups, appointment information, and other relevant business communications.</li>
                    <li>Operate, secure, troubleshoot, and improve our website, CRM, and communication systems.</li>
                    <li>Prevent fraud, abuse, unauthorised access, and other security incidents.</li>
                    <li>Meet contractual, accounting, regulatory, and legal obligations.</li>
                </ul>
                <p>Where required, we rely on your consent. We may also process information where it is necessary to respond to your request, perform a contract, operate our business responsibly, or comply with law.</p>
            </>
        ),
    },
    {
        id: "whatsapp-and-meta",
        title: "WhatsApp and Meta",
        content: (
            <>
                <p>When you contact The Adamant through WhatsApp, Meta Platforms and WhatsApp process information needed to deliver the communication. We receive the message and associated metadata through the WhatsApp Business Platform and may store it in our CRM so authorised team members can respond, assign the conversation, update a lead, and maintain a service record.</p>
                <p>We may use approved WhatsApp message templates for permitted business-initiated communications. You can ask us to stop non-essential WhatsApp messages at any time by replying “STOP” or contacting us. Your use of WhatsApp is also governed by WhatsApp’s own terms and privacy policy.</p>
            </>
        ),
    },
    {
        id: "service-providers",
        title: "Service providers and integrations",
        content: (
            <>
                <p>We use vendors and infrastructure providers to operate our services. These may include hosting and deployment providers, database and authentication providers, Meta and WhatsApp, email-delivery tools, cloud storage or database services, AI-assisted tools, and internal notification channels.</p>
                <p>Current systems may include Vercel, Supabase, Meta/WhatsApp, Firebase, EmailJS, Discord, and other vendors configured for a particular service. They process information only for the relevant operational purpose and under their own contractual and privacy obligations.</p>
            </>
        ),
    },
    {
        id: "sharing-and-disclosure",
        title: "When we share information",
        content: (
            <>
                <p>We do not sell personal information. We may share information with authorised employees and contractors, service providers acting for us, professional advisers, or authorities when reasonably necessary to provide services, protect our systems or rights, investigate misuse, complete a corporate transaction, or comply with law.</p>
                <p>Access to internal CRM information is role-based and limited to authorised company users according to their responsibilities.</p>
            </>
        ),
    },
    {
        id: "retention",
        title: "Data retention",
        content: (
            <p>
                We retain information for as long as reasonably necessary to handle an enquiry, provide
                services, maintain business and customer records, resolve disputes, secure our systems,
                and comply with legal or accounting requirements. Retention periods vary by the type of
                information and the purpose for which it was collected. When information is no longer
                needed, we delete, anonymise, or securely isolate it.
            </p>
        ),
    },
    {
        id: "cookies-and-local-storage",
        title: "Cookies and local storage",
        content: (
            <p>
                The public website may use essential cookies or browser storage for preferences such as
                language and theme. The internal CRM uses secure authentication cookies to keep authorised
                users signed in. We may update this notice if optional analytics or advertising technologies
                are introduced.
            </p>
        ),
    },
    {
        id: "your-choices",
        title: "Your choices and rights",
        content: (
            <>
                <p>Depending on where you live and applicable law, you may request access to, correction of, or deletion of your personal information, withdraw consent, object to certain processing, or ask us to restrict how information is used.</p>
                <p>To make a request, email <a href="mailto:admin@theadamant.com">admin@theadamant.com</a>. For deletion requests, you can also follow our <Link href="/data-deletion">Data Deletion Instructions</Link>. We may need to verify your identity before completing a request.</p>
            </>
        ),
    },
    {
        id: "security-and-transfers",
        title: "Security and international processing",
        content: (
            <>
                <p>We use reasonable administrative, technical, and organisational safeguards designed to protect information. No internet transmission or storage system is completely secure, so we cannot guarantee absolute security.</p>
                <p>Some providers may process information in countries other than your own. Where applicable, we use the safeguards made available by those providers and take reasonable steps to protect information consistent with this policy.</p>
            </>
        ),
    },
    {
        id: "children",
        title: "Children’s privacy",
        content: (
            <p>
                Our business services are not directed to children, and we do not knowingly collect
                personal information from anyone under 18. If you believe a child has provided information
                to us, contact us so we can review and remove it where appropriate.
            </p>
        ),
    },
    {
        id: "changes-and-contact",
        title: "Changes and contact",
        content: (
            <>
                <p>We may update this Privacy Policy as our services, providers, or legal obligations change. The latest version will remain available on this page with a revised “Last updated” date.</p>
                <p>Questions or privacy requests can be sent to JSSS Adamant Technologies Private Limited at <a href="mailto:admin@theadamant.com">admin@theadamant.com</a>.</p>
            </>
        ),
    },
];

export default function PrivacyPolicyPage() {
    return (
        <LegalPage
            eyebrow="Privacy"
            title="Privacy Policy"
            description={description}
            lastUpdated="14 August 2026"
            sections={sections}
        />
    );
}
