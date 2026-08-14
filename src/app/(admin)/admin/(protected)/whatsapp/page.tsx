import {WhatsAppInboxScreen} from "@/features/crm/whatsapp/whatsapp-inbox-screen";

export const metadata = {title: "WhatsApp Inbox"};

export default async function WhatsAppPage({searchParams}: {searchParams: Promise<{leadId?: string}>}) {
    const {leadId} = await searchParams;
    return <WhatsAppInboxScreen initialLeadId={leadId || ""}/>;
}
