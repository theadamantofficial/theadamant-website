"use client";
import * as React from "react";
import {cn} from "@/lib/utils";
import {useMotionTemplate, useMotionValue, motion} from "motion/react";
import {TextareaProps} from "@/types";


const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({className, required, ...props}, ref) => {
        const radius = 100;
        const [visible, setVisible] = React.useState(false);

        const mouseX = useMotionValue(0);
        const mouseY = useMotionValue(0);

        function handleMouseMove({currentTarget, clientX, clientY}: React.MouseEvent<HTMLDivElement, MouseEvent>) {
            const {left, top} = currentTarget.getBoundingClientRect();
            mouseX.set(clientX - left);
            mouseY.set(clientY - top);
        }

        return (
            <motion.div
                style={{
                    background: useMotionTemplate`
            radial-gradient(
              ${visible ? radius + "px" : "0px"} circle at ${mouseX}px ${mouseY}px,
              #3b82f6,
              transparent 80%
            )
          `,
                }}
                onMouseMove={handleMouseMove}
                onMouseEnter={() => setVisible(true)}
                onMouseLeave={() => setVisible(false)}
                className="group/textarea relative rounded-lg p-[2px] transition duration-300"
            >
        <textarea
            ref={ref}
            className={cn(
                `shadow-input flex min-h-[100px] w-full rounded-md border-none bg-gray-50
             px-3 py-2 text-sm text-black transition duration-400 group-hover/textarea:shadow-none
             focus-visible:ring-[2px] focus-visible:ring-neutral-400 focus-visible:outline-none
             disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-800 dark:text-white 
             dark:shadow-[0px_0px_1px_1px_#404040] dark:focus-visible:ring-neutral-600 resize-none`,
                className
            )}
            required={required}
            aria-required={required}
            {...props}
        />
            </motion.div>
        );
    }
);

Textarea.displayName = "Textarea";

export {Textarea};
