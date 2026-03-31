"use client";

import React, {useEffect, useState} from "react";
import emailjs from "@emailjs/browser";
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import {cn} from "@/lib/utils";
import Image from "next/image";
import {Dropdown} from "@/components/ui/dropdown";
import {Textarea} from "@/components/ui/text-area";
import {Calendar, CheckCircle2, Clock3, FileText, Mail, MessageSquareText, Target} from "lucide-react";
import {Reveal, StaggerGroup, StaggerItem} from "@/components/ui/reveal";
import toast from "react-hot-toast";

const SUCCESS_RESET_MS = 4000;
const EMAILJS_SERVICE_ID = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || "default_service";
const EMAILJS_TEMPLATE_ID = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID;
const EMAILJS_PUBLIC_KEY = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;

export default function ContactUsSection() {
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
            const errorMessage = "EmailJS is not fully configured yet. Add the template ID and public key to continue.";
            setSubmissionError(errorMessage);
            toast.error(errorMessage);
            return;
        }

        setIsSubmitting(true);

        try {
            await emailjs.sendForm(
                EMAILJS_SERVICE_ID,
                EMAILJS_TEMPLATE_ID,
                form,
                {
                    publicKey: EMAILJS_PUBLIC_KEY,
                }
            );

            form.reset();
            setIsSubmitted(true);
            toast.success("Project details sent.");
        } catch (error) {
            console.error("EmailJS submission failed", error);
            const errorMessage = "Could not send the message right now. Please try again.";
            setSubmissionError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    const contactHighlights = [
        {
            title: "Share the real goal",
            description: "Tell us what you want users to understand, feel, or do when they land on the page.",
            icon: MessageSquareText,
        },
        {
            title: "Expect a focused reply",
            description: "We can shape the right mix of design, development, and SEO foundations around your scope.",
            icon: Mail,
        },
        {
            title: "Move at launch speed",
            description: "The process is meant to keep momentum high, especially for early-stage websites and product ideas.",
            icon: Clock3,
        },
    ];

    const projectBriefItems = [
        {
            title: "Business goal",
            description: "What should this page, product, or launch help you achieve?",
            icon: Target,
        },
        {
            title: "Launch timing",
            description: "Share the target window so the scope can match the pace.",
            icon: Calendar,
        },
        {
            title: "References",
            description: "Links, examples, or competitors help us understand the direction quickly.",
            icon: FileText,
        },
    ];

    return (
        <section id="contact" className="section-shell pb-24 pt-10" aria-labelledby="contact-heading">
            <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
                <Reveal className="glass-panel flex h-full flex-col justify-between gap-8 overflow-hidden p-8 sm:p-10">
                    <div>
                        <p className="section-kicker">Contact</p>
                        <h2 id="contact-heading" className="section-title">
                            Tell us what you want to build.
                        </h2>

                        <p className="section-copy">
                            If the goal is to make a stronger first impression, improve clarity, or build a search-friendly foundation, this is the right place to start. Share your scope, timeline, and what success should look like.
                        </p>

                        <StaggerGroup className="mt-8 grid gap-4 md:grid-cols-2">
                            {contactHighlights.map(({title, description, icon: Icon}, index) => (
                                <StaggerItem key={title} className={index === contactHighlights.length - 1 ? "md:col-span-2" : ""}>
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
                            ))}
                        </StaggerGroup>
                    </div>

                    <div className="overflow-hidden rounded-[1.75rem] border border-black/8 bg-[#edf4f1] pt-6 dark:border-white/10 dark:bg-[#122326]">
                        <Image
                            src="/images/img-contact-us-light.png"
                            alt="Illustration representing contact and project planning"
                            className="max-h-[250px] w-full object-cover object-center dark:hidden"
                            width={700}
                            height={520}
                        />
                        <Image
                            src="/images/img-contact-us-dark.png"
                            alt="Illustration representing contact and project planning"
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
                                <Label htmlFor="fullname" required>Full name</Label>
                                <Input id="fullname" name="user_name" autoComplete="name" placeholder="Rahul Patel" type="text" required/>
                            </LabelInputContainer>

                            <LabelInputContainer>
                                <Label htmlFor="email" required>Email Address</Label>
                                <Input id="email" name="user_email" autoComplete="email" placeholder="rahulpatel@example.com" type="email" required/>
                            </LabelInputContainer>

                            <LabelInputContainer>
                                <Label htmlFor="purpose" required>Select purpose</Label>
                                <Dropdown id="purpose" name="inquiry_type" defaultValue="" required>
                                    <option value="" disabled>
                                        Select purpose...
                                    </option>
                                    <option value="general">General Inquiry</option>
                                    <option value="demo">Request a Demo</option>
                                    <option value="quote">Get a Quote / Pricing</option>
                                    <option value="support">Technical Support</option>
                                    <option value="partnership">Partnership / Collaboration</option>
                                    <option value="careers">Career Opportunities</option>
                                    <option value="feedback">Feedback / Suggestions</option>
                                    <option value="other">Other</option>
                                </Dropdown>
                            </LabelInputContainer>

                            <LabelInputContainer>
                                <Label htmlFor="description" required>Description</Label>
                                <Textarea
                                    id="description"
                                    name="message"
                                    placeholder="Tell us about the page, product, or experience you want users to remember."
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
                                        <p className="font-semibold text-foreground">A better brief gets a sharper first reply.</p>
                                        <p className="mt-1 text-sm leading-6 text-foreground/68">
                                            If you already have these details, include them so the first response can be more specific.
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                                    {projectBriefItems.map(({title, description, icon: Icon}) => (
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
                                    ))}
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
                                      Message captured. The button will return in a few seconds.
                                    </span>
                                </div>
                            ) : (
                                <button
                                    className="button-primary w-full"
                                    type="submit"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? "Sending project details..." : "Send project details"}
                                </button>
                            )}
                        </div>
                    </form>
                </Reveal>
            </div>
        </section>
    );
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
