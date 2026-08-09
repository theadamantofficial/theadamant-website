export const PROFILE_SUMMARY_COLUMNS = "id,full_name,email,avatar_url";

export const LEAD_COLUMNS = [
    "id",
    "customer_name",
    "phone",
    "email",
    "company_name",
    "service_required",
    "lead_source",
    "status",
    "estimated_value",
    "assigned_to",
    "next_followup",
    "priority",
    "description",
    "external_reference",
    "created_by",
    "created_at",
    "updated_at",
].join(",");

export const LEAD_WITH_RELATIONS = `${LEAD_COLUMNS},assigned_profile:profiles!leads_assigned_to_fkey(${PROFILE_SUMMARY_COLUMNS}),created_profile:profiles!leads_created_by_fkey(${PROFILE_SUMMARY_COLUMNS})`;

export const TASK_WITH_RELATIONS = [
    "id",
    "lead_id",
    "title",
    "description",
    "assigned_to",
    "due_date",
    "status",
    "priority",
    "created_by",
    "completed_at",
    "created_at",
    "updated_at",
    `assigned_profile:profiles!tasks_assigned_to_fkey(${PROFILE_SUMMARY_COLUMNS})`,
    "lead:leads!tasks_lead_id_fkey(id,customer_name,company_name)",
].join(",");

export const ACTIVITY_WITH_RELATIONS = [
    "id",
    "lead_id",
    "user_id",
    "activity_type",
    "description",
    "metadata",
    "created_at",
    `actor:profiles!activities_user_id_fkey(${PROFILE_SUMMARY_COLUMNS})`,
    "lead:leads!activities_lead_id_fkey(id,customer_name,company_name)",
].join(",");
