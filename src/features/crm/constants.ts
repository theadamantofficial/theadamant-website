import type {CrmRole, LeadSource, LeadStatus, Priority, TaskStatus} from "@/features/crm/types";

export const LEAD_STATUSES: LeadStatus[] = [
    "new",
    "contacted",
    "meeting_scheduled",
    "requirement_discussion",
    "proposal_sent",
    "negotiation",
    "won",
    "lost",
];

export const LEAD_SOURCES: LeadSource[] = ["website", "whatsapp", "instagram", "linkedin", "referral", "email", "phone", "other"];
export const PRIORITIES: Priority[] = ["low", "medium", "high", "urgent"];
export const TASK_STATUSES: TaskStatus[] = ["open", "in_progress", "completed", "cancelled"];
export const CRM_ROLES: CrmRole[] = ["super_admin", "admin", "employee"];

export const ADAMANT_SERVICES = [
    "Web Development",
    "Mobile App Development",
    "Custom Software Development",
    "UI/UX Design",
    "SEO",
    "Digital Marketing",
    "Automation",
    "AI Solutions",
    "Other",
] as const;

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
    new: "New",
    contacted: "Contacted",
    meeting_scheduled: "Meeting",
    requirement_discussion: "Requirement",
    proposal_sent: "Proposal",
    negotiation: "Negotiation",
    won: "Won",
    lost: "Lost",
};

export const LEAD_SOURCE_LABELS: Record<LeadSource, string> = {
    website: "Website",
    whatsapp: "WhatsApp",
    instagram: "Instagram",
    linkedin: "LinkedIn",
    referral: "Referral",
    email: "Email",
    phone: "Phone",
    other: "Other",
};

export const ROLE_LABELS: Record<CrmRole, string> = {
    super_admin: "Super admin",
    admin: "Admin",
    employee: "Employee",
};
