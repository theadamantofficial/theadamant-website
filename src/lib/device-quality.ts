export type DeviceQuality = "low" | "medium" | "high";

export function getDeviceQuality(): DeviceQuality {
    if (typeof navigator === "undefined") return "medium";
    const memory = (navigator as Navigator & {deviceMemory?: number}).deviceMemory ?? 8;
    const cores = navigator.hardwareConcurrency || 8;
    const coarse = typeof matchMedia === "function" && matchMedia("(pointer: coarse)").matches;
    if (memory <= 4 || cores <= 4 || coarse) return "low";
    if (memory <= 8 || cores <= 8) return "medium";
    return "high";
}

export function getMaxDpr(quality: DeviceQuality) {
    return quality === "high" ? 1.5 : quality === "medium" ? 1.25 : 1;
}
