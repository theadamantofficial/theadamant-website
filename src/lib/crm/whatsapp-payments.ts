import {randomBytes} from "node:crypto";
import {CrmApiError} from "@/lib/crm/errors";
import {sendWhatsAppInteractive} from "@/lib/crm/whatsapp-cloud";

export type WhatsAppPaymentItem = {
    name: string;
    amount_paise: number;
    quantity: number;
};

export type WhatsAppPaymentDraft = {
    body: string;
    footer: string;
    items: WhatsAppPaymentItem[];
    subtotal_paise: number;
    tax_paise: number;
    discount_paise: number;
    total_paise: number;
    quick_pay: boolean;
    expires_in_minutes: number;
};

export type WhatsAppOrderStatus = "processing" | "completed" | "canceled";

export const DEFAULT_WHATSAPP_PAYMENT_CONFIGURATION = "Adamant.Technologies";

type DraftPayload = {
    body?: unknown;
    footer?: unknown;
    items?: unknown;
    tax?: unknown;
    discount?: unknown;
    quickPay?: unknown;
    expiresInMinutes?: unknown;
};

export function parseWhatsAppPaymentDraft(payload: DraftPayload): WhatsAppPaymentDraft {
    const body = requiredText(payload.body, "Write a payment message.", 1024);
    const footer = optionalText(payload.footer, 60);
    if (!Array.isArray(payload.items) || payload.items.length === 0) {
        throw new CrmApiError("Add at least one order item.");
    }
    if (payload.items.length > 10) throw new CrmApiError("A payment request can contain up to 10 items.");

    const items = payload.items.map((rawItem, index) => {
        if (!isRecord(rawItem)) throw new CrmApiError(`Order item ${index + 1} is invalid.`);
        const name = requiredText(rawItem.name, `Enter a name for order item ${index + 1}.`, 60);
        const amount_paise = rupeesToPaise(rawItem.amount, `Enter a valid amount for ${name}.`, false);
        const quantity = Number(rawItem.quantity);
        if (!Number.isInteger(quantity) || quantity < 1 || quantity > 999) {
            throw new CrmApiError(`Quantity for ${name} must be between 1 and 999.`);
        }
        return {name, amount_paise, quantity};
    });
    const subtotal_paise = items.reduce((total, item) => total + item.amount_paise * item.quantity, 0);
    if (!Number.isSafeInteger(subtotal_paise) || subtotal_paise <= 0) {
        throw new CrmApiError("The order subtotal is too large or invalid.");
    }
    const tax_paise = rupeesToPaise(payload.tax, "Enter a valid tax amount.", true);
    const discount_paise = rupeesToPaise(payload.discount, "Enter a valid discount amount.", true);
    const total_paise = subtotal_paise + tax_paise - discount_paise;
    if (!Number.isSafeInteger(total_paise) || total_paise <= 0) {
        throw new CrmApiError("The final payment amount must be greater than ₹0.");
    }

    const expires_in_minutes = Number(payload.expiresInMinutes ?? 1440);
    if (!Number.isInteger(expires_in_minutes) || expires_in_minutes < 5 || expires_in_minutes > 43_200) {
        throw new CrmApiError("Payment expiry must be between 5 minutes and 30 days.");
    }

    return {
        body,
        footer,
        items,
        subtotal_paise,
        tax_paise,
        discount_paise,
        total_paise,
        quick_pay: payload.quickPay === true,
        expires_in_minutes,
    };
}

export function createWhatsAppPaymentReference() {
    return `AD-${Date.now().toString(36).toUpperCase()}-${randomBytes(4).toString("hex").toUpperCase()}`;
}

export function buildWhatsAppOrderDetails(
    draft: WhatsAppPaymentDraft,
    referenceId: string,
    paymentConfiguration: string,
    now = new Date(),
) {
    if (!/^[A-Za-z0-9_.-]{1,35}$/.test(referenceId)) throw new CrmApiError("The payment reference is invalid.");
    if (!paymentConfiguration || paymentConfiguration.length > 60) {
        throw new CrmApiError("WhatsApp payment configuration is missing or invalid.", 503);
    }

    const order: Record<string, unknown> = {
        status: "pending",
        items: draft.items.map((item) => ({
            name: item.name,
            amount: amountObject(item.amount_paise),
            quantity: item.quantity,
        })),
        subtotal: amountObject(draft.subtotal_paise),
        tax: amountObject(draft.tax_paise),
        expiration: {
            timestamp: String(Math.floor(now.getTime() / 1000) + draft.expires_in_minutes * 60),
            description: "This payment request has expired. Contact Adamant Technologies for a new request.",
        },
    };
    if (draft.quick_pay) order.type = "quick_pay";
    if (draft.discount_paise > 0) {
        order.discount = {...amountObject(draft.discount_paise), description: "Discount"};
    }

    return {
        type: "order_details",
        body: {text: draft.body},
        ...(draft.footer ? {footer: {text: draft.footer}} : {}),
        action: {
            name: "review_and_pay",
            parameters: {
                reference_id: referenceId,
                type: "digital-goods",
                payment_type: "upi",
                payment_configuration: paymentConfiguration,
                currency: "INR",
                total_amount: amountObject(draft.total_paise),
                order,
            },
        },
    };
}

export function buildWhatsAppOrderStatus(referenceId: string, status: WhatsAppOrderStatus, description: string) {
    if (!/^[A-Za-z0-9_.-]{1,35}$/.test(referenceId)) throw new CrmApiError("The payment reference is invalid.");
    const note = requiredText(description, "Add an order-status note.", 120);
    return {
        type: "order_status",
        body: {text: note},
        action: {
            name: "review_order",
            parameters: {
                reference_id: referenceId,
                order: {status, description: note},
            },
        },
    };
}

export async function sendWhatsAppOrderDetails(to: string, draft: WhatsAppPaymentDraft, referenceId: string) {
    const paymentConfiguration = normalizeEnv(process.env.WHATSAPP_PAYMENT_CONFIGURATION) || DEFAULT_WHATSAPP_PAYMENT_CONFIGURATION;
    return sendWhatsAppInteractive(to, buildWhatsAppOrderDetails(draft, referenceId, paymentConfiguration));
}

export async function sendWhatsAppOrderStatus(to: string, referenceId: string, status: WhatsAppOrderStatus, description: string) {
    return sendWhatsAppInteractive(to, buildWhatsAppOrderStatus(referenceId, status, description));
}

export function formatWhatsAppPaymentAmount(paise: number) {
    return new Intl.NumberFormat("en-IN", {style: "currency", currency: "INR"}).format(paise / 100);
}

function amountObject(value: number) {
    return {value, offset: 100};
}

function rupeesToPaise(value: unknown, errorMessage: string, allowZero: boolean) {
    const normalized = String(value ?? "").trim() || "0";
    if (!/^\d+(?:\.\d{1,2})?$/.test(normalized)) throw new CrmApiError(errorMessage);
    const [rupees, decimals = ""] = normalized.split(".");
    const paise = Number(rupees) * 100 + Number(decimals.padEnd(2, "0"));
    if (!Number.isSafeInteger(paise) || paise < 0 || (!allowZero && paise === 0)) throw new CrmApiError(errorMessage);
    return paise;
}

function requiredText(value: unknown, errorMessage: string, maxLength: number) {
    const normalized = String(value ?? "").trim();
    if (!normalized) throw new CrmApiError(errorMessage);
    if (normalized.length > maxLength) throw new CrmApiError(`Text must be ${maxLength} characters or fewer.`);
    return normalized;
}

function optionalText(value: unknown, maxLength: number) {
    const normalized = String(value ?? "").trim();
    if (normalized.length > maxLength) throw new CrmApiError(`Text must be ${maxLength} characters or fewer.`);
    return normalized;
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function normalizeEnv(value?: string) {
    return value?.trim().replace(/^['"]|['"]$/g, "") || "";
}
