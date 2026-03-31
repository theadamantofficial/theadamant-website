"use client";

import React from "react";
import Image from "next/image";
import {CardBody, CardContainer, CardItem} from "@/components/ui/3d-card";

interface ServiceCardProps {
    title: string;
    description: string;
    detail: string;
    image: string;
}

export function ServiceCard({title, description, detail, image}: ServiceCardProps) {
    return (
        <CardContainer className="inter-var h-full w-full" containerClassName="w-full py-0">
            <CardBody
                className="relative flex min-h-[36rem] w-full flex-col overflow-hidden rounded-[2rem] border border-black/[0.08] bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(245,239,230,0.88))] p-6 shadow-[0_35px_80px_-45px_rgba(15,23,42,0.45)] dark:border-white/[0.12] dark:bg-[linear-gradient(180deg,rgba(18,19,20,0.96),rgba(21,24,26,0.86))]">
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
                    {title}
                </CardItem>

                <CardItem
                    as="p"
                    translateZ="60"
                    className="mt-3 max-w-sm text-sm leading-6 text-foreground/68"
                >
                    {description}
                </CardItem>

                <CardItem
                    translateZ="40"
                    className="mt-auto rounded-[1.4rem] border border-black/8 bg-white/72 p-4 dark:border-white/10 dark:bg-white/5"
                >
                    <p className="text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-foreground/45">
                        What this service covers
                    </p>
                    <p className="mt-3 text-sm leading-6 text-foreground/68">
                        {detail}
                    </p>
                </CardItem>
            </CardBody>

        </CardContainer>
    );
}
