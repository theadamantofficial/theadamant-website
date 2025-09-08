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
        <CardContainer className="inter-var h-full">
            <CardBody
                className="bg-gray-50 relative group/card  dark:hover:shadow-2xl dark:hover:shadow-emerald-500/[0.1] dark:bg-black dark:border-white/[0.2] border-black/[0.1] w-full h-full rounded-xl p-6 border  ">

                {/* Image */}
                <CardItem translateZ="100" className="w-full">
                    <div className="relative w-full h-60">
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

                {/* Title */}
                <CardItem
                    translateZ="80"
                    className="w-full text-center text-xl font-bold mt-4 text-neutral-600 dark:text-white"
                >
                    {title}
                </CardItem>

                {/* Description */}
                <CardItem
                    as="p"
                    translateZ="60"
                    className="text-neutral-500 text-sm max-w-sm mt-2 dark:text-neutral-300"
                >
                    {description}
                </CardItem>

                {/* Tech Stack */}
                {techStack.length > 0 && (
                    <CardItem
                        translateZ="40"
                        className="flex flex-wrap w-full justify-center gap-4 mt-6"
                    >
                        {techStack.map((tech, index) => (
                            <div
                                key={index}
                                className="flex items-center gap-2 px-3 py-1 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 shadow-sm"
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

                                <span className="text-sm font-medium text-neutral-600 dark:text-neutral-300">
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
