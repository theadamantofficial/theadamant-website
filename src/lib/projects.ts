import {WORK_CATEGORIES, type ClientWorkProject, type WorkCategory} from "@/content/client-work";
import {CrmApiError} from "@/lib/crm/errors";

export const PROJECT_PUBLIC_FIELDS = "id,name,category,label,description,href,image,image_alt,highlights,theme";
export type AdminProject = ClientWorkProject & {status: "draft" | "published" | "hidden"; sort_order: number};
export type ProjectRecord = Omit<AdminProject, "imageAlt"> & {image_alt: string};

export function projectFromRecord(record: ProjectRecord): AdminProject {
    const {image_alt, ...project} = record;
    return {...project, imageAlt: image_alt};
}

export function parseProjectStatus(value: unknown) {
    if (typeof value !== "string" || !["draft", "published", "hidden"].includes(value)) throw new CrmApiError("Choose a valid project status.");
    return value as AdminProject["status"];
}

export function parseProject(payload: Record<string, unknown>) {
    const text = (key: string, min: number, max: number) => {
        const value = payload[key] ?? "";
        if (typeof value !== "string" || value.trim().length < min || value.trim().length > max) throw new CrmApiError(`${key} must be between ${min} and ${max} characters.`);
        return value.trim();
    };
    const name = text("name", 2, 100);
    const label = text("label", 2, 80);
    const description = text("description", 20, 1500);
    if (!WORK_CATEGORIES.includes(payload.category as WorkCategory)) throw new CrmApiError("Choose a valid project category.");
    if (payload.theme !== "teal" && payload.theme !== "clay") throw new CrmApiError("Choose a valid project theme.");
    const href = text("href", 0, 2000);
    const image = text("image", 0, 2000);
    const image_alt = text("imageAlt", 0, 200);
    const httpsUrl = (value: string) => {
        try { const url = new URL(value); return url.protocol === "https:" && !url.username && !url.password; } catch { return false; }
    };
    if (href && !httpsUrl(href)) throw new CrmApiError("Project link must be a valid HTTPS URL.");
    if (image && !httpsUrl(image) && !/^\/images\/[a-zA-Z0-9_./-]+$/.test(image)) throw new CrmApiError("Screenshot must be an HTTPS URL or a local image path.");
    if (image && !image_alt) throw new CrmApiError("Add a description for the screenshot.");
    if (!Array.isArray(payload.highlights) || payload.highlights.length > 8 || payload.highlights.some((item) => typeof item !== "string" || item.trim().length < 1 || item.trim().length > 60)) throw new CrmApiError("Add up to 8 project highlights of 1–60 characters each.");
    if (!Number.isInteger(payload.sort_order) || Number(payload.sort_order) < 0 || Number(payload.sort_order) > 9999) throw new CrmApiError("Display order must be a whole number from 0 to 9999.");
    return {
        name, category: payload.category as WorkCategory, label, description, href, image, image_alt,
        highlights: [...new Set((payload.highlights as string[]).map((item) => item.trim()))],
        theme: payload.theme, status: parseProjectStatus(payload.status), sort_order: Number(payload.sort_order),
    };
}
