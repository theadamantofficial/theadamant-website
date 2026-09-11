import {CrmApiError} from "@/lib/crm/errors";
import {ISSUE_STATUSES, PROJECT_STAGES, SEVERITIES} from "@/features/crm/development/types";

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const priorities = ["low", "medium", "high", "urgent"];
export const DEVELOPMENT_ACTIONS = {
    project: "dev_save_project", sheet: "dev_save_sheet", issue: "dev_save_issue",
    status: "dev_update_issue_status", decision: "dev_add_decision",
} as const;
export function requireDevId(value: unknown) {
    if (typeof value !== "string" || !uuid.test(value)) throw new CrmApiError("Choose a valid record.");
    return value;
}
export function validateDevelopmentMutation(input: unknown) {
    if (!input || typeof input !== "object" || Array.isArray(input)) throw new CrmApiError("Invalid request.");
    const {action, payload} = input as {action: string; payload: Record<string, unknown>};
    if (!Object.hasOwn(DEVELOPMENT_ACTIONS, action) || !payload || typeof payload !== "object" || Array.isArray(payload)) throw new CrmApiError("Choose a valid development action.");
    const text = (key: string, max: number, required = false) => {
        const value = payload[key];
        if (value === undefined && !required) return;
        if (typeof value !== "string" || value.length > max || (required && !value.trim())) throw new CrmApiError(`Enter a valid ${key.replaceAll("_", " ")} (up to ${max} characters).`);
    };
    const choice = (key: string, options: readonly string[]) => {
        if (!options.includes(String(payload[key]))) throw new CrmApiError(`Choose a valid ${key}.`);
    };
    if (payload.id !== undefined) requireDevId(payload.id);
    if (action !== "project" && action !== "status") requireDevId(payload.project_id);
    if (payload.id && ["sheet", "issue", "status", "project"].includes(action)) {
        if (typeof payload.updated_at !== "string" || !Number.isFinite(Date.parse(payload.updated_at))) throw new CrmApiError("Reload this record before editing.");
    }
    if (action === "project") {
        text("name", 160, true); text("description", 12000); text("repository_url", 2000);
        choice("status", PROJECT_STAGES); choice("priority", priorities);
        if (payload.repository_url) {
            try { if (new URL(String(payload.repository_url)).protocol !== "https:") throw new Error(); }
            catch { throw new CrmApiError("Repository links must use HTTPS."); }
        }
        if (payload.target_date && (typeof payload.target_date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(payload.target_date) || !Number.isFinite(Date.parse(payload.target_date)))) throw new CrmApiError("Choose a valid target date.");
        if (payload.members !== undefined) {
            if (!Array.isArray(payload.members) || payload.members.length > 200) throw new CrmApiError("Choose up to 200 project members.");
            const seen = new Set<string>();
            for (const member of payload.members) {
                if (!member || typeof member !== "object") throw new CrmApiError("Choose a valid project member.");
                const id = requireDevId(member.user_id);
                if (seen.has(id) || !["developer", "qa", "developer_qa"].includes(member.responsibility)) throw new CrmApiError("Each member needs one valid project responsibility.");
                seen.add(id);
            }
        }
    } else if (action === "sheet") {
        text("title", 160, true); text("environment", 2000); text("build", 200);
        choice("status", ["draft", "testing", "completed"]);
    } else if (action === "issue") {
        if (payload.sheet_id) requireDevId(payload.sheet_id);
        if (payload.assigned_to) requireDevId(payload.assigned_to);
        text("title", 200, true); text("actual_result", 12000, Boolean(payload.sheet_id)); text("expected_result", 12000, Boolean(payload.sheet_id));
        text("steps", 12000); text("environment", 2000);
        choice("kind", ["bug", "task", "feature"]); choice("priority", priorities); choice("severity", SEVERITIES);
        for (const key of ["actual_image", "expected_image"]) {
            if (payload.sheet_id && !payload[key]) throw new CrmApiError("Add both actual and expected screenshots to the QA issue.");
            if (payload[key] && (typeof payload[key] !== "string" || payload[key].length > 500 || !payload[key].startsWith(`${payload.project_id}/`) || payload[key].includes(".."))) throw new CrmApiError("Choose a screenshot from this project.");
        }
    } else if (action === "status") {
        requireDevId(payload.id); choice("status", ISSUE_STATUSES); text("resolution", 12000);
    } else {
        text("decision", 12000, true);
    }
    return {rpc: DEVELOPMENT_ACTIONS[action as keyof typeof DEVELOPMENT_ACTIONS], payload};
}

export function evidenceExtension(bytes: Uint8Array, declaredType: string) {
    const png = [137,80,78,71,13,10,26,10].every((byte, index) => bytes[index] === byte);
    const jpg = bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255;
    const webp = new TextDecoder().decode(bytes.slice(0,4)) === "RIFF" && new TextDecoder().decode(bytes.slice(8,12)) === "WEBP";
    if (png && declaredType === "image/png") return "png";
    if (jpg && declaredType === "image/jpeg") return "jpg";
    if (webp && declaredType === "image/webp") return "webp";
    throw new CrmApiError("Upload a PNG, JPEG, or WebP image.");
}
