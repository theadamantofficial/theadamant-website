"use client";
import * as React from "react";
import {cn} from "@/lib/utils";
import {useMotionTemplate, useMotionValue, motion} from "motion/react";
import {ChevronDown} from "lucide-react";
import {DropdownProps} from "@/types";

const Dropdown = React.forwardRef<HTMLSelectElement, DropdownProps>(
    ({className, children, required, ...props}, ref) => {
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
                className="group/dropdown relative rounded-lg p-[2px] transition duration-300"
            >
                <select
                    ref={ref}
                    className={cn(
                        `shadow-input flex h-10 w-full appearance-none rounded-md border-none bg-gray-50 
             px-3 pr-8 py-2 text-sm text-black transition duration-400 
             group-hover/dropdown:shadow-none
             focus-visible:ring-[2px] focus-visible:ring-neutral-400 focus-visible:outline-none
             disabled:cursor-not-allowed disabled:opacity-50
             dark:bg-zinc-800 dark:text-white dark:shadow-[0px_0px_1px_1px_#404040] dark:focus-visible:ring-neutral-600`,
                        className
                    )}
                    {...props}
                    required={required}
                    aria-required={required}
                >
                    {children}
                </select>
                {/* custom dropdown arrow */}
                <ChevronDown
                    size={16}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 dark:text-neutral-400"
                />
            </motion.div>
        );
    }
);

Dropdown.displayName = "Dropdown";

export {Dropdown};
