"use client";

import {useEffect, useState} from "react";
import {
    MobileNav,
    MobileNavHeader, MobileNavMenu, MobileNavToggle,
    Navbar as NavbarComponent, AppLogo,
    NavBody,
    NavItems
} from "@/components/ui/resizable-navbar";
import {IconMoon, IconSun} from "@tabler/icons-react";
import Link from "next/link";
import {LanguageSwitcher} from "@/components/ui/language-switcher";

export function Navbar() {
    const navItems = [
        {
            name: "Services",
            link: "#services",
        },
        {
            name: "Process",
            link: "#process",
        },
        {
            name: "FAQ",
            link: "#faq",
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
            <NavBody>
                <AppLogo className="mr-4 px-2"/>
                <NavItems items={navItems}/>
                <div className="flex items-center gap-3">
                    <LanguageSwitcher/>

                    <button
                        type="button"
                        aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
                        className="theme-toggle"
                        onClick={toggleTheme}
                    >
                        {isDarkMode
                            ? <IconSun className="theme-toggle-icon" stroke={1.8}/>
                            : <IconMoon className="theme-toggle-icon" stroke={1.8}/>}
                    </button>

                    <Link href="#contact" className="button-primary px-4 py-2.5 text-sm">
                        Start a project
                    </Link>
                </div>
            </NavBody>

            <MobileNav>
                <MobileNavHeader>
                    <AppLogo className="mr-4 px-2"/>
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
                    <LanguageSwitcher mobile/>
                    <button
                        type="button"
                        aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
                        className="feature-chip justify-start"
                        onClick={toggleTheme}
                    >
                        {isDarkMode
                            ? <IconSun className="theme-toggle-icon" stroke={1.8}/>
                            : <IconMoon className="theme-toggle-icon" stroke={1.8}/>}
                        <span>{isDarkMode ? "Light mode" : "Dark mode"}</span>
                    </button>
                    <Link
                        href="#contact"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="button-primary w-full"
                    >
                        Start a project
                    </Link>
                </MobileNavMenu>
            </MobileNav>
        </NavbarComponent>
    );
}
