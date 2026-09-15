"use client";

import {useEffect} from "react";
import {usePathname} from "next/navigation";
import {getAnalyticsReferrer, isPublicAnalyticsPath, trackSiteEvent} from "@/lib/firebase-analytics";
import {gtagSendEvent} from "@/lib/google-tag-manager";

const sections = new Set(["services", "contact", "faq", "process", "credentials", "adamant-system", "path-to-success"]);
let lastPage = "";

export default function SiteAnalytics() {
    const pathname = usePathname();
    useEffect(() => {
        if (!isPublicAnalyticsPath(pathname)) { lastPage = ""; return; }
        if (lastPage !== pathname) {
            const previousPage = lastPage;
            lastPage = pathname;
            void trackSiteEvent("page_view", {
                page_path: pathname,
                page_location: `${window.location.origin}${pathname}`,
                page_referrer: previousPage ? `${window.location.origin}${previousPage}` : getAnalyticsReferrer(),
            });
        }
        const trackSection = () => {
            const section = window.location.hash.slice(1);
            if (sections.has(section)) void trackSiteEvent("section_view", {section, page_path: pathname});
        };
        const trackContact = (event: MouseEvent) => {
            if (!(event.target instanceof Element)) return;
            const link = event.target.closest("a");
            if (!link) return;
            const href = link.getAttribute("href") || "";
            const method = /^https:\/\/(?:wa\.me|api\.whatsapp\.com)(?:\/|$)/i.test(href) ? "whatsapp"
                : href.startsWith("mailto:") ? "email" : href.startsWith("tel:") ? "phone" : "";
            if (!method) return;

            void trackSiteEvent("contact_click", {method, page_path: pathname});

            const shouldDelayNavigation = !event.defaultPrevented
                && event.button === 0
                && !event.metaKey
                && !event.ctrlKey
                && !event.shiftKey
                && !event.altKey
                && !link.hasAttribute("download")
                && (!link.target || link.target === "_self");

            if (shouldDelayNavigation) {
                event.preventDefault();
                gtagSendEvent(link.href);
            } else {
                gtagSendEvent();
            }
        };
        trackSection();
        window.addEventListener("hashchange", trackSection);
        document.addEventListener("click", trackContact);
        return () => {
            window.removeEventListener("hashchange", trackSection);
            document.removeEventListener("click", trackContact);
        };
    }, [pathname]);
    return null;
}
