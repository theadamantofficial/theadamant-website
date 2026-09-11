import {DashboardScreen} from "@/features/crm/dashboard/dashboard-screen";

export const metadata = {title: "Dashboard"};

import {getCrmPageActor} from "@/lib/crm/auth";
import {canAccessSales} from "@/features/crm/permissions";
import {redirect} from "next/navigation";

export default async function AdminDashboardPage() {
    const actor = await getCrmPageActor();
    if (actor && !canAccessSales(actor.role)) redirect("/admin/development");
    return <DashboardScreen/>;
}
