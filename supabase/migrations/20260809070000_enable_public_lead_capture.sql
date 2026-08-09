-- Public website and future channel leads are created by trusted server-side
-- ingestion using the Supabase secret key, so they do not have a CRM user as
-- their creator. Human-created CRM records continue to store created_by.
alter table public.leads alter column created_by drop not null;

comment on column public.leads.created_by is 'CRM profile for human-created records; null for trusted website or channel ingestion.';
