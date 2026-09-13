-- Allow client proposal emails to share the existing prospect outreach audit.
alter table public.prospect_outreach_events
drop constraint if exists prospect_outreach_channel_valid;

alter table public.prospect_outreach_events
add constraint prospect_outreach_channel_valid check (channel in ('whatsapp', 'email'));
