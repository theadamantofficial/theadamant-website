"use client";

import {createContext, ReactNode, useContext, useEffect, useMemo, useState} from "react";

type ThemePreference = "light" | "dark" | "system";
type ThemeContextValue = {theme: ThemePreference; setTheme: (theme: ThemePreference) => void};

const AdminThemeContext = createContext<ThemeContextValue | null>(null);

export function AdminThemeProvider({children}: {children: ReactNode}) {
    const [theme, setThemeState] = useState<ThemePreference>("system");

    useEffect(() => {
        const saved = window.localStorage.getItem("adamant-crm-theme");
        if (saved === "light" || saved === "dark" || saved === "system") setThemeState(saved);
    }, []);

    useEffect(() => {
        const media = window.matchMedia("(prefers-color-scheme: dark)");
        const apply = () => document.documentElement.classList.toggle("crm-dark", theme === "dark" || (theme === "system" && media.matches));
        apply();
        media.addEventListener("change", apply);
        return () => media.removeEventListener("change", apply);
    }, [theme]);

    const value = useMemo(() => ({
        theme,
        setTheme(nextTheme: ThemePreference) {
            setThemeState(nextTheme);
            window.localStorage.setItem("adamant-crm-theme", nextTheme);
        },
    }), [theme]);

    return <AdminThemeContext.Provider value={value}>{children}</AdminThemeContext.Provider>;
}

export function useAdminTheme() {
    const value = useContext(AdminThemeContext);
    if (!value) throw new Error("useAdminTheme must be used within AdminThemeProvider.");
    return value;
}
