import {describe, expect, it} from "vitest";
import {canGrantProspectAccess, canViewProspectDatabase} from "@/features/crm/permissions";
import type {CrmActor} from "@/features/crm/types";

function actor(role: CrmActor["role"], canAccessProspectDatabase = false): CrmActor {
    return {
        id: "00000000-0000-4000-8000-000000000001",
        email: "team@theadamant.com",
        fullName: "Team Member",
        role,
        avatarUrl: null,
        canAccessProspectDatabase,
    };
}

describe("prospect database permissions", () => {
    it("always includes super admins and admins", () => {
        expect(canViewProspectDatabase(actor("super_admin"))).toBe(true);
        expect(canViewProspectDatabase(actor("admin"))).toBe(true);
    });

    it("requires an explicit grant for employees", () => {
        expect(canViewProspectDatabase(actor("employee"))).toBe(false);
        expect(canViewProspectDatabase(actor("employee", true))).toBe(true);
    });

    it("allows both administrator roles to grant access", () => {
        expect(canGrantProspectAccess("super_admin")).toBe(true);
        expect(canGrantProspectAccess("admin")).toBe(true);
        expect(canGrantProspectAccess("employee")).toBe(false);
    });
});
