import type {CrmRole} from "@/features/crm/types";

export function canManageTeam(role: CrmRole) {
    return role === "super_admin";
}

export function canManageLeads(role: CrmRole) {
    return role === "super_admin" || role === "admin";
}

export function isEmployee(role: CrmRole) {
    return role === "employee";
}
