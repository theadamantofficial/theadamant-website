"use client";

import {Minus, Plus} from "lucide-react";
import {motion} from "motion/react";
import {useState} from "react";
import {useMotionCapability} from "@/hooks/use-motion-capability";
import {cn} from "@/lib/utils";

interface AnimatedFaqItem {
    question: string;
    answer: string;
}

export function AnimatedFaqList({
    items,
    className,
    idPrefix = "faq",
}: {
    items: AnimatedFaqItem[];
    className?: string;
    idPrefix?: string;
}) {
    const [openIndex, setOpenIndex] = useState<number | null>(null);
    const {capability, isReady} = useMotionCapability();
    const hasRichMotion = isReady && capability === "full";
    const transition = hasRichMotion
        ? {duration: 0.38, ease: [0.22, 1, 0.36, 1] as const}
        : {duration: 0};

    return (
        <div className={cn("space-y-4", className)}>
            {items.map((item, index) => {
                const isOpen = openIndex === index;
                const panelId = `${idPrefix}-panel-${index}`;
                const triggerId = `${idPrefix}-trigger-${index}`;

                return (
                    <motion.article
                        key={item.question}
                        className="glass-panel motion-reveal overflow-hidden"
                        initial={{opacity: 0, y: 22}}
                        whileInView={{opacity: 1, y: 0}}
                        viewport={{once: true, amount: 0.25}}
                        animate={isOpen && hasRichMotion ? {scale: 1.006} : {scale: 1}}
                        transition={{duration: 0.5, delay: index * 0.06, ease: [0.22, 1, 0.36, 1]}}
                    >
                        <button
                            id={triggerId}
                            type="button"
                            className="group flex w-full items-center justify-between gap-4 p-6 text-left text-lg font-semibold tracking-tight text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset"
                            aria-expanded={isOpen}
                            aria-controls={panelId}
                            onClick={() => setOpenIndex(isOpen ? null : index)}
                        >
                            <span>{item.question}</span>
                            <motion.span
                                className={cn(
                                    "relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-black/10 transition-colors dark:border-white/10",
                                    isOpen ? "bg-foreground text-background" : "bg-white/70 text-foreground dark:bg-white/5",
                                )}
                                animate={isOpen ? {rotate: 180} : {rotate: 0}}
                                transition={transition}
                            >
                                <Plus className={cn("h-4 w-4 transition-opacity", isOpen ? "opacity-0" : "opacity-100")}/>
                                <Minus className={cn("absolute h-4 w-4 text-background transition-opacity", isOpen ? "opacity-100" : "opacity-0")}/>
                            </motion.span>
                        </button>
                        <motion.div
                            id={panelId}
                            role="region"
                            aria-labelledby={triggerId}
                            initial={false}
                            animate={isOpen
                                ? {height: "auto", opacity: 1, y: 0}
                                : {height: 0, opacity: 0, y: hasRichMotion ? -8 : 0}}
                            transition={transition}
                            className="animated-faq-panel overflow-hidden"
                        >
                            <p className="max-w-3xl px-6 pb-6 text-sm leading-7 text-foreground/68">
                                {item.answer}
                            </p>
                        </motion.div>
                    </motion.article>
                );
            })}
        </div>
    );
}
