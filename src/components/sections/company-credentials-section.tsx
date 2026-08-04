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
    description: "JSSS Adamant Technologies Private Limited is an incorporated Indian company recognized as a startup by DPIIT under the Government of India's Startup India initiative.",
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
    certificationNumberLabel: "Certificate no.",
    initialRegistrationLabel: "Initial registration",
    recertificationLabel: "Re-certification due",
    disclaimer: "DPIIT recognition remains subject to the eligibility and turnover conditions printed on the certificate. ISO certification is independently issued and is separate from Government of India recognition.",
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
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
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

                    <StaggerGroup className="mt-10 grid gap-5 xl:grid-cols-[1.35fr_0.65fr]">
                        <StaggerItem>
                            <article className="h-full overflow-hidden rounded-[2rem] border border-black/10 bg-[#0d363a] text-white shadow-[0_35px_90px_-55px_rgba(13,54,58,0.88)] dark:border-white/10">
                                <div className="grid h-full lg:grid-cols-[0.88fr_1.12fr]">
                                    <div className="relative flex flex-col p-6 sm:p-8">
                                        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_0%,rgba(88,183,179,0.32),transparent_36%),radial-gradient(circle_at_100%_100%,rgba(214,106,69,0.2),transparent_32%)]"/>
                                        <div className="relative flex h-full flex-col">
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

                                            <dl className="mt-8 grid gap-3 sm:grid-cols-2">
                                                <CredentialDetail
                                                    icon={ShieldCheck}
                                                    label={copy.recognitionNumberLabel}
                                                    value="DIPP260656"
                                                />
                                                <CredentialDetail
                                                    icon={CalendarDays}
                                                    label={copy.issuedLabel}
                                                    value="11 May 2026"
                                                />
                                                <CredentialDetail
                                                    icon={Building2}
                                                    label={copy.incorporatedLabel}
                                                    value="27 April 2026"
                                                />
                                                <CredentialDetail
                                                    icon={CalendarDays}
                                                    label={copy.validLabel}
                                                    value="26 April 2036"
                                                />
                                            </dl>

                                            <div className="mt-8 flex flex-wrap gap-3 lg:mt-auto lg:pt-8">
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

                                    <Link
                                        href="/certificates/startup-india-dpiit-recognition.pdf"
                                        target="_blank"
                                        rel="noreferrer"
                                        aria-label={`${copy.viewCertificate}: ${copy.startupTitle}`}
                                        className="group relative flex min-h-[18rem] items-start overflow-hidden border-t border-white/10 bg-[#e4ddd1] p-4 lg:border-l lg:border-t-0 sm:p-6"
                                    >
                                        <Image
                                            src="/certificates/startup-india-dpiit-recognition.webp"
                                            alt=""
                                            fill
                                            sizes="(max-width: 1024px) 100vw, 46vw"
                                            aria-hidden="true"
                                            className="scale-125 object-cover opacity-20 blur-2xl transition duration-500 group-hover:scale-[1.3] dark:opacity-15"
                                        />
                                        <Image
                                            src="/certificates/startup-india-dpiit-recognition.webp"
                                            alt="Government of India DPIIT Certificate of Recognition for JSSS Adamant Technologies Private Limited"
                                            width={1600}
                                            height={1131}
                                            sizes="(max-width: 1024px) 100vw, 46vw"
                                            className="relative z-10 h-auto w-full rounded-[1.25rem] border border-black/10 object-contain shadow-[0_28px_65px_-42px_rgba(15,23,42,0.72)] transition duration-500 group-hover:scale-[1.015]"
                                        />
                                        <span className="absolute bottom-7 right-7 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-foreground text-background shadow-lg transition duration-300 group-hover:-translate-y-1 group-hover:translate-x-1">
                                            <ArrowUpRight className="h-5 w-5" aria-hidden="true"/>
                                        </span>
                                    </Link>
                                </div>
                            </article>
                        </StaggerItem>

                        <StaggerItem>
                            <article className="flex h-full flex-col overflow-hidden rounded-[2rem] border border-black/10 bg-white/76 p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.05] sm:p-6">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-foreground/48">
                                            {copy.isoEyebrow}
                                        </p>
                                        <h3 className="mt-3 text-2xl font-semibold tracking-tight text-foreground">
                                            {copy.isoTitle}
                                        </h3>
                                    </div>
                                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-foreground text-background">
                                        <ShieldCheck className="h-5 w-5" aria-hidden="true"/>
                                    </span>
                                </div>

                                <p className="mt-4 text-sm leading-6 text-foreground/68">
                                    {copy.isoDescription}
                                </p>

                                <Link
                                    href="/certificates/iso-9001-quality-management-certificate.pdf"
                                    target="_blank"
                                    rel="noreferrer"
                                    aria-label={`${copy.viewCertificate}: ${copy.isoTitle}`}
                                    className="group mt-6 block overflow-hidden rounded-[1.5rem] border border-black/10 bg-white p-3 dark:border-white/10"
                                >
                                    <Image
                                        src="/certificates/iso-9001-quality-management-certificate.webp"
                                        alt="ISO 9001:2015 quality management system certificate for JSSS Adamant Technologies Private Limited"
                                        width={1100}
                                        height={1557}
                                        sizes="(max-width: 1280px) 100vw, 30vw"
                                        className="h-[18rem] w-full object-contain transition duration-500 group-hover:scale-[1.02]"
                                    />
                                </Link>

                                <dl className="mt-5 space-y-3">
                                    <CompactCredentialDetail label={copy.certificationNumberLabel} value="UK-ARCT-26-144122361"/>
                                    <CompactCredentialDetail label={copy.initialRegistrationLabel} value="4 July 2026"/>
                                    <CompactCredentialDetail label={copy.recertificationLabel} value="3 July 2029"/>
                                </dl>

                                <Link
                                    href="/certificates/iso-9001-quality-management-certificate.pdf"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="button-secondary mt-6 w-full"
                                >
                                    {copy.viewCertificate}
                                    <ArrowUpRight className="h-4 w-4" aria-hidden="true"/>
                                </Link>
                            </article>
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

function CredentialDetail({
    icon: Icon,
    label,
    value,
}: {
    icon: typeof ShieldCheck;
    label: string;
    value: string;
}) {
    return (
        <div className="rounded-[1.15rem] border border-white/10 bg-white/[0.06] p-4">
            <dt className="flex items-center gap-2 text-[0.64rem] font-semibold uppercase tracking-[0.18em] text-white/46">
                <Icon className="h-3.5 w-3.5" aria-hidden="true"/>
                {label}
            </dt>
            <dd className="mt-2 text-sm font-semibold text-white">{value}</dd>
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
