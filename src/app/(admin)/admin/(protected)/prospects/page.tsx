import {redirect} from "next/navigation";
import {ProspectsScreen} from "@/features/crm/prospects/prospects-screen";
import {canViewProspectDatabase} from "@/features/crm/permissions";
import {getCrmPageActor} from "@/lib/crm/auth";

export const metadata = {title: "Lead Database"};
export const dynamic = "force-dynamic";

export default async function ProspectsPage() {
    const actor = await getCrmPageActor();
    if (!actor) redirect("/admin/login");
    if (!canViewProspectDatabase(actor)) redirect("/admin/dashboard");
    return <ProspectsScreen/>;
}
