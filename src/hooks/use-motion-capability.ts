"use client";
import {useSyncExternalStore} from "react";
import {getMotionCapability, type MotionCapability} from "@/lib/motion-capability";
type SignalsNavigator = Navigator & {deviceMemory?: number; connection?: EventTarget & {saveData?: boolean; effectiveType?: string}};
const initial = {capability: "lite" as MotionCapability, isReady: false};
let snapshot = initial;
const subscribers = new Set<() => void>();
let cleanup: (() => void) | undefined;
function subscribe(listener: () => void) {
    subscribers.add(listener);
    if (subscribers.size === 1) {
        const reduced = matchMedia("(prefers-reduced-motion: reduce)");
        const coarse = matchMedia("(pointer: coarse)");
        const browser = navigator as SignalsNavigator;
        const visibility = () => {document.documentElement.dataset.motionHidden = String(document.hidden);};
        visibility();
        document.addEventListener("visibilitychange", visibility);
        const update = () => {
            const capability = getMotionCapability({
                prefersReducedMotion: reduced.matches, pointerCoarse: coarse.matches,
                saveData: browser.connection?.saveData, effectiveType: browser.connection?.effectiveType,
                deviceMemory: browser.deviceMemory, hardwareConcurrency: browser.hardwareConcurrency,
            });
            if (!snapshot.isReady || snapshot.capability !== capability) {
                snapshot = {capability, isReady: true};
                subscribers.forEach(notify => notify());
            }
        };
        reduced.addEventListener("change", update);
        coarse.addEventListener("change", update);
        browser.connection?.addEventListener("change", update);
        cleanup = () => {
            reduced.removeEventListener("change", update);
            coarse.removeEventListener("change", update);
            browser.connection?.removeEventListener("change", update);
            document.removeEventListener("visibilitychange", visibility);
        };
        update();
    }
    return () => {subscribers.delete(listener); if (!subscribers.size) {cleanup?.(); cleanup = undefined; snapshot = initial;}};
}
/** One shared set of device/media listeners, regardless of section count. */
export function useMotionCapability() {
    return useSyncExternalStore(subscribe, () => snapshot, () => initial);
}
