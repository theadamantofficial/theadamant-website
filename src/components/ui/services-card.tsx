"use client";

import React from "react";
import Image from "next/image";
import {CardBody, CardContainer, CardItem} from "@/components/ui/3d-card";

interface ServiceCardProps {
    title: string;
    description: string;
    image: string;
    techStack?: { icon: string; label: string, isBlackLogo: boolean }[];
}

export function ServiceCard({title, description, image, techStack = []}: ServiceCardProps) {
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
                    className="mt-3 max-w-sm flex-1 text-sm leading-6 text-foreground/68"
                >
                    {description}
                </CardItem>

                {techStack.length > 0 && (
                    <CardItem
                        translateZ="40"
                        className="mt-6 flex w-full flex-wrap gap-3"
                    >
                        {techStack.map((tech, index) => (
                            <div
                                key={index}
                                className="flex items-center gap-2 rounded-full border border-black/8 bg-white/90 px-3 py-1.5 shadow-sm dark:border-white/10 dark:bg-neutral-900/80"
                            >
                                <div className="relative w-6 h-6">
                                    {tech.isBlackLogo ? (
                                        <Image
                                            src={tech.icon}
                                            alt={tech.label}
                                            fill
                                            className="object-contain dark:invert dark:brightness-200"
                                        />
                                    ) : (
                                        <Image
                                            src={tech.icon}
                                            alt={tech.label}
                                            fill
                                            className="object-contain"
                                        />
                                    )}
                                </div>

                                <span className="text-sm font-medium text-foreground/75 dark:text-neutral-300">
                                    {tech.label}
                                </span>
                            </div>
                        ))}
                    </CardItem>
                )}

            </CardBody>

        </CardContainer>
    );
}
