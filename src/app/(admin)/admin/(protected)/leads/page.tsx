import {LeadsScreen} from "@/features/crm/leads/leads-screen";

export const metadata = {title: "Leads"};
export default async function LeadsPage({searchParams}: {searchParams: Promise<{search?: string}>}) { const params = await searchParams; return <LeadsScreen initialSearch={params.search || ""}/>; }
