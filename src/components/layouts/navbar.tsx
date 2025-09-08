"use client";

import {useEffect, useState} from "react";
import {
    MobileNav,
    MobileNavHeader, MobileNavMenu, MobileNavToggle,
    Navbar as NavbarComponent, NavbarLogo,
    NavBody,
    NavItems
} from "@/components/ui/resizable-navbar";
import {IconMoon, IconSun} from "@tabler/icons-react";
import Link from "next/link";

export function Navbar() {
    const navItems = [
        // {
        //     name: "About",
        //     link: "#about",
        // },
        {
            name: "Services",
            link: "#services",
        },
        {
            name: "Contact",
            link: "#contact",
        },
    ];

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false);

    useEffect(() => {
        // Check system preference on mount
        const darkModeMediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
        const systemPrefersDark = darkModeMediaQuery.matches;

        // Check if user previously set a mode in localStorage
        const storedTheme = localStorage.getItem("theme");
        if (storedTheme === "dark") {
            setIsDarkMode(true);
            document.documentElement.classList.add("dark");
        } else if (storedTheme === "light") {
            setIsDarkMode(false);
            document.documentElement.classList.remove("dark");
        } else {
            // If no stored preference, use system preference
            setIsDarkMode(systemPrefersDark);
            if (systemPrefersDark) {
                document.documentElement.classList.add("dark");
            } else {
                document.documentElement.classList.remove("dark");
            }
        }

        // Listen for system theme changes
        const handler = (e: MediaQueryListEvent) => {
            if (!localStorage.getItem("theme")) {
                if (e.matches) {
                    setIsDarkMode(true);
                    document.documentElement.classList.add("dark");
                } else {
                    setIsDarkMode(false);
                    document.documentElement.classList.remove("dark");
                }
            }
        };
        darkModeMediaQuery.addEventListener("change", handler);

        return () => darkModeMediaQuery.removeEventListener("change", handler);
    }, []);

    const toggleTheme = () => {
        if (isDarkMode) {
            document.documentElement.classList.remove("dark");
            localStorage.setItem("theme", "light");
            setIsDarkMode(false);
        } else {
            document.documentElement.classList.add("dark");
            localStorage.setItem("theme", "dark");
            setIsDarkMode(true);
        }
    };

    return (
        <NavbarComponent
        >
            {/* className="bg-red-400 sm:bg-orange-300 md:bg-yellow-200 lg:bg-green-300 xl:bg-blue-300 2xl:bg-violet-300"*/}
            {/* Desktop Navigation */}
            <NavBody>
                <NavbarLogo className="mr-4 px-2"/>
                <NavItems items={navItems}/>
                <div className="flex items-center gap-4">
                    <div className="cursor-pointer relative inline-block" onClick={toggleTheme}>
                        {isDarkMode ? <IconSun size={24}/> : <IconMoon size={24}/>}
                    </div>
                </div>
            </NavBody>

            {/* Mobile Navigation */}
            <MobileNav>
                <MobileNavHeader>
                    <NavbarLogo className="mr-4 px-2"/>
                    <MobileNavToggle
                        isOpen={isMobileMenuOpen}
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    />
                </MobileNavHeader>

                <MobileNavMenu
                    isOpen={isMobileMenuOpen}
                    onClose={() => setIsMobileMenuOpen(false)}
                >
                    {navItems.map((item, idx) => (
                        <Link
                            key={`mobile-link-${idx}`}
                            href={item.link}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="relative text-neutral-600 dark:text-neutral-300"
                        >
                            <span className="block">{item.name}</span>
                        </Link>
                    ))}
                    <div
                        className="flex w-full flex-col gap-4 cursor-pointer"
                        onClick={toggleTheme}
                    >
                        {isDarkMode ? <IconSun size={24}/> : <IconMoon size={24}/>}
                    </div>
                </MobileNavMenu>
            </MobileNav>
        </NavbarComponent>
    );
}
