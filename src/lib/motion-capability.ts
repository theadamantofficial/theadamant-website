export type MotionCapability = "full" | "lite" | "reduced";

export interface MotionCapabilitySignals {
    prefersReducedMotion?: boolean;
    saveData?: boolean;
    effectiveType?: string;
    deviceMemory?: number;
    pointerCoarse?: boolean;
    hardwareConcurrency?: number;
}

const CONSTRAINED_CONNECTIONS = new Set(["slow-2g", "2g"]);

export function getMotionCapability({
    prefersReducedMotion = false,
    saveData = false,
    effectiveType,
    deviceMemory,
    pointerCoarse = false,
    hardwareConcurrency,
}: MotionCapabilitySignals): MotionCapability {
    if (prefersReducedMotion) {
        return "reduced";
    }

    const constrainedConnection = CONSTRAINED_CONNECTIONS.has(effectiveType ?? "");
    const constrainedMemory = typeof deviceMemory === "number" && deviceMemory <= 4;

    if (saveData || constrainedConnection || constrainedMemory || pointerCoarse || (hardwareConcurrency !== undefined && hardwareConcurrency <= 4)) {
        return "lite";
    }

    return "full";
}

export function getScrollStage(progress: number, itemCount: number) {
    if (itemCount <= 1) {
        return 0;
    }

    const normalizedProgress = Math.min(Math.max(progress, 0), 1);

    return Math.min(itemCount - 1, Math.floor(normalizedProgress * itemCount));
}
