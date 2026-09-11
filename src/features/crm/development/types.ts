import type {CrmRole, Priority} from "@/features/crm/types";

export const PROJECT_STAGES = ["backlog", "planned", "in_progress", "review", "qa", "released", "archived"] as const;
export const ISSUE_STATUSES = ["triage", "todo", "in_progress", "review", "retest", "closed", "reopened"] as const;
export const SEVERITIES = ["blocker", "critical", "major", "minor", "cosmetic"] as const;
export const STAGE_LABELS: Record<string, string> = {
    backlog: "Backlog", planned: "Planned", in_progress: "In progress", review: "In review", qa: "Quality assurance",
    released: "Released", archived: "Archived", triage: "Triage", todo: "To do", retest: "Ready for retest", closed: "Verified / closed", reopened: "Reopened",
};
export type DevMember = {id: string; full_name: string; email: string; role: CrmRole; active: boolean};
export type ProjectMember = {project_id?: string; user_id: string; responsibility: "developer" | "qa" | "developer_qa"};
export type DevProject = {
    id: string; name: string; description: string; status: typeof PROJECT_STAGES[number]; priority: Priority;
    target_date: string | null; repository_url: string; created_by: string; created_at: string; updated_at: string;
};
export type QaSheet = {
    id: string; project_id: string; title: string; environment: string; build: string; status: "draft" | "testing" | "completed";
    created_by: string; created_at: string; updated_at: string;
};
export type DevIssue = {
    id: string; number: number; project_id: string; sheet_id: string | null; kind: "bug" | "task" | "feature";
    title: string; actual_result: string; expected_result: string; steps: string; environment: string;
    severity: typeof SEVERITIES[number]; priority: Priority; status: typeof ISSUE_STATUSES[number];
    assigned_to: string | null; actual_image: string | null; expected_image: string | null; resolution: string;
    created_by: string; created_at: string; updated_at: string;
};
export type DevDecision = {id: string; project_id: string; decision: string; created_by: string; created_at: string};
export type DevActivity = {id: number; project_id: string; actor_id: string; description: string; created_at: string};
export type DevelopmentData = {
    projects: DevProject[]; members: DevMember[]; assignments: ProjectMember[];
    sheets: QaSheet[]; issues: DevIssue[]; decisions: DevDecision[]; activity: DevActivity[];
};
