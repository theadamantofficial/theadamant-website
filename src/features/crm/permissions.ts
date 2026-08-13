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
