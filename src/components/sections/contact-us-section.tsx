"use client";

import React, {useState} from "react";
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import {cn} from "@/lib/utils";
import Image from "next/image";
import {Dropdown} from "@/components/ui/dropdown";
import {Textarea} from "@/components/ui/text-area";
import {CheckCircle2, Clock3, Mail, MessageSquareText} from "lucide-react";

export default function ContactUsSection() {
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        e.currentTarget.reset();
        setIsSubmitted(true);
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

    return (
        <section id="contact" className="section-shell pb-24 pt-10" aria-labelledby="contact-heading">
            <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
                <div className="glass-panel overflow-hidden p-8 sm:p-10">
                    <p className="section-kicker">Contact</p>
                    <h2 id="contact-heading" className="section-title">
                        Tell us what you want to build.
                    </h2>

                    <p className="section-copy">
                        If the goal is to make a stronger first impression, improve clarity, or build a search-friendly foundation, this is the right place to start. Share your scope, timeline, and what success should look like.
                    </p>

                    <div className="mt-8 grid gap-4">
                        {contactHighlights.map(({title, description, icon: Icon}) => (
                            <div key={title} className="rounded-[1.5rem] border border-black/8 bg-white/70 p-4 dark:border-white/10 dark:bg-white/5">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-foreground text-background">
                                        <Icon className="h-5 w-5"/>
                                    </div>
                                    <p className="font-semibold text-foreground">{title}</p>
                                </div>
                                <p className="mt-3 text-sm leading-6 text-foreground/68">{description}</p>
                            </div>
                        ))}
                    </div>

                    <div className="mt-8 overflow-hidden rounded-[1.75rem] border border-black/8 bg-[#edf4f1] dark:border-white/10 dark:bg-[#122326]">
                        <Image
                            src="/images/img-contact-us-light.png"
                            alt="Illustration representing contact and project planning"
                            className="w-full dark:hidden"
                            width={700}
                            height={520}
                        />
                        <Image
                            src="/images/img-contact-us-dark.png"
                            alt="Illustration representing contact and project planning"
                            className="hidden w-full dark:block"
                            width={700}
                            height={520}
                        />
                    </div>
                </div>

                <div className="glass-panel p-2 sm:p-3">
                    <form className="flex h-full flex-col gap-8 rounded-[1.7rem] bg-white/88 px-6 py-8 dark:bg-zinc-950/90 lg:px-8 lg:py-10"
                          onSubmit={handleSubmit}>
                        <LabelInputContainer>
                            <Label htmlFor="fullname" required>Full name</Label>
                            <Input id="fullname" name="fullname" autoComplete="name" placeholder="Rahul Patel" type="text" required/>
                        </LabelInputContainer>

                        <LabelInputContainer>
                            <Label htmlFor="email" required>Email Address</Label>
                            <Input id="email" name="email" autoComplete="email" placeholder="rahulpatel@example.com" type="email" required/>
                        </LabelInputContainer>

                        <LabelInputContainer>
                            <Label htmlFor="purpose" required>Select purpose</Label>
                            <Dropdown id="purpose" name="purpose" defaultValue="" required>
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
                                name="description"
                                placeholder="Tell us about the page, product, or experience you want users to remember."
                                required
                                rows={4}
                            />
                        </LabelInputContainer>

                        {isSubmitted ? (
                            <div aria-live="polite" className="flex items-center gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-emerald-600 dark:text-emerald-400">
                                <CheckCircle2 className="h-5 w-5"/>
                                <span className="font-medium">
                                  Message captured. You can refine it and send another version anytime.
                                </span>
                            </div>
                        ) : (
                            <button
                                className="button-primary mt-2 w-full"
                                type="submit"
                            >
                                Send project details
                            </button>
                        )}
                    </form>
                </div>
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
