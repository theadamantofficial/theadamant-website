insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
    'whatsapp-outbound-media',
    'whatsapp-outbound-media',
    false,
    10485760,
    array[
        'image/jpeg',
        'image/png',
        'application/pdf',
        'text/plain',
        'application/msword',
        'application/vnd.ms-excel',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    ]
)
on conflict (id) do update
set file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists whatsapp_outbound_media_storage_read on storage.objects;
create policy whatsapp_outbound_media_storage_read
on storage.objects for select to authenticated
using (bucket_id = 'whatsapp-outbound-media' and public.current_crm_role() is not null);
