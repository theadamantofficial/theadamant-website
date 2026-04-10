"use client";

import React from "react";
import Image from "next/image";
import {CardBody, CardContainer, CardItem} from "@/components/ui/3d-card";
import Link from "next/link";

interface ServiceCardProps {
    title: string;
    description: string;
    detail: string;
    image: string;
    badge?: string;
    href?: string;
    ctaLabel?: string;
}

export function ServiceCard({title, description, detail, image, badge, href, ctaLabel}: ServiceCardProps) {
    return (
        <CardContainer className="inter-var h-full w-full" containerClassName="h-full w-full items-stretch py-0">
            <CardBody
                className="relative flex h-full min-h-[38rem] w-full flex-col overflow-hidden rounded-[2rem] border border-black/[0.08] bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(245,239,230,0.88))] p-6 shadow-[0_35px_80px_-45px_rgba(15,23,42,0.45)] dark:border-white/[0.12] dark:bg-[linear-gradient(180deg,rgba(18,19,20,0.96),rgba(21,24,26,0.86))] sm:p-7 lg:min-h-[39rem]">
                <CardItem translateZ="100" className="w-full">
                    <div className="relative h-60 w-full overflow-hidden rounded-[1.5rem] border border-black/6 dark:border-white/8">
                        <Image
                            src={image}
                            alt={title}
                            fill
                            className="object-cover rounded-xl group-hover/card:shadow-xl"
                            sizes="(max-width: 768px) 100vw,
                                 (max-width: 1200px) 50vw,
                                 33vw"
                        />
                    </div>
                </CardItem>

                <CardItem
                    translateZ="80"
                    className="mt-6 w-full text-2xl font-semibold tracking-tight text-foreground"
                >
                    {badge && (
                        <span className="mb-3 inline-flex rounded-full border border-black/10 bg-black/[0.04] px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-foreground/60 dark:border-white/10 dark:bg-white/6 dark:text-white/70">
                            {badge}
                        </span>
                    )}
                    {title}
                </CardItem>

                <CardItem
                    as="p"
                    translateZ="60"
                    className="mt-3 max-w-sm text-sm leading-6 text-foreground/68"
                >
                    {description}
                </CardItem>

                <div className="mt-auto px-1 pb-1 pt-7 sm:px-1.5 sm:pb-1.5">
                    <CardItem
                        translateZ="40"
                        className="rounded-[1.5rem] border border-black/8 bg-white/72 p-5 dark:border-white/10 dark:bg-white/5 sm:p-6"
                    >
                        <p className="text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-foreground/45">
                            What this service covers
                        </p>
                        <p className="mt-3 text-sm leading-6 text-foreground/68">
                            {detail}
                        </p>
                        {href && ctaLabel && (
                            <Link
                                href={href}
                                target="_blank"
                                rel="noreferrer"
                                className="mt-4 inline-flex items-center text-sm font-semibold text-foreground transition hover:opacity-75"
                            >
                                {ctaLabel}
                            </Link>
                        )}
                    </CardItem>
                </div>
            </CardBody>

        </CardContainer>
    );
}
