import {LeadDetailScreen} from "@/features/crm/leads/lead-detail-screen";

export const metadata = {title: "Lead details"};
export default async function LeadDetailsPage({params}: {params: Promise<{id: string}>}) { const {id} = await params; return <LeadDetailScreen leadId={id}/>; }
