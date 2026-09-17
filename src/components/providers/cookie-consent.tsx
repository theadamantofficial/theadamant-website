"use client";

import {useEffect, useState} from "react";

export const COOKIE_CONSENT_COOKIE = "adamant-cookie-consent";

type ConsentChoice = "accepted" | "rejected";

function readConsent(): ConsentChoice | null {
    const value = document.cookie
        .split("; ")
        .find((cookie) => cookie.startsWith(`${COOKIE_CONSENT_COOKIE}=`))
        ?.split("=")[1];

    return value === "accepted" || value === "rejected" ? value : null;
}

export function hasAnalyticsConsent() {
    return typeof document !== "undefined" && readConsent() === "accepted";
}

export default function CookieConsent() {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        setVisible(readConsent() === null);
    }, []);

    if (!visible) {
        return null;
    }

    const choose = (choice: ConsentChoice) => {
        document.cookie = `${COOKIE_CONSENT_COOKIE}=${choice}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
        setVisible(false);
        window.dispatchEvent(new CustomEvent("adamant:cookie-consent", {detail: choice}));
    };

    return (
        <aside
            role="dialog"
            aria-labelledby="cookie-consent-title"
            aria-describedby="cookie-consent-description"
            className="fixed inset-x-4 bottom-4 z-[100] mx-auto max-w-2xl rounded-2xl border border-black/10 bg-white p-5 shadow-2xl dark:border-white/10 dark:bg-zinc-950 sm:inset-x-auto sm:right-6 sm:left-6"
        >
            <h2 id="cookie-consent-title" className="text-base font-semibold text-foreground">Cookies and privacy choices</h2>
            <p id="cookie-consent-description" className="mt-2 text-sm leading-6 text-foreground/70">
                We use essential cookies for preferences such as language and theme. With your permission, we also use analytics cookies to understand website usage and improve the experience. You can change your choice by clearing this site&apos;s cookies.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
                <button type="button" onClick={() => choose("accepted")} className="button-primary">Accept analytics cookies</button>
                <button type="button" onClick={() => choose("rejected")} className="button-secondary">Use essential cookies only</button>
            </div>
        </aside>
    );
}
