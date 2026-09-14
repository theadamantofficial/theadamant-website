import {reportClientCrash} from "@/lib/telemetry/client";

// Installed before hydration, including when the root layout fails to render.
window.addEventListener("error", (event) => {
    if (!event.message || event.message === "Script error.") return;
    reportClientCrash(event.error || new Error(event.message), "browser-error");
});
window.addEventListener("unhandledrejection", (event) => {
    reportClientCrash(event.reason, "unhandled-rejection");
});
