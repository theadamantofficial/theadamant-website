import {EditLeadScreen} from "@/features/crm/leads/edit-lead-screen";

export const metadata = {title: "Edit lead"};
export default async function EditLeadPage({params}: {params: Promise<{id: string}>}) { const {id} = await params; return <EditLeadScreen leadId={id}/>; }
