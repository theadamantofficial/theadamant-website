-- One-time cleanup requested for the WhatsApp inbox behavior change.
-- Conversations cascade to their messages and payment orders.
delete from public.whatsapp_conversations;

-- Remove only leads created automatically by the old WhatsApp webhook.
-- Leads created manually in the CRM are not included.
delete from public.leads
where created_by is null
  and lead_source = 'whatsapp'
  and external_reference like 'whatsapp:%'
  and origin_metadata ->> 'channel' = 'whatsapp'
  and description = 'Inbound WhatsApp conversation. Continue the conversation from the CRM WhatsApp inbox.';
