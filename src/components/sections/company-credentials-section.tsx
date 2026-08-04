import Image from "next/image";
import Link from "next/link";
import {
    ArrowUpRight,
    BadgeCheck,
    Building2,
    CalendarDays,
    FileCheck2,
    Landmark,
    ShieldCheck,
} from "lucide-react";
import {Reveal, StaggerGroup, StaggerItem} from "@/components/ui/reveal";
import {SiteCopy} from "@/lib/site-copy";

type CredentialsCopy = NonNullable<SiteCopy["credentials"]>;

const DEFAULT_COPY: CredentialsCopy = {
    kicker: "Company credentials",
    title: "Registered in India. Recognized by Startup India.",
    description: "JSSS Adamant Technologies Private Limited is an incorporated Indian company recognized as a startup by DPIIT under the Government of India's Startup India initiative, with independent certifications for quality and information security management.",
    startupEyebrow: "Government recognition",
    startupTitle: "DPIIT-recognized startup",
    startupDescription: "Recognized by the Department for Promotion of Industry and Internal Trade, Ministry of Commerce & Industry, Government of India.",
    recognitionNumberLabel: "Recognition no.",
    issuedLabel: "Issued",
    validLabel: "Valid up to",
    incorporatedLabel: "Incorporated",
    viewCertificate: "View certificate",
    verifyCertificate: "Verify on Startup India",
    isoEyebrow: "Quality management",
    isoTitle: "ISO 9001:2015 certified",
    isoDescription: "Our quality management system has been independently assessed for our software, web, mobile, design, marketing, automation, publishing, and technology consulting activities.",
    securityEyebrow: "Information security",
    securityTitle: "ISO/IEC 27001:2022 certified",
    securityDescription: "Our information security management system has been independently assessed for the same software, digital, automation, publishing, and technology consulting scope.",
    certificationNumberLabel: "Certificate no.",
    initialRegistrationLabel: "Initial registration",
    recertificationLabel: "Re-certification due",
    disclaimer: "DPIIT recognition remains subject to the eligibility and turnover conditions printed on the certificate. ISO certifications are independently issued and are separate from Government of India recognition.",
};

const STARTUP_INDIA_VERIFY_URL = "https://www.startupindia.gov.in/content/sih/en/startupgov/validate-startup-recognition.html";

export default function CompanyCredentialsSection({
    copy = DEFAULT_COPY,
}: {
    copy?: SiteCopy["credentials"];
}) {
    return (
        <section
            id="credentials"
            className="section-shell scroll-mt-28 py-8 sm:py-12"
            aria-labelledby="credentials-heading"
        >
            <Reveal className="relative overflow-hidden rounded-[2.25rem] border border-black/10 bg-[linear-gradient(145deg,rgba(255,255,255,0.9),rgba(239,231,217,0.76))] p-6 shadow-[0_40px_100px_-58px_rgba(15,23,42,0.58)] dark:border-white/10 dark:bg-[linear-gradient(145deg,rgba(20,24,26,0.96),rgba(11,16,18,0.92))] sm:p-8 lg:p-10">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_8%_4%,rgba(13,92,99,0.18),transparent_30%),radial-gradient(circle_at_92%_12%,rgba(214,106,69,0.14),transparent_26%)]"/>
                <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-foreground/30 to-transparent"/>

                <div className="relative">
                    <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                        <div className="max-w-3xl">
                            <p className="section-kicker">
                                <BadgeCheck className="h-4 w-4 text-primary" aria-hidden="true"/>
                                {copy.kicker}
                            </p>
                            <h2 id="credentials-heading" className="section-title">
                                {copy.title}
                            </h2>
                            <p className="section-copy max-w-3xl">
                                {copy.description}
                            </p>
                        </div>

                        <div className="inline-flex w-fit items-center gap-3 rounded-full border border-primary/20 bg-primary/8 px-4 py-3 text-sm font-semibold text-primary dark:border-primary/25 dark:bg-primary/10">
                            <Landmark className="h-5 w-5" aria-hidden="true"/>
                            Government of India · DPIIT
                        </div>
                    </div>

                    <StaggerGroup className="mt-10 grid gap-5 md:grid-cols-2">
                        <StaggerItem className="md:col-span-2">
                            <article className="overflow-hidden rounded-[2rem] border border-black/10 bg-[#0d363a] p-4 text-white shadow-[0_35px_90px_-55px_rgba(13,54,58,0.88)] dark:border-white/10 sm:p-5">
                                <div className="grid items-start gap-4 md:grid-cols-[0.82fr_1.18fr] md:gap-5">
                                    <div className="relative flex flex-col justify-center overflow-hidden rounded-[1.5rem] p-5 sm:p-7 md:self-stretch lg:p-8">
                                        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_0%,rgba(88,183,179,0.32),transparent_36%),radial-gradient(circle_at_100%_100%,rgba(214,106,69,0.2),transparent_32%)]"/>
                                        <div className="relative">
                                            <p className="flex items-center gap-2 text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-white/58">
                                                <FileCheck2 className="h-4 w-4" aria-hidden="true"/>
                                                {copy.startupEyebrow}
                                            </p>
                                            <h3 className="mt-5 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                                                {copy.startupTitle}
                                            </h3>
                                            <p className="mt-4 text-sm leading-7 text-white/72">
                                                {copy.startupDescription}
                                            </p>

                                            <div className="mt-8 flex flex-wrap gap-3">
                                                <Link
                                                    href="/certificates/startup-india-dpiit-recognition.pdf"
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-4 py-3 text-sm font-semibold text-[#0d363a] transition duration-200 hover:-translate-y-0.5 hover:shadow-lg"
                                                >
                                                    {copy.viewCertificate}
                                                    <ArrowUpRight className="h-4 w-4" aria-hidden="true"/>
                                                </Link>
                                                <a
                                                    href={STARTUP_INDIA_VERIFY_URL}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="inline-flex items-center justify-center gap-2 rounded-full border border-white/18 bg-white/8 px-4 py-3 text-sm font-semibold text-white transition duration-200 hover:-translate-y-0.5 hover:bg-white/14"
                                                >
                                                    {copy.verifyCertificate}
                                                    <ArrowUpRight className="h-4 w-4" aria-hidden="true"/>
                                                </a>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="rounded-[1.5rem] bg-[#e4ddd1] p-4 text-[#172124] sm:p-5">
                                        <Link
                                            href="/certificates/startup-india-dpiit-recognition.pdf"
                                            target="_blank"
                                            rel="noreferrer"
                                            aria-label={`${copy.viewCertificate}: ${copy.startupTitle}`}
                                            className="group relative block overflow-hidden rounded-[1.25rem] border border-black/10 bg-[#f9f6ef] p-3 shadow-sm sm:p-4"
                                        >
                                            <Image
                                                src="/certificates/startup-india-dpiit-recognition.webp"
                                                alt="Government of India DPIIT Certificate of Recognition for JSSS Adamant Technologies Private Limited"
                                                width={1600}
                                                height={1131}
                                                sizes="(max-width: 1024px) 100vw, 52vw"
                                                className="h-auto w-full rounded-[0.9rem] object-contain transition duration-500 group-hover:scale-[1.012]"
                                            />
                                            <span className="absolute bottom-5 right-5 flex h-10 w-10 items-center justify-center rounded-full bg-[#172124] text-[#f9f6ef] shadow-lg transition duration-300 group-hover:-translate-y-1 group-hover:translate-x-1">
                                                <ArrowUpRight className="h-4 w-4" aria-hidden="true"/>
                                            </span>
                                        </Link>

                                        <dl className="mt-4 grid gap-3 sm:grid-cols-2">
                                            <RegistrationFact
                                                icon={ShieldCheck}
                                                label={copy.recognitionNumberLabel}
                                                value="DIPP260656"
                                            />
                                            <RegistrationFact
                                                icon={CalendarDays}
                                                label={copy.issuedLabel}
                                                value="11 May 2026"
                                            />
                                            <RegistrationFact
                                                icon={Building2}
                                                label={copy.incorporatedLabel}
                                                value="27 April 2026"
                                            />
                                            <RegistrationFact
                                                icon={CalendarDays}
                                                label={copy.validLabel}
                                                value="26 April 2036"
                                            />
                                        </dl>
                                    </div>
                                </div>
                            </article>
                        </StaggerItem>

                        <StaggerItem>
                            <IndependentCertificateCard
                                eyebrow={copy.isoEyebrow}
                                title={copy.isoTitle}
                                description={copy.isoDescription}
                                pdfPath="/certificates/iso-9001-quality-management-certificate.pdf"
                                imagePath="/certificates/iso-9001-quality-management-certificate.webp"
                                imageAlt="ISO 9001:2015 quality management system certificate for JSSS Adamant Technologies Private Limited"
                                imageHeight={1557}
                                certificateNumber="UK-ARCT-26-144122361"
                                copy={copy}
                            />
                        </StaggerItem>

                        <StaggerItem>
                            <IndependentCertificateCard
                                eyebrow={copy.securityEyebrow}
                                title={copy.securityTitle}
                                description={copy.securityDescription}
                                pdfPath="/certificates/iso-27001-information-security-certificate.pdf"
                                imagePath="/certificates/iso-27001-information-security-certificate.webp"
                                imageAlt="ISO IEC 27001:2022 information security management system certificate for JSSS Adamant Technologies Private Limited"
                                imageHeight={1550}
                                certificateNumber="UK-ARCT-26-144122360"
                                copy={copy}
                            />
                        </StaggerItem>
                    </StaggerGroup>

                    <p className="mt-5 text-xs leading-5 text-foreground/52">
                        {copy.disclaimer}
                    </p>
                </div>
            </Reveal>
        </section>
    );
}

function IndependentCertificateCard({
    eyebrow,
    title,
    description,
    pdfPath,
    imagePath,
    imageAlt,
    imageHeight,
    certificateNumber,
    copy,
}: {
    eyebrow: string;
    title: string;
    description: string;
    pdfPath: string;
    imagePath: string;
    imageAlt: string;
    imageHeight: number;
    certificateNumber: string;
    copy: CredentialsCopy;
}) {
    return (
        <article className="flex h-full flex-col overflow-hidden rounded-[2rem] border border-black/10 bg-white/76 p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.05] sm:p-6">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-foreground/48">
                        {eyebrow}
                    </p>
                    <h3 className="mt-3 text-2xl font-semibold tracking-tight text-foreground">
                        {title}
                    </h3>
                </div>
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-foreground text-background">
                    <ShieldCheck className="h-5 w-5" aria-hidden="true"/>
                </span>
            </div>

            <p className="mt-4 text-sm leading-6 text-foreground/68">
                {description}
            </p>

            <Link
                href={pdfPath}
                target="_blank"
                rel="noreferrer"
                aria-label={`${copy.viewCertificate}: ${title}`}
                className="group mt-6 block overflow-hidden rounded-[1.5rem] border border-black/10 bg-white p-3 dark:border-white/10"
            >
                <Image
                    src={imagePath}
                    alt={imageAlt}
                    width={1100}
                    height={imageHeight}
                    sizes="(max-width: 1280px) 100vw, 44vw"
                    className="h-[20rem] w-full object-contain transition duration-500 group-hover:scale-[1.02] md:h-[15rem] lg:h-[18rem] xl:h-[20rem]"
                />
            </Link>

            <dl className="mt-5 space-y-3">
                <CompactCredentialDetail label={copy.certificationNumberLabel} value={certificateNumber}/>
                <CompactCredentialDetail label={copy.initialRegistrationLabel} value="4 July 2026"/>
                <CompactCredentialDetail label={copy.recertificationLabel} value="3 July 2029"/>
            </dl>

            <Link
                href={pdfPath}
                target="_blank"
                rel="noreferrer"
                className="button-secondary mt-6 w-full"
            >
                {copy.viewCertificate}
                <ArrowUpRight className="h-4 w-4" aria-hidden="true"/>
            </Link>
        </article>
    );
}

function RegistrationFact({
    icon: Icon,
    label,
    value,
}: {
    icon: typeof ShieldCheck;
    label: string;
    value: string;
}) {
    return (
        <div className="rounded-[1.1rem] border border-black/8 bg-white/48 p-4">
            <dt className="flex items-center gap-2 text-[0.64rem] font-semibold uppercase tracking-[0.18em] text-[#172124]/52">
                <Icon className="h-3.5 w-3.5" aria-hidden="true"/>
                {label}
            </dt>
            <dd className="mt-2 text-sm font-semibold text-[#172124]">{value}</dd>
        </div>
    );
}

function CompactCredentialDetail({label, value}: {label: string; value: string}) {
    return (
        <div className="flex items-start justify-between gap-4 border-b border-black/8 pb-3 text-sm last:border-b-0 last:pb-0 dark:border-white/10">
            <dt className="text-foreground/52">{label}</dt>
            <dd className="text-right font-semibold text-foreground">{value}</dd>
        </div>
    );
}
