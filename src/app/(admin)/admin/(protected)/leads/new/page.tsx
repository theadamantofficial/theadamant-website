import {NewLeadScreen} from "@/features/crm/leads/new-lead-screen";
import {redirect} from "next/navigation";
import {getCrmPageActor} from "@/lib/crm/auth";
import {canManageLeads} from "@/features/crm/permissions";

export const metadata = {title: "New lead"};
export default async function NewLeadPage() {
    const actor = await getCrmPageActor();
    if (!actor || !canManageLeads(actor.role)) redirect("/admin/leads");
    return <NewLeadScreen/>;
}
