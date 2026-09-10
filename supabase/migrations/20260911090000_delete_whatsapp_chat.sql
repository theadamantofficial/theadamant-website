-- Delete exactly the confirmed chat and its linked lead in one transaction.
create or replace function public.delete_whatsapp_chat(p_id uuid, p_expected_lead_id uuid)
returns void language plpgsql security definer set search_path = public as $$
declare linked_lead uuid;
begin
    select lead_id into linked_lead from public.whatsapp_conversations where id = p_id for update;
    if not found then raise exception 'Conversation no longer exists'; end if;
    if linked_lead is distinct from p_expected_lead_id then
        raise exception 'Linked lead changed. Refresh and confirm deletion again.';
    end if;
    delete from public.whatsapp_conversations where id = p_id;
    if linked_lead is not null then delete from public.leads where id = linked_lead; end if;
end;
$$;
revoke all on function public.delete_whatsapp_chat(uuid, uuid) from public, anon, authenticated;
grant execute on function public.delete_whatsapp_chat(uuid, uuid) to service_role;
