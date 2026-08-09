export type CrmRole = "super_admin" | "admin" | "employee";
export type LeadStatus = "new" | "contacted" | "meeting_scheduled" | "requirement_discussion" | "proposal_sent" | "negotiation" | "won" | "lost";
export type LeadSource = "website" | "whatsapp" | "instagram" | "linkedin" | "referral" | "email" | "phone" | "other";
export type Priority = "low" | "medium" | "high" | "urgent";
export type TaskStatus = "open" | "in_progress" | "completed" | "cancelled";

export type Profile = {
    id: string;
    full_name: string;
    email: string;
    role: CrmRole;
    avatar_url: string | null;
    active: boolean;
    created_at: string;
    updated_at: string;
};

export type CrmActor = {
    id: string;
    email: string;
    fullName: string;
    role: CrmRole;
    avatarUrl: string | null;
};

export type Lead = {
    id: string;
    customer_name: string;
    phone: string | null;
    email: string | null;
    company_name: string | null;
    service_required: string;
    lead_source: LeadSource;
    status: LeadStatus;
    estimated_value: number;
    assigned_to: string | null;
    next_followup: string | null;
    priority: Priority;
    description: string;
    external_reference: string | null;
    created_by: string | null;
    created_at: string;
    updated_at: string;
    assigned_profile?: Pick<Profile, "id" | "full_name" | "email" | "avatar_url"> | null;
    created_profile?: Pick<Profile, "id" | "full_name" | "email" | "avatar_url"> | null;
};

export type LeadNote = {
    id: string;
    lead_id: string;
    created_by: string;
    note: string;
    created_at: string;
    updated_at: string;
    author?: Pick<Profile, "id" | "full_name" | "email" | "avatar_url"> | null;
};

export type CrmTask = {
    id: string;
    lead_id: string | null;
    title: string;
    description: string;
    assigned_to: string;
    due_date: string;
    status: TaskStatus;
    priority: Priority;
    created_by: string;
    completed_at: string | null;
    created_at: string;
    updated_at: string;
    assigned_profile?: Pick<Profile, "id" | "full_name" | "email" | "avatar_url"> | null;
    lead?: Pick<Lead, "id" | "customer_name" | "company_name"> | null;
};

export type Activity = {
    id: string;
    lead_id: string | null;
    user_id: string | null;
    activity_type: string;
    description: string;
    metadata: Record<string, unknown>;
    created_at: string;
    actor?: Pick<Profile, "id" | "full_name" | "email" | "avatar_url"> | null;
    lead?: Pick<Lead, "id" | "customer_name" | "company_name"> | null;
};

export type DashboardMetrics = {
    total_leads: number;
    new_leads: number;
    open_opportunities: number;
    pipeline_value: number;
    won_value: number;
    lost_value: number;
    meetings: number;
    proposals: number;
    followups_today: number;
    followups_due: number;
    conversion_rate: number;
    overdue_tasks: number;
};

export type PipelineSummary = {
    status: LeadStatus;
    lead_count: number;
    pipeline_value: number;
};

export type CustomerDirectoryItem = {
    customer_key: string;
    customer_name: string;
    phone: string | null;
    email: string | null;
    company_name: string | null;
    total_opportunities: number;
    won_value: number;
    last_interaction: string;
};
