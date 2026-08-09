do $$
declare
    owner_id uuid;
begin
    select id into owner_id
    from public.profiles
    where active = true
    order by case when role in ('super_admin', 'admin') then 0 else 1 end, created_at
    limit 1;

    if owner_id is null then
        raise notice 'CRM sample data skipped: create a Supabase Auth user first.';
        return;
    end if;

    insert into public.leads (
        id, customer_name, phone, email, company_name, service_required, lead_source,
        status, estimated_value, assigned_to, next_followup, priority, description, created_by, created_at
    ) values
        ('10000000-0000-4000-8000-000000000001', 'Rahul Sharma', '+91 98765 43010', 'rahul@northstar.in', 'Northstar Retail', 'Web Development', 'website', 'negotiation', 460000, owner_id, now() + interval '3 hours', 'high', 'Commerce website redesign with ERP integration.', owner_id, now() - interval '18 days'),
        ('10000000-0000-4000-8000-000000000002', 'Neha Gupta', '+91 98765 43011', 'neha@asterlabs.io', 'Aster Labs', 'Mobile App Development', 'linkedin', 'proposal_sent', 850000, owner_id, now() + interval '1 day 2 hours', 'high', 'Cross-platform field operations application.', owner_id, now() - interval '14 days'),
        ('10000000-0000-4000-8000-000000000003', 'Arjun Mehta', '+91 98765 43012', 'arjun@cobaltworks.in', 'Cobalt Works', 'Custom Software Development', 'referral', 'requirement_discussion', 1250000, owner_id, now() + interval '2 days', 'urgent', 'Internal workflow and reporting platform.', owner_id, now() - interval '11 days'),
        ('10000000-0000-4000-8000-000000000004', 'Priya Nair', '+91 98765 43013', 'priya@verdantfoods.com', 'Verdant Foods', 'Digital Marketing', 'instagram', 'contacted', 180000, owner_id, now() - interval '2 hours', 'medium', 'Quarterly performance marketing campaign.', owner_id, now() - interval '8 days'),
        ('10000000-0000-4000-8000-000000000005', 'Karan Malhotra', '+91 98765 43014', 'karan@orbitfin.co', 'Orbit Finance', 'UI/UX Design', 'email', 'meeting_scheduled', 320000, owner_id, now() + interval '5 hours', 'medium', 'Product design system and mobile UX audit.', owner_id, now() - interval '6 days'),
        ('10000000-0000-4000-8000-000000000006', 'Simran Kaur', '+91 98765 43015', 'simran@tuliphealth.in', 'Tulip Health', 'SEO', 'phone', 'new', 150000, owner_id, now() + interval '3 days', 'medium', 'Technical SEO and content growth plan.', owner_id, now() - interval '3 days'),
        ('10000000-0000-4000-8000-000000000007', 'Vikram Joshi', '+91 98765 43016', 'vikram@elevation.ai', 'Elevation AI', 'AI Solutions', 'linkedin', 'requirement_discussion', 0, owner_id, now() + interval '4 days', 'low', 'Discovery for a knowledge assistant prototype.', owner_id, now() - interval '2 days'),
        ('10000000-0000-4000-8000-000000000008', 'Aisha Khan', '+91 98765 43017', 'aisha@merakirooms.com', 'Meraki Rooms', 'Automation', 'website', 'new', 240000, owner_id, now() + interval '6 hours', 'high', 'Automate enquiry routing and booking follow-ups.', owner_id, now() - interval '20 hours'),
        ('10000000-0000-4000-8000-000000000009', 'Rohan Desai', '+91 98765 43018', 'rohan@fieldstone.co', 'Fieldstone', 'Web Development', 'whatsapp', 'won', 390000, owner_id, null, 'medium', 'Corporate website and careers portal.', owner_id, now() - interval '35 days'),
        ('10000000-0000-4000-8000-000000000010', 'Meera Iyer', '+91 98765 43019', 'meera@lumaevents.in', 'Luma Events', 'Digital Marketing', 'referral', 'lost', 210000, owner_id, null, 'low', 'Event season social media campaign.', owner_id, now() - interval '29 days'),
        ('10000000-0000-4000-8000-000000000011', 'Dev Patel', '+91 98765 43020', 'dev@gridline.tech', 'Gridline Technologies', 'Custom Software Development', 'other', 'proposal_sent', 720000, owner_id, now() + interval '5 days', 'high', 'Operations dashboard for distributed teams.', owner_id, now() - interval '9 days'),
        ('10000000-0000-4000-8000-000000000012', 'Ananya Bose', '+91 98765 43021', 'ananya@paperkite.studio', 'Paperkite Studio', 'Other', 'instagram', 'contacted', 95000, owner_id, now() + interval '1 day', 'low', 'Brand site consultation and maintenance.', owner_id, now() - interval '4 days')
    on conflict (id) do nothing;
end $$;
