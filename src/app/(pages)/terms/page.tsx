import type {Metadata} from "next";
import LegalPage, {LegalSection} from "@/views/legal-page";
import {buildOpenGraphMetadata, buildTwitterMetadata} from "@/lib/social-metadata";

const title = "Terms of Service";
const description = "The terms governing use of Adamant website, communications, digital services, and authorised internal CRM.";

export const metadata: Metadata = {
    title,
    description,
    alternates: {canonical: "/terms"},
    openGraph: buildOpenGraphMetadata({title, description, pagePath: "/terms"}),
    twitter: buildTwitterMetadata({title, description}),
};

const sections: LegalSection[] = [
    {
        id: "acceptance",
        title: "Acceptance of these terms",
        content: (
            <p>
                These Terms of Service (“Terms”) govern your use of theadamant.com and services provided by
                JSSS Adamant Technologies Private Limited, operating as Adamant (“Adamant”, “we”,
                “us”, or “our”). By accessing the website, submitting an enquiry, using an authorised company
                account, or engaging us for services, you agree to these Terms. A separately signed proposal,
                statement of work, or contract will control if it conflicts with these Terms.
            </p>
        ),
    },
    {
        id: "services",
        title: "Our services",
        content: (
            <p>
                Adamant provides services that may include website strategy and development, user
                experience and interface design, application development, search optimisation foundations,
                digital marketing, social media support, paid advertising support, audits, consulting, and
                related technology or creative work. The exact deliverables, schedule, dependencies, fees,
                and acceptance criteria for paid work are defined in the applicable proposal or agreement.
            </p>
        ),
    },
    {
        id: "proposals-and-payment",
        title: "Proposals, fees, and payment",
        content: (
            <>
                <p>Website information and initial conversations are not a binding offer. A project begins only when the parties approve the applicable commercial terms and any required initial payment is received.</p>
                <p>Fees, taxes, payment milestones, third-party costs, refund terms, and consequences of delayed payment will be stated in the applicable proposal or invoice. Unless expressly included, domain names, hosting, advertising spend, paid software, marketplace fees, and other third-party charges are the customer’s responsibility.</p>
            </>
        ),
    },
    {
        id: "customer-responsibilities",
        title: "Customer responsibilities",
        content: (
            <>
                <p>You agree to provide accurate information, timely feedback, approvals, content, credentials, and access reasonably needed for the work. You are responsible for reviewing deliverables and confirming that your content, products, campaigns, and business practices comply with applicable laws and platform policies.</p>
                <p>You must not use our website, CRM, communications, or deliverables to violate law, infringe rights, distribute harmful code, mislead users, send unlawful or unsolicited communications, attempt unauthorised access, interfere with systems, or harm another person.</p>
            </>
        ),
    },
    {
        id: "accounts-and-crm",
        title: "Company accounts and CRM access",
        content: (
            <p>
                The internal CRM is restricted to authorised Adamant personnel using approved company
                email addresses. Users must protect their credentials, use only the permissions assigned to
                them, and promptly report suspected unauthorised access. We may suspend or remove access when
                a user leaves the company, violates policy, presents a security risk, or no longer requires
                access. CRM role and activity records may be retained for security and accountability.
            </p>
        ),
    },
    {
        id: "communications",
        title: "Email, telephone, and WhatsApp communications",
        content: (
            <>
                <p>When you provide contact details or message us, you authorise us to respond through the relevant channel about your enquiry, project, support request, or existing business relationship. WhatsApp communications are also subject to Meta and WhatsApp policies.</p>
                <p>You may opt out of non-essential WhatsApp or marketing communications by replying “STOP” or emailing us. Service, security, billing, and contractual communications may continue where reasonably necessary.</p>
            </>
        ),
    },
    {
        id: "content-and-intellectual-property",
        title: "Content and intellectual property",
        content: (
            <>
                <p>Adamant owns the website, its branding, source materials, reusable tools, processes, know-how, templates, and content unless stated otherwise. You may not copy, resell, reverse engineer, scrape, or commercially exploit them without written permission.</p>
                <p>You retain ownership of materials you provide and grant us permission to use them to perform the requested services. Ownership and licence terms for project deliverables will be defined in the applicable project agreement and may depend on full payment. Third-party materials remain subject to their respective licences.</p>
            </>
        ),
    },
    {
        id: "confidentiality",
        title: "Confidentiality",
        content: (
            <p>
                Each party should use reasonable care to protect confidential business, technical, and
                customer information received from the other and use it only for the relevant engagement.
                This does not apply to information that is public through no breach, independently developed,
                already lawfully known, or required to be disclosed by law. A separate confidentiality
                agreement will control where one exists.
            </p>
        ),
    },
    {
        id: "third-party-services",
        title: "Third-party services",
        content: (
            <p>
                Our website and deliverables may use or link to third-party platforms, APIs, hosting,
                databases, advertising networks, payment services, communication tools, open-source software,
                or AI services. Their availability, pricing, policies, and decisions are outside our control.
                You are responsible for reviewing and complying with the terms applicable to accounts owned
                or operated by you.
            </p>
        ),
    },
    {
        id: "availability-and-disclaimers",
        title: "Availability and disclaimers",
        content: (
            <>
                <p>We aim to provide reliable services but do not promise that the website, CRM, integrations, or third-party services will always be uninterrupted, error-free, or compatible with every device or platform.</p>
                <p>Unless expressly stated in a signed agreement, services and website content are provided on an “as available” basis. Estimates, audits, recommendations, forecasts, search rankings, advertising results, conversion improvements, and other outcomes are not guarantees.</p>
            </>
        ),
    },
    {
        id: "limitation-of-liability",
        title: "Limitation of liability",
        content: (
            <p>
                To the maximum extent permitted by applicable law, Adamant will not be liable for indirect,
                incidental, special, punitive, or consequential loss, including lost profits, revenue, data,
                goodwill, or business opportunity. For a paid engagement, our aggregate liability arising from
                that engagement will not exceed the amount paid to us for the specific services giving rise to
                the claim during the six months before the event, unless a signed agreement or applicable law
                requires otherwise.
            </p>
        ),
    },
    {
        id: "suspension-and-termination",
        title: "Suspension and termination",
        content: (
            <p>
                We may restrict or terminate website, CRM, or service access where reasonably necessary for
                security, non-payment, legal compliance, misuse, or breach of these Terms. Project termination,
                handover, outstanding fees, and treatment of work in progress are governed by the applicable
                project agreement. Provisions intended to survive termination, including payment,
                confidentiality, intellectual property, disclaimers, and liability terms, will continue.
            </p>
        ),
    },
    {
        id: "governing-law",
        title: "Governing law and disputes",
        content: (
            <p>
                These Terms are governed by the laws of India. The parties should first attempt to resolve a
                dispute through good-faith written discussions. If that is unsuccessful, courts having
                jurisdiction over the registered office of JSSS Adamant Technologies Private Limited will
                have jurisdiction, subject to any different dispute process stated in a signed agreement.
            </p>
        ),
    },
    {
        id: "changes-and-contact",
        title: "Changes and contact",
        content: (
            <>
                <p>We may update these Terms to reflect changes to our services, systems, or legal requirements. The latest version will be posted here with a revised “Last updated” date. Continued use after an update means the revised Terms apply to subsequent use.</p>
                <p>Questions about these Terms can be sent to JSSS Adamant Technologies Private Limited at <a href="mailto:admin@theadamant.com">admin@theadamant.com</a>.</p>
            </>
        ),
    },
];

export default function TermsPage() {
    return (
        <LegalPage
            eyebrow="Legal"
            title="Terms of Service"
            description={description}
            lastUpdated="14 August 2026"
            sections={sections}
        />
    );
}
