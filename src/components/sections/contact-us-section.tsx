"use client";

import React, {useEffect, useState} from "react";
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import {cn} from "@/lib/utils";
import Image from "next/image";
import {Dropdown} from "@/components/ui/dropdown";
import {Textarea} from "@/components/ui/text-area";
import {Calendar, CheckCircle2, Clock3, FileText, Mail, MessageSquareText, Target} from "lucide-react";
import {Reveal, StaggerGroup, StaggerItem} from "@/components/ui/reveal";
import toast from "react-hot-toast";
import {loadEmailJs} from "@/lib/load-emailjs";
import {SiteCopy} from "@/lib/site-copy";

const SUCCESS_RESET_MS = 4000;
const EMAILJS_SERVICE_ID = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || "default_service";
const EMAILJS_TEMPLATE_ID = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID;
const EMAILJS_PUBLIC_KEY = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;

export default function ContactUsSection({copy}: { copy: SiteCopy["contact"] }) {
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submissionError, setSubmissionError] = useState<string | null>(null);

    useEffect(() => {
        if (!isSubmitted) {
            return;
        }

        const timeoutId = window.setTimeout(() => {
            setIsSubmitted(false);
        }, SUCCESS_RESET_MS);

        return () => window.clearTimeout(timeoutId);
    }, [isSubmitted]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget;

        setSubmissionError(null);

        if (!EMAILJS_TEMPLATE_ID || !EMAILJS_PUBLIC_KEY) {
            const errorMessage = copy.form.configError;
            setSubmissionError(errorMessage);
            toast.error(errorMessage);
            return;
        }

        setIsSubmitting(true);

        try {
            const emailjs = await loadEmailJs();
            await emailjs.sendForm(
                EMAILJS_SERVICE_ID,
                EMAILJS_TEMPLATE_ID,
                form,
                {
                    publicKey: EMAILJS_PUBLIC_KEY,
                }
            );

            void notifyQueryWebhook(form);

            form.reset();
            setIsSubmitted(true);
            toast.success(copy.form.successToast);
        } catch (error) {
            console.error("EmailJS submission failed", error);
            const errorMessage = copy.form.sendError;
            setSubmissionError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    const highlightIcons = [MessageSquareText, Mail, Clock3];
    const briefIcons = [Target, Calendar, FileText];

    return (
        <section id="contact" className="section-shell pb-24 pt-10" aria-labelledby="contact-heading">
            <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
                <Reveal className="glass-panel flex h-full flex-col justify-between gap-8 overflow-hidden p-8 sm:p-10">
                    <div>
                        <p className="section-kicker">{copy.kicker}</p>
                        <h2 id="contact-heading" className="section-title">
                            {copy.title}
                        </h2>

                        <p className="section-copy">
                            {copy.description}
                        </p>

                        <StaggerGroup className="mt-8 grid gap-4 md:grid-cols-2">
                            {copy.highlights.map(({title, description}, index) => {
                                const Icon = highlightIcons[index];
                                return (
                                <StaggerItem key={title} className={index === copy.highlights.length - 1 ? "md:col-span-2" : ""}>
                                    <div className="lift-card rounded-[1.5rem] border border-black/8 bg-white/70 p-4 dark:border-white/10 dark:bg-white/5">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-foreground text-background">
                                                <Icon className="h-5 w-5"/>
                                            </div>
                                            <p className="font-semibold text-foreground">{title}</p>
                                        </div>
                                        <p className="mt-3 text-sm leading-6 text-foreground/68">{description}</p>
                                    </div>
                                </StaggerItem>
                                );
                            })}
                        </StaggerGroup>
                    </div>

                    <div className="overflow-hidden rounded-[1.75rem] border border-black/8 bg-[#edf4f1] pt-6 dark:border-white/10 dark:bg-[#122326]">
                        <Image
                            src="/images/img-contact-us-light.png"
                            alt=""
                            className="max-h-[250px] w-full object-cover object-center dark:hidden"
                            width={700}
                            height={520}
                        />
                        <Image
                            src="/images/img-contact-us-dark.png"
                            alt=""
                            className="hidden max-h-[250px] w-full object-cover object-center dark:block"
                            width={700}
                            height={520}
                        />
                    </div>
                </Reveal>

                <Reveal className="glass-panel h-full p-2 sm:p-3" delay={0.12}>
                    <form className="flex h-full flex-col rounded-[1.7rem] bg-white/88 px-6 py-8 dark:bg-zinc-950/90 lg:px-8 lg:py-10"
                          onSubmit={handleSubmit}>
                        <input type="hidden" name="site_name" value="The Adamant"/>
                        <input type="hidden" name="submitted_at" value={new Date().toISOString()}/>

                        <div className="flex flex-1 flex-col gap-8">
                            <LabelInputContainer>
                                <Label htmlFor="fullname" required>{copy.form.fullNameLabel}</Label>
                                <Input id="fullname" name="user_name" autoComplete="name" placeholder={copy.form.fullNamePlaceholder} type="text" required/>
                            </LabelInputContainer>

                            <LabelInputContainer>
                                <Label htmlFor="email" required>{copy.form.emailLabel}</Label>
                                <Input id="email" name="user_email" autoComplete="email" placeholder={copy.form.emailPlaceholder} type="email" required/>
                            </LabelInputContainer>

                            <LabelInputContainer>
                                <Label htmlFor="purpose" required>{copy.form.purposeLabel}</Label>
                                <Dropdown id="purpose" name="inquiry_type" defaultValue="" required>
                                    <option value="" disabled>
                                        {copy.form.purposePlaceholder}
                                    </option>
                                    {copy.form.purposeOptions.map((option) => (
                                        <option key={option.value} value={option.value}>{option.label}</option>
                                    ))}
                                </Dropdown>
                            </LabelInputContainer>

                            <LabelInputContainer>
                                <Label htmlFor="description" required>{copy.form.descriptionLabel}</Label>
                                <Textarea
                                    id="description"
                                    name="message"
                                    placeholder={copy.form.descriptionPlaceholder}
                                required
                                rows={4}
                            />
                            </LabelInputContainer>

                            <div className="mt-auto rounded-[1.5rem] border border-black/8 bg-black/[0.03] p-5 dark:border-white/10 dark:bg-white/[0.03]">
                                <div className="flex items-start gap-3">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-foreground text-background">
                                        <CheckCircle2 className="h-5 w-5"/>
                                    </div>
                                    <div>
                                        <p className="font-semibold text-foreground">{copy.briefTitle}</p>
                                        <p className="mt-1 text-sm leading-6 text-foreground/68">
                                            {copy.briefDescription}
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                                    {copy.briefItems.map(({title, description}, index) => {
                                        const Icon = briefIcons[index];
                                        return (
                                        <div
                                            key={title}
                                            className="rounded-[1.25rem] border border-black/8 bg-white/80 p-4 dark:border-white/10 dark:bg-white/5"
                                        >
                                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-foreground/8 text-foreground dark:bg-white/10">
                                                <Icon className="h-4 w-4"/>
                                            </div>
                                            <p className="mt-3 text-sm font-semibold text-foreground">{title}</p>
                                            <p className="mt-2 text-xs leading-5 text-foreground/62">{description}</p>
                                        </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 space-y-4">
                            {submissionError && (
                                <div aria-live="polite" className="rounded-2xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-400">
                                    {submissionError}
                                </div>
                            )}

                            {isSubmitted ? (
                                <div aria-live="polite" className="flex items-center gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-emerald-600 dark:text-emerald-400">
                                    <CheckCircle2 className="h-5 w-5"/>
                                    <span className="font-medium">
                                      {copy.form.successLabel}
                                    </span>
                                </div>
                            ) : (
                                <button
                                    className="button-primary w-full"
                                    type="submit"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? copy.form.submittingLabel : copy.form.submitLabel}
                                </button>
                            )}
                        </div>
                    </form>
                </Reveal>
            </div>
        </section>
    );
}

async function notifyQueryWebhook(form: HTMLFormElement) {
    const formData = new FormData(form);

    try {
        await fetch("/api/contact-query", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                name: String(formData.get("user_name") || ""),
                email: String(formData.get("user_email") || ""),
                inquiryType: String(formData.get("inquiry_type") || ""),
                message: String(formData.get("message") || ""),
                submittedAt: String(formData.get("submitted_at") || new Date().toISOString()),
            }),
        });
    } catch (error) {
        console.error("Contact query webhook failed", error);
    }
}

const LabelInputContainer = ({
                                 children,
                                 className,
                             }: {
    children: React.ReactNode;
    className?: string;
}) => {
    return (
        <div className={cn("flex w-full flex-col space-y-2", className)}>
            {children}
        </div>
    );
};
