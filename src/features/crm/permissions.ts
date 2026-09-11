import type {CrmActor, CrmRole} from "@/features/crm/types";

export function canManageTeam(role: CrmRole) {
    return role === "super_admin";
}

export function canManageLeads(role: CrmRole) {
    return role === "super_admin" || role === "admin";
}

export function isEmployee(role: CrmRole) {
    return role === "employee";
}

export function canGrantProspectAccess(role: CrmRole) {
    return role === "super_admin" || role === "admin";
}

export function canViewProspectDatabase(actor: Pick<CrmActor, "role" | "canAccessProspectDatabase">) {
    return actor.role === "super_admin" || actor.role === "admin" || actor.canAccessProspectDatabase;
}

export function canAccessDevelopment(role: CrmRole) {
    return ["super_admin", "cto", "developer", "qa", "developer_qa"].includes(role);
}

export function canManageDevelopment(role: CrmRole) {
    return role === "super_admin" || role === "cto";
}

export function hasQaCapability(role: CrmRole) {
    return canManageDevelopment(role) || role === "qa" || role === "developer_qa";
}

export function hasDeveloperCapability(role: CrmRole) {
    return canManageDevelopment(role) || role === "developer" || role === "developer_qa";
}

export function canAccessSales(role: CrmRole) {
    return ["super_admin", "admin", "employee"].includes(role);
}
