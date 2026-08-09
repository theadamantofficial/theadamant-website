import {createHash} from "node:crypto";
import {createClient, type SupabaseClient} from "@supabase/supabase-js";
import type {LeadSource, Priority} from "@/features/crm/types";

type PublicLeadCapture = {
    externalReference: string;
    customerName: string;
    email?: string;
    phone?: string;
    companyName?: string;
    serviceRequired: string;
    leadSource?: LeadSource;
    priority?: Priority;
    description: string;
    originMetadata: Record<string, string | number | boolean | null>;
};

export type PublicLeadCaptureResult = {
    captured: boolean;
    configured: boolean;
    deduplicated?: boolean;
    leadId?: string;
};

let cachedClient: SupabaseClient | null = null;
let cachedCredentials = "";

export async function capturePublicCrmLead(input: PublicLeadCapture): Promise<PublicLeadCaptureResult> {
    const client = getPublicLeadClient();
    if (!client) return {captured: false, configured: false};

    const externalReference = truncate(input.externalReference, 240);
    const row = {
        customer_name: requiredText(input.customerName, "Website visitor"),
        phone: nullableText(input.phone, 100),
        email: nullableText(input.email?.toLowerCase(), 300),
        company_name: nullableText(input.companyName, 300),
        service_required: requiredText(input.serviceRequired, "Other"),
        lead_source: input.leadSource || "website",
        status: "new",
        estimated_value: 0,
        assigned_to: null,
        next_followup: null,
        priority: input.priority || "medium",
        description: truncate(input.description.trim(), 10000),
        external_reference: externalReference,
        origin_metadata: input.originMetadata,
        created_by: null,
    };

    const {data, error} = await client.from("leads").insert(row).select("id").single();
    if (!error && data?.id) return {captured: true, configured: true, leadId: String(data.id)};

    if (error?.code === "23505") {
        const existing = await client.from("leads").select("id").eq("external_reference", externalReference).maybeSingle();
        if (!existing.error && existing.data?.id) {
            return {captured: true, configured: true, deduplicated: true, leadId: String(existing.data.id)};
        }
    }

    console.error("Public CRM lead capture failed.", {
        code: error?.code || "unknown",
        reference: externalReference,
    });
    return {captured: false, configured: true};
}

export function mapContactInquiryToService(inquiryType: string) {
    const services: Record<string, string> = {
        "website-development": "Web Development",
        "app-development": "Mobile App Development",
        "digital-marketing": "Digital Marketing",
    };
    return services[inquiryType.trim().toLowerCase()] || "Other";
}

export function buildWebsiteAuditExternalReference(email: string, websiteUrl: string, date = new Date()) {
    const hourBucket = date.toISOString().slice(0, 13);
    const digest = createHash("sha256")
        .update(`${email.trim().toLowerCase()}|${websiteUrl.trim().toLowerCase()}|${hourBucket}`)
        .digest("hex")
        .slice(0, 32);
    return `website_audit:${digest}`;
}

export function nameFromEmail(email: string) {
    const localPart = email.split("@")[0] || "Website visitor";
    const words = localPart.replace(/[._+-]+/g, " ").trim();
    return words ? words.replace(/\b\w/g, (character) => character.toUpperCase()) : "Website visitor";
}

function getPublicLeadClient() {
    const url = normalize(process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL);
    const secretKey = normalize(process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY);
    if (!url || !secretKey) return null;

    const credentials = `${url}:${secretKey}`;
    if (!cachedClient || cachedCredentials !== credentials) {
        cachedClient = createClient(url, secretKey, {
            auth: {autoRefreshToken: false, persistSession: false},
        });
        cachedCredentials = credentials;
    }
    return cachedClient;
}

function requiredText(value: string, fallback: string) {
    return truncate(value.trim() || fallback, 300);
}

function nullableText(value: string | undefined, limit: number) {
    const normalized = value?.trim() || "";
    return normalized ? truncate(normalized, limit) : null;
}

function truncate(value: string, limit: number) {
    return value.length > limit ? value.slice(0, limit) : value;
}

function normalize(value?: string) {
    return value?.trim().replace(/^['"]|['"]$/g, "") || "";
}
