"use client";

import React, {useState} from "react";
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import {cn} from "@/lib/utils";
import Image from "next/image";
import {Dropdown} from "@/components/ui/dropdown";
import {Textarea} from "@/components/ui/text-area";
import {BackgroundGradient} from "@/components/ui/background-gradient";
import {IconClick} from "@tabler/icons-react";

export default function ContactUsSection() {
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        console.log("Form submitted");
        setIsSubmitted(true);
    };

    return (
        <section id="contact" className="mx-auto my-10 w-full p-0 md:p-8 flex flex-col items-center gap-10">
            <h2 className="text-3xl font-bold md:text-4xl">
                Contact Us
            </h2>

            {/* Image & Form */}
            <div
                className="shadow-input flex flex-col xl:flex-row items-center justify-between w-full max-w-6xl">

                {/*Image*/}
                <div className="hidden xl:block">
                    <Image src="/images/img-contact-us-light.png" alt="" className="dark:hidden" width={500}
                           height={500}/>
                    <Image src="/images/img-contact-us-dark.png" alt="" className="hidden dark:block" width={500}
                           height={500}/>
                </div>

                {/* Form with Background */}
                <BackgroundGradient containerClassName="w-4/5 md:w-4/6 xl:w-1/2 my-8"
                                    className="rounded-[22px] bg-white dark:bg-zinc-900">

                    {/* Form */}
                    <form className="flex flex-col items-center w-full h-full gap-8 p-8 lg:p-10"
                          onSubmit={handleSubmit}>

                        {/* Name */}
                        <LabelInputContainer>
                            <Label htmlFor="fullname" required>Full name</Label>
                            <Input id="fullname" placeholder="Rahul Patel" type="text" required/>
                        </LabelInputContainer>

                        {/* Email */}
                        <LabelInputContainer>
                            <Label htmlFor="email" required>Email Address</Label>
                            <Input id="email" placeholder="rahulpatel@example.com" type="email" required/>
                        </LabelInputContainer>

                        {/* Purpose */}
                        <LabelInputContainer>
                            <Label htmlFor="purpose" required>Select purpose</Label>
                            <Dropdown id="purpose" defaultValue="" required>
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

                        {/* Description */}
                        <LabelInputContainer>
                            <Label htmlFor="description" required>Description</Label>
                            <Textarea
                                id="description"
                                placeholder="Write your message here..."
                                required
                                rows={4}
                            />
                        </LabelInputContainer>

                        {isSubmitted ? (
                            // Success message
                            <div className="flex gap-3 py-2 text-green-500">
                                <IconClick size={24}/>

                                <span className="font-medium">
                                  Submitted successfully 🎉
                                </span>
                            </div>
                        ) : (
                            // Submit button
                            <button
                                className="group/btn mt-4 relative block h-10 w-full rounded-md bg-gradient-to-br from-black to-neutral-600 font-medium text-white shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:bg-zinc-800 dark:from-zinc-900 dark:to-zinc-900 dark:shadow-[0px_1px_0px_0px_#27272a_inset,0px_-1px_0px_0px_#27272a_inset]"
                                type="submit"
                            >
                                Submit
                                <BottomGradient/>
                            </button>
                        )}

                    </form>

                </BackgroundGradient>
            </div>
        </section>
    );
}

const BottomGradient = () => {
    return (
        <>
            <span
                className="absolute inset-x-0 -bottom-px block h-px w-full bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-0 transition duration-500 group-hover/btn:opacity-100"/>

            <span
                className="absolute inset-x-10 -bottom-px mx-auto block h-px w-1/2 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-0 blur-sm transition duration-500 group-hover/btn:opacity-100"/>
        </>
    );
};

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
