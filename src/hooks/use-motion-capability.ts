"use client";

import {useEffect, useMemo, useState} from "react";
import {useReducedMotion} from "motion/react";
import {
    getMotionCapability,
    MotionCapability,
    MotionCapabilitySignals,
} from "@/lib/motion-capability";

interface NavigatorWithMotionSignals extends Navigator {
    connection?: {
        effectiveType?: string;
        saveData?: boolean;
        addEventListener?: (type: "change", listener: () => void) => void;
        removeEventListener?: (type: "change", listener: () => void) => void;
    };
    deviceMemory?: number;
}

export function useMotionCapability(): {
    capability: MotionCapability;
    isReady: boolean;
} {
    const prefersReducedMotion = useReducedMotion();
    const [signals, setSignals] = useState<MotionCapabilitySignals>({});
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        const browserNavigator = navigator as NavigatorWithMotionSignals;

        const updateSignals = () => {
            setSignals({
                saveData: Boolean(browserNavigator.connection?.saveData),
                effectiveType: browserNavigator.connection?.effectiveType,
                deviceMemory: browserNavigator.deviceMemory,
            });
            setIsReady(true);
        };

        updateSignals();
        browserNavigator.connection?.addEventListener?.("change", updateSignals);

        return () => browserNavigator.connection?.removeEventListener?.("change", updateSignals);
    }, []);

    const capability = useMemo(() => getMotionCapability({
        ...signals,
        prefersReducedMotion: prefersReducedMotion === true,
    }), [prefersReducedMotion, signals]);

    return {capability, isReady};
}
