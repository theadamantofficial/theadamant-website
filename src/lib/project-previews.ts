type ProjectPreviewSource = {name?: string; href?: string; image?: string; imageAlt?: string};

const CAPTURED_PREVIEWS: Record<string, {image: string; imageAlt: string}> = {
    "https://prep-vista-five.vercel.app": {
        image: "/images/work/prepvista.png", imageAlt: "PrepVista test preparation website homepage",
    },
    "https://aetherseo.com/en": {
        image: "/images/work/aetherseo.png", imageAlt: "AetherSEO search workflow platform homepage",
    },
    "https://aetherseo.com": {
        image: "/images/work/aetherseo.png", imageAlt: "AetherSEO search workflow platform homepage",
    },
    "https://bakery-shop-beta.vercel.app": {
        image: "/images/work/bakery-shop.png", imageAlt: "Maison Miette bakery homepage",
    },
};

export function getProjectPreview(project: ProjectPreviewSource) {
    const image = project.image?.trim() || "";
    if (image) return {image, imageAlt: project.imageAlt?.trim() || `${project.name || "Project"} website screenshot`};
    const unavailable = {image: "", imageAlt: project.imageAlt?.trim() || ""};
    try {
        const url = new URL(project.href || "");
        if (url.username || url.password) return unavailable;
        const key = url.origin + url.pathname.replace(/\/+$/, "");
        return CAPTURED_PREVIEWS[key] || unavailable;
    } catch {
        return unavailable;
    }
}
