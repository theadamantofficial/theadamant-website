import type {ReactNode} from "react";
import {redirect} from "next/navigation";
import {AdminShell} from "@/components/admin/admin-shell";
import {getCrmPageActor} from "@/lib/crm/auth";

export const dynamic = "force-dynamic";

export default async function ProtectedAdminLayout({children}: {children: ReactNode}) {
    const actor = await getCrmPageActor();
    if (!actor) redirect("/admin/login");
    return <AdminShell actor={actor}>{children}</AdminShell>;
}
