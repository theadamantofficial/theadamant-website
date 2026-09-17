-- Keep provider diagnostics in metadata instead of presenting them as customer text.
update public.whatsapp_messages
set
    body = 'This WhatsApp message type is not supported in the CRM yet.',
    metadata = coalesce(metadata, '{}'::jsonb) || jsonb_build_object(
        'provider_message_type', message_type,
        'provider_error', body
    )
where direction = 'inbound'
  and (
      message_type = 'unsupported'
      or lower(btrim(body)) in (
          '[unsupported message]',
          'message type currently not supported.',
          'this message type is not available through whatsapp cloud api.'
      )
  );

update public.whatsapp_conversations as conversation
set last_message_preview = 'This WhatsApp message type is not supported in the CRM yet.'
where conversation.last_message_preview is not null
  and lower(btrim(conversation.last_message_preview)) in (
      '[unsupported message]',
      'message type currently not supported.',
      'this message type is not available through whatsapp cloud api.'
  );
