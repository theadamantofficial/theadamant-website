-- Read CRM contact status for the current page of purchased leads.
-- RLS keeps conversation and message visibility aligned with the inbox.
create index if not exists whatsapp_messages_sent_contact_idx
on public.whatsapp_messages (conversation_id)
where direction = 'outbound'
  and message_type <> 'reaction'
  and whatsapp_message_id is not null
  and status in ('sent', 'delivered', 'read');

create or replace function public.prospect_whatsapp_contact_status(
    p_phone_number_id text,
    p_destinations text[]
)
returns table(destination text, conversation_id uuid, initial_message_sent boolean)
language plpgsql
stable
security invoker
set search_path = public
as $$
begin
    if not public.can_access_prospect_database() then
        raise exception 'Lead database access is required' using errcode = '42501';
    end if;
    if coalesce(cardinality(p_destinations), 0) > 100 then
        raise exception 'At most 100 destinations can be checked' using errcode = '22023';
    end if;
    return query
    select requested.wa_id, conversation.id,
        exists (
            select 1 from public.whatsapp_messages message
            where message.conversation_id = conversation.id
              and message.direction = 'outbound'
              and message.message_type <> 'reaction'
              and message.whatsapp_message_id is not null
              and message.status in ('sent', 'delivered', 'read')
        )
    from (select distinct unnest(p_destinations) as wa_id) requested
    left join public.whatsapp_conversations conversation
        on conversation.wa_id = requested.wa_id
        and conversation.phone_number_id = p_phone_number_id;
end;
$$;

revoke all on function public.prospect_whatsapp_contact_status(text, text[]) from public, anon;
grant execute on function public.prospect_whatsapp_contact_status(text, text[]) to authenticated;
