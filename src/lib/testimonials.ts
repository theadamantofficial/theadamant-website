import {CrmApiError} from "@/lib/crm/errors";

export const GOOGLE_REVIEW_URL = "https://share.google/cUXNVD6wqyw63jdM3";
export const TESTIMONIAL_PUBLIC_FIELDS = "id,name,company,rating,message,created_at";

export type Testimonial = {
    id: string;
    name: string;
    company: string;
    rating: number;
    message: string;
    created_at: string;
};

export type AdminTestimonial = Testimonial & {
    email: string;
    status: "pending" | "approved" | "hidden";
};

export function parseTestimonialStatus(value: unknown) {
    if (typeof value !== "string" || !["pending", "approved", "hidden"].includes(value)) throw new CrmApiError("Choose a valid testimonial status.");
    return value as AdminTestimonial["status"];
}

export function parseTestimonial(input: unknown) {
    if (!input || typeof input !== "object" || Array.isArray(input)) {
        throw new CrmApiError("Enter your testimonial details.");
    }
    const payload = input as Record<string, unknown>;
    if (payload.website) throw new CrmApiError("Unable to accept this submission.");
    const text = (key: string, min: number, max: number) => {
        const value = payload[key];
        if (typeof value !== "string" || value.trim().length < min || value.trim().length > max) {
            throw new CrmApiError(`${key === "message" ? "Testimonial" : key.charAt(0).toUpperCase() + key.slice(1)} must be between ${min} and ${max} characters.`);
        }
        return value.trim();
    };
    const name = text("name", 2, 80);
    const email = text("email", 3, 254).toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new CrmApiError("Enter a valid email address.");
    const company = payload.company === undefined ? "" : text("company", 0, 100);
    const message = text("message", 20, 1500);
    if (!Number.isInteger(payload.rating) || Number(payload.rating) < 1 || Number(payload.rating) > 5) {
        throw new CrmApiError("Choose a rating from 1 to 5 stars.");
    }
    if (payload.consent !== true) throw new CrmApiError("Please allow us to publish your testimonial.");
    return {name, email, company, rating: Number(payload.rating), message};
}
