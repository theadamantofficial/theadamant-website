import {EditLeadScreen} from "@/features/crm/leads/edit-lead-screen";
import {redirect} from "next/navigation";
import {getCrmPageActor} from "@/lib/crm/auth";
import {canManageLeads} from "@/features/crm/permissions";

export const metadata = {title: "Edit lead"};
export default async function EditLeadPage({params}: {params: Promise<{id: string}>}) {
    const actor = await getCrmPageActor();
    const {id} = await params;
    if (!actor || !canManageLeads(actor.role)) redirect(`/admin/leads/${id}`);
    return <EditLeadScreen leadId={id}/>;
}
