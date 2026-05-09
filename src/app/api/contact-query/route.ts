import {NextRequest, NextResponse} from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DEFAULT_FIREBASE_DATABASE_URL = "https://adamant-3eada-default-rtdb.firebaseio.com";
const DEFAULT_FIREBASE_PROJECT_DETAILS_PATH = "projectDetails";
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const REFERENCE_ID_PATTERN = /^[A-Z0-9][A-Z0-9-]{7,63}$/;

type ContactQueryPayload = {
    referenceId?: string;
    orderId?: string;
    name?: string;
    email?: string;
    inquiryType?: string;
    message?: string;
    submittedAt?: string;
};

type ProjectDetailsRecord = {
    referenceId: string;
    orderId: string;
    name: string;
    email: string;
    inquiryType: string;
    message: string;
    submittedAt: string;
    createdAt: string;
    source: "website_contact_form";
    status: "new";
};

function getContactQueryWebhookUrl() {
    const rawUrl = process.env.CONTACT_QUERY_WEBHOOK_URL?.trim();

    if (!rawUrl) {
        return "";
    }

    return rawUrl.replace(/^['"]|['"]$/g, "");
}

function getFirebaseDatabaseUrl() {
    const rawUrl = (
        process.env.FIREBASE_DATABASE_URL ||
        process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL ||
        DEFAULT_FIREBASE_DATABASE_URL
    ).trim();

    return rawUrl.replace(/^['"]|['"]$/g, "").replace(/\/+$/g, "");
}

function getFirebaseProjectDetailsPath() {
    const rawPath = process.env.FIREBASE_PROJECT_DETAILS_PATH?.trim() || DEFAULT_FIREBASE_PROJECT_DETAILS_PATH;
    const normalizedPath = rawPath.replace(/^['"]|['"]$/g, "").replace(/^\/+|\/+$/g, "");

    return normalizedPath || DEFAULT_FIREBASE_PROJECT_DETAILS_PATH;
}

export async function POST(request: NextRequest) {
    const webhookUrl = getContactQueryWebhookUrl();
    const firebaseDatabaseUrl = getFirebaseDatabaseUrl();

    if (!webhookUrl && !firebaseDatabaseUrl) {
        return NextResponse.json({success: false, error: "Project details backend not configured."}, {status: 503});
    }

    let payload: ContactQueryPayload;

    try {
        payload = await request.json();
    } catch {
        return NextResponse.json({success: false, error: "Invalid query payload."}, {status: 400});
    }

    const name = payload.name?.trim() || "";
    const email = payload.email?.trim() || "";
    const inquiryType = payload.inquiryType?.trim() || "";
    const message = payload.message?.trim() || "";
    const submittedAt = normalizeSubmittedAt(payload.submittedAt);
    const referenceId = normalizeReferenceId(payload.referenceId) || createReferenceId(submittedAt);
    const orderId = normalizeReferenceId(payload.orderId) || referenceId;

    if (!name || !email || !inquiryType || !message) {
        return NextResponse.json({success: false, error: "Missing required fields."}, {status: 400});
    }

    if (!EMAIL_PATTERN.test(email)) {
        return NextResponse.json({success: false, error: "Enter a valid email address."}, {status: 400});
    }

    const projectDetails: ProjectDetailsRecord = {
        referenceId,
        orderId,
        name,
        email,
        inquiryType,
        message,
        submittedAt,
        createdAt: new Date().toISOString(),
        source: "website_contact_form",
        status: "new",
    };

    try {
        let firebaseSaved = false;
        let webhookDelivered = false;
        let webhookError: string | null = null;

        if (firebaseDatabaseUrl) {
            await saveProjectDetailsToFirebase(firebaseDatabaseUrl, projectDetails);
            firebaseSaved = true;
        }

        if (webhookUrl) {
            try {
                await notifyContactQueryWebhook(webhookUrl, projectDetails);
                webhookDelivered = true;
            } catch (error) {
                webhookError = getErrorMessage(error);

                if (!firebaseSaved) {
                    throw error;
                }

                console.error("Failed to notify contact query webhook.", error);
            }
        }

        return NextResponse.json({
            success: true,
            referenceId,
            firebaseSaved,
            webhookDelivered,
            webhookError,
        });
    } catch (error) {
        console.error("Failed to persist project details.", error);
        return NextResponse.json({success: false, error: "Project details delivery failed."}, {status: 502});
    }
}

async function saveProjectDetailsToFirebase(databaseUrl: string, projectDetails: ProjectDetailsRecord) {
    const path = encodeFirebasePath(getFirebaseProjectDetailsPath());
    const firebaseUrl = new URL(`${databaseUrl}/${path}/${encodeURIComponent(projectDetails.referenceId)}.json`);

    const response = await fetch(firebaseUrl, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(projectDetails),
    });

    if (!response.ok) {
        const responseText = await response.text().catch(() => "");
        throw new Error(`Firebase Realtime Database write failed with status ${response.status}: ${responseText.slice(0, 240)}`);
    }
}

async function notifyContactQueryWebhook(webhookUrl: string, projectDetails: ProjectDetailsRecord) {
    const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            content: [
                "**New website query received**",
                `Reference ID: ${projectDetails.referenceId}`,
                `Name: ${projectDetails.name}`,
                `Email: ${projectDetails.email}`,
                `Purpose: ${projectDetails.inquiryType}`,
                `Submitted: ${projectDetails.submittedAt}`,
                "",
                projectDetails.message,
            ].join("\n"),
        }),
    });

    if (!response.ok) {
        const responseText = await response.text().catch(() => "");
        throw new Error(`Webhook delivery failed with status ${response.status}: ${responseText.slice(0, 240)}`);
    }
}

function normalizeSubmittedAt(input?: string) {
    const parsedDate = input ? new Date(input.trim()) : new Date();

    if (Number.isNaN(parsedDate.getTime())) {
        return new Date().toISOString();
    }

    return parsedDate.toISOString();
}

function normalizeReferenceId(input?: string) {
    const normalized = input?.trim().toUpperCase() || "";

    if (!REFERENCE_ID_PATTERN.test(normalized)) {
        return "";
    }

    return normalized;
}

function createReferenceId(submittedAt: string) {
    const datePart = submittedAt.slice(0, 10).replaceAll("-", "");
    const randomPart = Math.random().toString(36).slice(2, 10).toUpperCase().padEnd(8, "0");

    return `ADM-${datePart}-${randomPart}`;
}

function encodeFirebasePath(path: string) {
    return path.split("/").filter(Boolean).map(encodeURIComponent).join("/");
}

function getErrorMessage(error: unknown) {
    return error instanceof Error ? error.message : String(error);
}
