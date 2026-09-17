"use client";

import {DeferredLanguageSwitcher as LanguageSwitcher} from "@/components/ui/deferred-language-switcher";
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
import {SiteCopy} from "@/lib/site-copy";
import {getLocalizedPagePath, getLocalizedPath, SiteLocale} from "@/lib/site-locale";
import {BLOG_LABELS} from "@/lib/blog-config";

const HOME_SECTION_ORDER = [
    "work",
    "credentials",
    "services",
    "process",
    "testimonials",
    "faq",
    "contact",
] as const;

const HOME_SECTION_POSITION = new Map<string, number>(
    HOME_SECTION_ORDER.map((anchor, index) => [anchor, index]),
);


export function Navbar({
    copy,
    locale,
}: {
    copy: SiteCopy["navbar"];
    locale: SiteLocale;
}) {
    const homepageNavItems = [
        {
            name: "Our work",
            anchor: "work",
        },
        ...copy.navItems,
    ].sort((left, right) => (
        (HOME_SECTION_POSITION.get(left.anchor) ?? Number.MAX_SAFE_INTEGER)
        - (HOME_SECTION_POSITION.get(right.anchor) ?? Number.MAX_SAFE_INTEGER)
    ));

    const navItems: Array<{ name: string; link: string; external?: boolean }> = [
        ...homepageNavItems.map((item) => ({
            name: item.name,
            link: getLocalizedPath(locale, item.anchor),
        })),
        {
            name: BLOG_LABELS[locale] ?? BLOG_LABELS.en!,
            link: getLocalizedPagePath(locale, "blog"),
        },
    ];
    const homeHref = getLocalizedPath(locale);

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
        if (typeof darkModeMediaQuery.addEventListener === "function") {
            darkModeMediaQuery.addEventListener("change", handler);
            return () => darkModeMediaQuery.removeEventListener("change", handler);
        }

        darkModeMediaQuery.addListener(handler);
        return () => darkModeMediaQuery.removeListener(handler);
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
            <NavbarComponent className="site-navbar">
            <NavBody>
                <AppLogo className="shrink-0 px-2" href={homeHref}/>
                <NavItems items={navItems}/>
                <div className="relative z-20 flex shrink-0 items-center gap-3">
                    <LanguageSwitcher/>

                    <button
                        type="button"
                        aria-label={isDarkMode ? copy.lightMode : copy.darkMode}
                        className="theme-toggle"
                        onClick={toggleTheme}
                    >
                        {isDarkMode
                            ? <IconSun className="theme-toggle-icon" stroke={1.8}/>
                            : <IconMoon className="theme-toggle-icon" stroke={1.8}/>}
                    </button>

                    <Link href={getLocalizedPath(locale, "contact")} data-magnetic className="button-primary px-4 py-2.5 text-sm">
                        {copy.startProject}
                    </Link>
                </div>
            </NavBody>

            <MobileNav>
                <MobileNavHeader>
                    <AppLogo className="mr-4 px-2" href={homeHref}/>
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
                        item.external ? (
                            <a
                                key={`mobile-link-${idx}`}
                                href={item.link}
                                target="_blank"
                                rel="noreferrer"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="relative text-neutral-600 dark:text-neutral-300"
                            >
                                <span className="block">{item.name}</span>
                            </a>
                        ) : (
                            <Link
                                key={`mobile-link-${idx}`}
                                href={item.link}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="relative text-neutral-600 dark:text-neutral-300"
                            >
                                <span className="block">{item.name}</span>
                            </Link>
                        )
                    ))}
                    <LanguageSwitcher mobile/>
                    <button
                        type="button"
                        aria-label={isDarkMode ? copy.lightMode : copy.darkMode}
                        className="feature-chip justify-start"
                        onClick={toggleTheme}
                    >
                        {isDarkMode
                            ? <IconSun className="theme-toggle-icon" stroke={1.8}/>
                            : <IconMoon className="theme-toggle-icon" stroke={1.8}/>}
                        <span>{isDarkMode ? copy.lightMode : copy.darkMode}</span>
                    </button>
                    <Link
                        href={getLocalizedPath(locale, "contact")}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="button-primary w-full"
                    >
                        {copy.startProject}
                    </Link>
                </MobileNavMenu>
            </MobileNav>
        </NavbarComponent>
    );
}
