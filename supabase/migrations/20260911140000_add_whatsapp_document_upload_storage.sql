insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('whatsapp-template-documents', 'whatsapp-template-documents', false, 10485760, array['application/pdf'])
on conflict (id) do update set file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists whatsapp_template_documents_storage_read on storage.objects;
create policy whatsapp_template_documents_storage_read
on storage.objects for select to authenticated
using (bucket_id = 'whatsapp-template-documents' and public.current_crm_role() is not null
);
