import {ADAMANT_SERVICES, LEAD_SOURCES, LEAD_STATUSES, PRIORITIES, TASK_STATUSES} from "@/features/crm/constants";
import type {LeadSource, LeadStatus, Priority, TaskStatus} from "@/features/crm/types";
import {CrmApiError} from "@/lib/crm/errors";

const ADAMANT_COMPANY_EMAIL = /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@theadamant\.com$/i;

export function parseCrmCompanyEmail(value: unknown) {
    const email = typeof value === "string" ? value.trim().toLowerCase() : "";
    if (!ADAMANT_COMPANY_EMAIL.test(email)) {
        throw new CrmApiError("Use your official @theadamant.com company email.");
    }
    return email;
}

export function parseCrmSignupInput(payload: Record<string, unknown>) {
    const fullName = typeof payload.fullName === "string" ? payload.fullName.trim() : "";
    const password = typeof payload.password === "string" ? payload.password : "";

    if (fullName.length < 2) throw new CrmApiError("Enter your full name.");
    if (fullName.length > 100) throw new CrmApiError("Name must be 100 characters or fewer.");
    if (password.length < 8) throw new CrmApiError("Use a password with at least 8 characters.");
    if (password.length > 128) throw new CrmApiError("Password must be 128 characters or fewer.");

    return {
        fullName,
        email: parseCrmCompanyEmail(payload.email),
        password,
    };
}

export function parseLeadInput(payload: Record<string, unknown>, partial = false) {
    const output: Record<string, unknown> = {};

    copyRequiredText(payload, output, "customer_name", "Customer name", partial);
    copyRequiredText(payload, output, "service_required", "Service required", partial);
    copyOptionalText(payload, output, "phone");
    copyOptionalText(payload, output, "email");
    copyOptionalText(payload, output, "company_name");
    copyOptionalText(payload, output, "description", false);

    if (typeof output.email === "string" && output.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(output.email)) {
        throw new CrmApiError("Enter a valid email address.");
    }

    if (Object.hasOwn(payload, "status")) output.status = enumValue(payload.status, LEAD_STATUSES, "lead status") as LeadStatus;
    else if (!partial) output.status = "new";
    if (Object.hasOwn(payload, "lead_source")) output.lead_source = enumValue(payload.lead_source, LEAD_SOURCES, "lead source") as LeadSource;
    else if (!partial) output.lead_source = "other";
    if (Object.hasOwn(payload, "priority")) output.priority = enumValue(payload.priority, PRIORITIES, "priority") as Priority;
    else if (!partial) output.priority = "medium";

    if (Object.hasOwn(payload, "assigned_to")) output.assigned_to = nullableUuid(payload.assigned_to, "assigned user");
    if (Object.hasOwn(payload, "next_followup")) output.next_followup = nullableDate(payload.next_followup, "follow-up date");

    if (Object.hasOwn(payload, "estimated_value")) {
        const value = Number(payload.estimated_value);
        if (!Number.isFinite(value) || value < 0) throw new CrmApiError("Deal value must be zero or greater.");
        output.estimated_value = value;
    } else if (!partial) {
        output.estimated_value = 0;
    }

    return output;
}

export function parseTaskInput(payload: Record<string, unknown>, partial = false) {
    const output: Record<string, unknown> = {};
    copyRequiredText(payload, output, "title", "Task title", partial);
    copyOptionalText(payload, output, "description", false);
    if (Object.hasOwn(payload, "lead_id")) output.lead_id = nullableUuid(payload.lead_id, "lead");
    if (Object.hasOwn(payload, "assigned_to")) output.assigned_to = nullableUuid(payload.assigned_to, "assigned user");
    else if (!partial) throw new CrmApiError("Choose an assigned user.");
    if (Object.hasOwn(payload, "due_date")) output.due_date = nullableDate(payload.due_date, "due date", false);
    else if (!partial) throw new CrmApiError("Choose a due date.");
    if (Object.hasOwn(payload, "status")) output.status = enumValue(payload.status, TASK_STATUSES, "task status") as TaskStatus;
    else if (!partial) output.status = "open";
    if (Object.hasOwn(payload, "priority")) output.priority = enumValue(payload.priority, PRIORITIES, "priority") as Priority;
    else if (!partial) output.priority = "medium";
    return output;
}

export function cleanSearch(value: string | null) {
    return (value || "").trim().replace(/[%_,()]/g, "").slice(0, 120);
}

export function parsePage(searchParams: URLSearchParams) {
    const page = Math.max(1, Number.parseInt(searchParams.get("page") || "1", 10) || 1);
    const pageSize = Math.min(100, Math.max(10, Number.parseInt(searchParams.get("pageSize") || "25", 10) || 25));
    return {page, pageSize, from: (page - 1) * pageSize, to: page * pageSize - 1};
}

export function isKnownService(value: unknown) {
    return typeof value === "string" && (ADAMANT_SERVICES as readonly string[]).includes(value);
}

function copyRequiredText(input: Record<string, unknown>, output: Record<string, unknown>, key: string, label: string, partial: boolean) {
    if (!Object.hasOwn(input, key)) {
        if (!partial) throw new CrmApiError(`${label} is required.`);
        return;
    }
    const value = typeof input[key] === "string" ? input[key].trim() : "";
    if (!value) throw new CrmApiError(`${label} is required.`);
    output[key] = value.slice(0, key === "description" ? 10000 : 300);
}

function copyOptionalText(input: Record<string, unknown>, output: Record<string, unknown>, key: string, nullable = true) {
    if (!Object.hasOwn(input, key)) return;
    const value = typeof input[key] === "string" ? input[key].trim() : "";
    output[key] = value ? value.slice(0, key === "description" ? 10000 : 300) : (nullable ? null : "");
}

function enumValue<T extends string>(value: unknown, values: readonly T[], label: string) {
    if (typeof value !== "string" || !values.includes(value as T)) throw new CrmApiError(`Choose a valid ${label}.`);
    return value as T;
}

function nullableUuid(value: unknown, label: string) {
    if (value === null || value === "") return null;
    if (typeof value !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)) {
        throw new CrmApiError(`Choose a valid ${label}.`);
    }
    return value;
}

function nullableDate(value: unknown, label: string, nullable = true) {
    if ((value === null || value === "") && nullable) return null;
    const date = typeof value === "string" ? new Date(value) : null;
    if (!date || Number.isNaN(date.getTime())) throw new CrmApiError(`Choose a valid ${label}.`);
    return date.toISOString();
}
