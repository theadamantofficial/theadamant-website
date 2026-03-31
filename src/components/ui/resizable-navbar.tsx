"use client";
import {cn} from "@/lib/utils";
import {IconMenu2, IconX} from "@tabler/icons-react";
import {
    motion,
    AnimatePresence,
    useScroll,
    useMotionValueEvent,
} from "motion/react";
import Image from "next/image";
import React, {useRef, useState} from "react";
import Link from "next/link";


interface NavbarProps {
    children: React.ReactNode;
    className?: string;
}

interface NavBodyProps {
    children: React.ReactNode;
    className?: string;
    visible?: boolean;
    hidden?: boolean;
}

interface NavItemsProps {
    items: {
        name: string;
        link: string;
    }[];
    className?: string;
    onItemClick?: () => void;
}

interface MobileNavProps {
    children: React.ReactNode;
    className?: string;
    visible?: boolean;
    hidden?: boolean;
}

interface MobileNavHeaderProps {
    children: React.ReactNode;
    className?: string;
}

interface MobileNavMenuProps {
    children: React.ReactNode;
    className?: string;
    isOpen: boolean;
    onClose: () => void;
}

export const Navbar = ({children, className}: NavbarProps) => {
    const ref = useRef<HTMLDivElement>(null);
    const {scrollY} = useScroll();
    const previousScrollY = useRef(0);
    const [visible, setVisible] = useState<boolean>(false);
    const [hidden, setHidden] = useState<boolean>(false);

    useMotionValueEvent(scrollY, "change", (latest) => {
        const wasScrollingDown = latest > previousScrollY.current;

        setVisible(latest > 24);
        setHidden(wasScrollingDown && latest > 180);

        previousScrollY.current = latest;
    });

    return (
        <motion.div
            ref={ref}
            animate={{
                y: hidden ? -120 : 0,
            }}
            transition={{
                duration: 0.35,
                ease: [0.22, 1, 0.36, 1],
            }}
            className={cn("fixed inset-x-0 top-0 z-50 w-full px-4 pt-3 sm:px-6", className)}
        >
            {React.Children.map(children, (child) =>
                React.isValidElement(child)
                    ? React.cloneElement(
                        child as React.ReactElement<{ visible?: boolean; hidden?: boolean }>,
                        {visible, hidden},
                    )
                    : child,
            )}
        </motion.div>
    );
};

export const NavBody = ({children, className, visible, hidden}: NavBodyProps) => {
    return (
        <motion.div
            animate={{
                backdropFilter: visible ? "blur(16px)" : "none",
                boxShadow: visible
                    ? "0 28px 70px -42px rgba(15, 23, 42, 0.55), 0 0 0 1px rgba(255, 255, 255, 0.08) inset"
                    : "none",
                scale: visible ? 0.96 : 1,
                y: visible ? 2 : 0,
                opacity: hidden ? 0.94 : 1,
            }}
            transition={{
                duration: 0.42,
                ease: [0.22, 1, 0.36, 1],
            }}
            className={cn(
                "relative z-[60] mx-auto hidden w-full max-w-6xl flex-row items-center justify-between rounded-full border border-transparent bg-transparent px-5 py-3 lg:flex",
                visible && "border-black/8 bg-white/75 dark:border-white/10 dark:bg-neutral-950/72",
                className,
            )}
            style={{
                transformOrigin: "top center",
            }}
        >
            {children}
        </motion.div>
    );
};

export const NavItems = ({items, className, onItemClick}: NavItemsProps) => {
    const [hovered, setHovered] = useState<number | null>(null);

    return (
        <motion.div
            onMouseLeave={() => setHovered(null)}
            className={cn(
                "absolute inset-0 hidden flex-1 flex-row items-center justify-center space-x-2 text-sm font-medium text-zinc-600 transition duration-200 hover:text-zinc-800 lg:flex lg:space-x-2",
                className,
            )}
        >
            {items.map((item, idx) => (
                <Link
                    onMouseEnter={() => setHovered(idx)}
                    onClick={onItemClick}
                    className="relative px-4 py-2 text-neutral-600 dark:text-neutral-300"
                    key={`link-${idx}`}
                    href={item.link}
                >
                    {hovered === idx && (
                        <motion.div
                            layoutId="hovered"
                            className="absolute inset-0 h-full w-full rounded-full bg-gray-100 dark:bg-neutral-800"
                        />
                    )}
                    <span className="relative z-20">{item.name}</span>
                </Link>
            ))}
        </motion.div>
    );
};

export const MobileNav = ({children, className, visible, hidden}: MobileNavProps) => {
    return (
        <motion.div
            animate={{
                backdropFilter: visible ? "blur(16px)" : "none",
                boxShadow: visible
                    ? "0 28px 70px -42px rgba(15, 23, 42, 0.55), 0 0 0 1px rgba(255, 255, 255, 0.08) inset"
                    : "none",
                borderRadius: visible ? "999px" : "999px",
                scale: visible ? 0.98 : 1,
                y: visible ? 2 : 0,
                opacity: hidden ? 0.94 : 1,
            }}
            transition={{
                duration: 0.42,
                ease: [0.22, 1, 0.36, 1],
            }}
            className={cn(
                "relative z-50 mx-auto flex w-full max-w-[calc(100vw-2rem)] flex-col items-center justify-between border border-transparent bg-transparent px-3 py-3 lg:hidden",
                visible && "border-black/8 bg-white/75 dark:border-white/10 dark:bg-neutral-950/72",
                className,
            )}
            style={{
                transformOrigin: "top center",
            }}
        >
            {children}
        </motion.div>
    );
};

export const MobileNavHeader = ({
                                    children,
                                    className,
                                }: MobileNavHeaderProps) => {
    return (
        <div
            className={cn(
                "flex w-full flex-row items-center justify-between",
                className,
            )}
        >
            {children}
        </div>
    );
};

export const MobileNavMenu = ({
                                  children,
                                  className,
                                  isOpen,
                              }: MobileNavMenuProps) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{opacity: 0, y: -12}}
                    animate={{opacity: 1, y: 0}}
                    exit={{opacity: 0, y: -10}}
                    transition={{duration: 0.22, ease: [0.22, 1, 0.36, 1]}}
                    className={cn(
                        "absolute inset-x-0 top-[calc(100%+0.75rem)] z-50 flex w-full flex-col items-start justify-start gap-4 rounded-[1.75rem] border border-black/8 bg-white px-4 py-6 shadow-[0_28px_70px_-42px_rgba(15,23,42,0.55)] dark:border-white/10 dark:bg-neutral-950",
                        className,
                    )}
                >
                    {children}
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export const MobileNavToggle = ({
                                    isOpen,
                                    onClick,
                                }: {
    isOpen: boolean;
    onClick: () => void;
}) => {
    return isOpen ? (
        <IconX className="text-black dark:text-white" onClick={onClick}/>
    ) : (
        <IconMenu2 className="text-black dark:text-white" onClick={onClick}/>
    );
};

export const AppLogo = ({
    includeText = true,
    className = "",
    href = "/",
}: {
    includeText?: boolean;
    className?: string;
    href?: string;
}) => {
    return (
        <Link
            href={href}
            className={`${className} relative z-20 flex items-center space-x-2 py-1 text-sm font-normal text-black dark:text-white`}
        >
            <Image
                src="/vectors/logo-the-adamant.svg"
                alt="The Adamant logo"
                width={30}
                height={30}
                priority
            />

            {includeText && (
                <span className="font-medium tracking-tight">The Adamant</span>
            )}
        </Link>
    );
};

export const NavbarButton = ({
                                 href,
                                 as: Tag = "a",
                                 children,
                                 className,
                                 variant = "primary",
                                 ...props
                             }: {
    href?: string;
    as?: React.ElementType;
    children: React.ReactNode;
    className?: string;
    variant?: "primary" | "secondary" | "dark" | "gradient";
} & (
    | React.ComponentPropsWithoutRef<"a">
    | React.ComponentPropsWithoutRef<"button">
    )) => {
    const baseStyles =
        "px-4 py-2 rounded-md bg-white button bg-white text-black text-sm font-bold relative cursor-pointer hover:-translate-y-0.5 transition duration-200 inline-block text-center";

    const variantStyles = {
        primary:
            "shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(34,_42,_53,_0.04),_0_0_4px_rgba(34,_42,_53,_0.08),_0_16px_68px_rgba(47,_48,_55,_0.05),_0_1px_0_rgba(255,_255,_255,_0.1)_inset]",
        secondary: "bg-transparent shadow-none dark:text-white",
        dark: "bg-black text-white shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(34,_42,_53,_0.04),_0_0_4px_rgba(34,_42,_53,_0.08),_0_16px_68px_rgba(47,_48,_55,_0.05),_0_1px_0_rgba(255,_255,_255,_0.1)_inset]",
        gradient:
            "bg-gradient-to-b from-blue-500 to-blue-700 text-white shadow-[0px_2px_0px_0px_rgba(255,255,255,0.3)_inset]",
    };

    return (
        <Tag
            href={href || undefined}
            className={cn(baseStyles, variantStyles[variant], className)}
            {...props}
        >
            {children}
        </Tag>
    );
};
