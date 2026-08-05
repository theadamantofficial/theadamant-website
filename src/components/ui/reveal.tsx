"use client";

import {motion, type HTMLMotionProps} from "motion/react";
import {ReactNode} from "react";
import {cn} from "@/lib/utils";

const smoothEase = [0.22, 1, 0.36, 1] as const;

type RevealProps = HTMLMotionProps<"div"> & {
    children: ReactNode;
    delay?: number;
};

export function Reveal({children, className, delay = 0, ...props}: RevealProps) {
    return (
        <motion.div
            className={cn("motion-reveal", className)}
            initial={{opacity: 0, y: 28}}
            whileInView={{opacity: 1, y: 0}}
            viewport={{once: true, amount: 0.22}}
            transition={{duration: 0.65, ease: smoothEase, delay}}
            {...props}
        >
            {children}
        </motion.div>
    );
}

type StaggerGroupProps = HTMLMotionProps<"div"> & {
    children: ReactNode;
};

export function StaggerGroup({children, className, ...props}: StaggerGroupProps) {
    return (
        <motion.div
            className={cn("motion-reveal", className)}
            initial="hidden"
            whileInView="show"
            viewport={{once: true, amount: 0.18}}
            variants={{
                hidden: {},
                show: {
                    transition: {
                        staggerChildren: 0.12,
                    },
                },
            }}
            {...props}
        >
            {children}
        </motion.div>
    );
}

type StaggerItemProps = HTMLMotionProps<"div"> & {
    children: ReactNode;
};

export function StaggerItem({children, className, ...props}: StaggerItemProps) {
    return (
        <motion.div
            className={cn("motion-reveal", className)}
            variants={{
                hidden: {opacity: 0, y: 24},
                show: {
                    opacity: 1,
                    y: 0,
                    transition: {
                        duration: 0.6,
                        ease: smoothEase,
                    },
                },
            }}
            {...props}
        >
            {children}
        </motion.div>
    );
}
