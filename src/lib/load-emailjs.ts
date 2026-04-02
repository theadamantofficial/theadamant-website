let emailJsModulePromise: Promise<typeof import("@emailjs/browser").default> | null = null;

export async function loadEmailJs() {
    emailJsModulePromise ??= import("@emailjs/browser").then((module) => module.default);
    return emailJsModulePromise;
}
