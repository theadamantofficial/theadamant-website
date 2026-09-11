-- Internal development workspace. All mutations use permission-checked RPCs;
-- authenticated clients only have SELECT on the underlying tables.
begin;
alter table public.profiles drop constraint profiles_role_valid;
alter table public.profiles add constraint profiles_role_valid check
    (role in ('super_admin','admin','employee','cto','developer','qa','developer_qa'));

create table public.dev_projects (
    id uuid primary key default gen_random_uuid(),
    name text not null check (length(btrim(name)) between 1 and 160),
    description text not null default '' check (length(description) <= 12000),
    status text not null default 'backlog' check (status in ('backlog','planned','in_progress','review','qa','released','archived')),
    priority text not null default 'medium' check (priority in ('low','medium','high','urgent')),
    target_date date,
    repository_url text not null default '' check (repository_url = '' or repository_url ~ '^https://'),
    created_by uuid not null references public.profiles(id),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);
create table public.dev_project_members (
    project_id uuid not null references public.dev_projects(id) on delete cascade,
    user_id uuid not null references public.profiles(id),
    responsibility text not null check (responsibility in ('developer','qa','developer_qa')),
    primary key(project_id,user_id)
);
create table public.dev_qa_sheets (
    id uuid primary key default gen_random_uuid(),
    project_id uuid not null references public.dev_projects(id) on delete cascade,
    title text not null check (length(btrim(title)) between 1 and 160),
    environment text not null default '' check (length(environment) <= 2000),
    build text not null default '' check (length(build) <= 200),
    status text not null default 'draft' check (status in ('draft','testing','completed')),
    created_by uuid not null references public.profiles(id),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    unique(id,project_id)
);
create table public.dev_issues (
    id uuid primary key default gen_random_uuid(),
    number bigint generated always as identity unique,
    project_id uuid not null references public.dev_projects(id) on delete cascade,
    sheet_id uuid,
    kind text not null default 'bug' check (kind in ('bug','task','feature')),
    title text not null check (length(btrim(title)) between 1 and 200),
    actual_result text not null default '' check (length(actual_result) <= 12000),
    expected_result text not null default '' check (length(expected_result) <= 12000),
    steps text not null default '' check (length(steps) <= 12000),
    environment text not null default '' check (length(environment) <= 2000),
    severity text not null default 'minor' check (severity in ('blocker','critical','major','minor','cosmetic')),
    priority text not null default 'medium' check (priority in ('low','medium','high','urgent')),
    status text not null default 'triage' check (status in ('triage','todo','in_progress','review','retest','closed','reopened')),
    assigned_to uuid references public.profiles(id),
    actual_image text,
    expected_image text,
    resolution text not null default '' check (length(resolution) <= 12000),
    created_by uuid not null references public.profiles(id),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    foreign key(sheet_id,project_id) references public.dev_qa_sheets(id,project_id) on delete cascade,
    check (sheet_id is null or (length(btrim(actual_result)) > 0 and length(btrim(expected_result)) > 0)),
    check (sheet_id is null or (actual_image is not null and expected_image is not null)),
    check (actual_image is null or actual_image like project_id::text || '/%'),
    check (expected_image is null or expected_image like project_id::text || '/%')
);
create table public.dev_decisions (
    id uuid primary key default gen_random_uuid(),
    project_id uuid not null references public.dev_projects(id) on delete cascade,
    decision text not null check (length(btrim(decision)) between 1 and 12000),
    created_by uuid not null references public.profiles(id),
    created_at timestamptz not null default now()
);
create table public.dev_activity (
    id bigint generated always as identity primary key,
    project_id uuid not null references public.dev_projects(id) on delete cascade,
    actor_id uuid not null references public.profiles(id),
    description text not null,
    created_at timestamptz not null default now()
);
create index on public.dev_project_members(user_id);
create index on public.dev_qa_sheets(project_id,created_at);
create index on public.dev_issues(project_id,status);
create index on public.dev_issues(sheet_id);
create index on public.dev_decisions(project_id,created_at);
create index on public.dev_activity(project_id,created_at desc);

create function public.dev_can_manage() returns boolean language sql stable security definer set search_path = public as $$
    select coalesce(public.current_crm_role() in ('super_admin','cto'),false);
$$;
create function public.dev_can_access(p_project uuid) returns boolean language sql stable security definer set search_path = public as $$
    select public.dev_can_manage() or (
        public.current_crm_role() in ('developer','qa','developer_qa')
        and exists(select 1 from public.dev_project_members where project_id=p_project and user_id=auth.uid())
    );
$$;
create function public.dev_can_work(p_project uuid, capability text) returns boolean language sql stable security definer set search_path = public as $$
    select public.dev_can_manage() or (
        public.current_crm_role() in (capability,'developer_qa')
        and exists(select 1 from public.dev_project_members where project_id=p_project and user_id=auth.uid() and responsibility in (capability,'developer_qa'))
    );
$$;

alter table public.dev_projects enable row level security;
alter table public.dev_project_members enable row level security;
alter table public.dev_qa_sheets enable row level security;
alter table public.dev_issues enable row level security;
alter table public.dev_decisions enable row level security;
alter table public.dev_activity enable row level security;
create policy dev_projects_read on public.dev_projects for select to authenticated using(public.dev_can_access(id));
create policy dev_members_read on public.dev_project_members for select to authenticated using(public.dev_can_access(project_id));
create policy dev_sheets_read on public.dev_qa_sheets for select to authenticated using(public.dev_can_access(project_id));
create policy dev_issues_read on public.dev_issues for select to authenticated using(public.dev_can_access(project_id));
create policy dev_decisions_read on public.dev_decisions for select to authenticated using(public.dev_can_access(project_id));
create policy dev_activity_read on public.dev_activity for select to authenticated using(public.dev_can_access(project_id));
revoke all on public.dev_projects,public.dev_project_members,public.dev_qa_sheets,public.dev_issues,public.dev_decisions,public.dev_activity from anon,authenticated;
grant select on public.dev_projects,public.dev_project_members,public.dev_qa_sheets,public.dev_issues,public.dev_decisions,public.dev_activity to authenticated;

-- One atomic project save includes membership replacement; only leadership can
-- allocate work, change project stages, release, or archive a project.
create function public.dev_save_project(payload jsonb) returns uuid language plpgsql security definer set search_path = public as $$
declare
    pid uuid := coalesce(nullif(payload->>'id','')::uuid,gen_random_uuid());
    member jsonb;
    member_role text;
    previous public.dev_projects;
begin
    if not public.dev_can_manage() then raise exception 'Only CTO or super admin can manage projects' using errcode='42501'; end if;
    if payload ? 'id' then
        select * into previous from public.dev_projects where id=pid for update;
        if not found then raise exception 'Project not found' using errcode='P0002'; end if;
        if previous.updated_at is distinct from (payload->>'updated_at')::timestamptz then raise exception 'Project changed. Reload before saving.' using errcode='40001'; end if;
        update public.dev_projects set name=payload->>'name',description=coalesce(payload->>'description',''),
            status=payload->>'status',priority=payload->>'priority',target_date=nullif(payload->>'target_date','')::date,
            repository_url=coalesce(payload->>'repository_url',''),updated_at=clock_timestamp() where id=pid;
    else
        insert into public.dev_projects(id,name,description,status,priority,target_date,repository_url,created_by)
        values(pid,payload->>'name',coalesce(payload->>'description',''),payload->>'status',payload->>'priority',
            nullif(payload->>'target_date','')::date,coalesce(payload->>'repository_url',''),auth.uid());
    end if;
    if payload ? 'members' then
        if jsonb_typeof(payload->'members') <> 'array' then raise exception 'Invalid project members'; end if;
        delete from public.dev_project_members where project_id=pid;
        for member in select value from jsonb_array_elements(payload->'members') loop
            select role into member_role from public.profiles where id=(member->>'user_id')::uuid and active;
            if member_role is null or not (
                member_role in ('cto','super_admin') or member_role='developer_qa'
                or member_role=member->>'responsibility'
            ) then raise exception 'Project responsibility must match an active member role'; end if;
            insert into public.dev_project_members(project_id,user_id,responsibility)
            values(pid,(member->>'user_id')::uuid,member->>'responsibility');
        end loop;
        -- Removed/reassigned developers must not remain issue owners.
        update public.dev_issues i set assigned_to=null,updated_at=clock_timestamp()
        where i.project_id=pid and assigned_to is not null and not exists(
            select 1 from public.dev_project_members m where m.project_id=pid and m.user_id=i.assigned_to and m.responsibility in ('developer','developer_qa')
        );
    end if;
    insert into public.dev_activity(project_id,actor_id,description) values(pid,auth.uid(),'Project saved · ' || (payload->>'status'));
    return pid;
end;
$$;

create function public.dev_save_sheet(payload jsonb) returns uuid language plpgsql security definer set search_path = public as $$
declare
    pid uuid := (payload->>'project_id')::uuid;
    sid uuid := coalesce(nullif(payload->>'id','')::uuid,gen_random_uuid());
    previous public.dev_qa_sheets;
begin
    if not coalesce(public.dev_can_work(pid,'qa'),false) then raise exception 'QA assignment required' using errcode='42501'; end if;
    if payload ? 'id' then
        select * into previous from public.dev_qa_sheets where id=sid and project_id=pid for update;
        if not found then raise exception 'QA sheet not found' using errcode='P0002'; end if;
        if previous.updated_at is distinct from (payload->>'updated_at')::timestamptz then raise exception 'Sheet changed. Reload before saving.' using errcode='40001'; end if;
        update public.dev_qa_sheets set title=payload->>'title',environment=coalesce(payload->>'environment',''),
            build=coalesce(payload->>'build',''),status=payload->>'status',updated_at=clock_timestamp() where id=sid;
    else
        insert into public.dev_qa_sheets(id,project_id,title,environment,build,status,created_by)
        values(sid,pid,payload->>'title',coalesce(payload->>'environment',''),coalesce(payload->>'build',''),payload->>'status',auth.uid());
    end if;
    insert into public.dev_activity(project_id,actor_id,description) values(pid,auth.uid(),'QA sheet saved · ' || (payload->>'title'));
    return sid;
end;
$$;

create function public.dev_save_issue(payload jsonb) returns uuid language plpgsql security definer set search_path = public as $$
declare
    pid uuid := (payload->>'project_id')::uuid;
    iid uuid := coalesce(nullif(payload->>'id','')::uuid,gen_random_uuid());
    sid uuid := nullif(payload->>'sheet_id','')::uuid;
    owner_id uuid := nullif(payload->>'assigned_to','')::uuid;
    previous public.dev_issues;
    evidence text;
begin
    if not coalesce(public.dev_can_work(pid,case when sid is null then 'developer' else 'qa' end),false) then
        raise exception 'Project assignment does not allow editing this issue' using errcode='42501';
    end if;
    if owner_id is not null and not exists(
        select 1 from public.dev_project_members m join public.profiles p on p.id=m.user_id
        where m.project_id=pid and m.user_id=owner_id and m.responsibility in ('developer','developer_qa')
        and p.active and p.role in ('developer','developer_qa','cto','super_admin')
    ) then raise exception 'Choose an active developer assigned to this project'; end if;
    foreach evidence in array array[nullif(payload->>'actual_image',''),nullif(payload->>'expected_image','')] loop
        if evidence is not null and (split_part(evidence,'/',1) <> pid::text or not exists(
            select 1 from storage.objects where bucket_id='dev-qa-evidence' and name=evidence
        )) then raise exception 'Screenshot must be uploaded to this project'; end if;
    end loop;
    if payload ? 'id' then
        select * into previous from public.dev_issues where id=iid and project_id=pid for update;
        if not found then raise exception 'Issue not found' using errcode='P0002'; end if;
        if previous.sheet_id is distinct from sid then raise exception 'Cannot move issues between sheets'; end if;
        if previous.updated_at is distinct from (payload->>'updated_at')::timestamptz then raise exception 'Issue changed. Reload before saving.' using errcode='40001'; end if;
        update public.dev_issues set title=payload->>'title',kind=payload->>'kind',
            actual_result=coalesce(payload->>'actual_result',''),expected_result=coalesce(payload->>'expected_result',''),
            steps=coalesce(payload->>'steps',''),environment=coalesce(payload->>'environment',''),
            severity=payload->>'severity',priority=payload->>'priority',assigned_to=owner_id,
            actual_image=nullif(payload->>'actual_image',''),expected_image=nullif(payload->>'expected_image',''),
            updated_at=clock_timestamp() where id=iid;
    else
        insert into public.dev_issues(id,project_id,sheet_id,kind,title,actual_result,expected_result,steps,environment,severity,priority,assigned_to,actual_image,expected_image,created_by)
        values(iid,pid,sid,payload->>'kind',payload->>'title',coalesce(payload->>'actual_result',''),coalesce(payload->>'expected_result',''),
            coalesce(payload->>'steps',''),coalesce(payload->>'environment',''),payload->>'severity',payload->>'priority',owner_id,
            nullif(payload->>'actual_image',''),nullif(payload->>'expected_image',''),auth.uid());
    end if;
    insert into public.dev_activity(project_id,actor_id,description) values(pid,auth.uid(),'Issue saved · ' || (payload->>'title'));
    return iid;
end;
$$;

create function public.dev_update_issue_status(payload jsonb) returns uuid language plpgsql security definer set search_path = public as $$
declare
    issue public.dev_issues;
    next_status text := payload->>'status';
begin
    select * into issue from public.dev_issues where id=(payload->>'id')::uuid for update;
    if not found or not coalesce(public.dev_can_access(issue.project_id),false) then raise exception 'Issue unavailable' using errcode='42501'; end if;
    if issue.updated_at is distinct from (payload->>'updated_at')::timestamptz then raise exception 'Issue changed. Reload before saving.' using errcode='40001'; end if;
    if not public.dev_can_manage() then
        if next_status in ('closed','reopened','triage','todo') then
            if not public.dev_can_work(issue.project_id,'qa') then raise exception 'QA must verify or triage this issue' using errcode='42501'; end if;
        elsif not public.dev_can_work(issue.project_id,'developer') or issue.assigned_to is distinct from auth.uid() then
            raise exception 'Only the assigned developer can update implementation progress' using errcode='42501';
        end if;
    end if;
    update public.dev_issues set status=next_status,resolution=coalesce(payload->>'resolution',resolution),updated_at=clock_timestamp() where id=issue.id;
    insert into public.dev_activity(project_id,actor_id,description) values(issue.project_id,auth.uid(),'DEV-' || issue.number || ' · ' || issue.status || ' → ' || next_status);
    return issue.id;
end;
$$;

create function public.dev_add_decision(payload jsonb) returns uuid language plpgsql security definer set search_path = public as $$
declare did uuid;
begin
    if not public.dev_can_manage() then raise exception 'Only CTO or super admin can record decisions' using errcode='42501'; end if;
    insert into public.dev_decisions(project_id,decision,created_by) values((payload->>'project_id')::uuid,payload->>'decision',auth.uid()) returning id into did;
    insert into public.dev_activity(project_id,actor_id,description) values((payload->>'project_id')::uuid,auth.uid(),'Technical decision recorded');
    return did;
end;
$$;

-- Screenshots are private, project-scoped objects. No public bucket or URLs.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('dev-qa-evidence','dev-qa-evidence',false,8388608,array['image/png','image/jpeg','image/webp'])
on conflict(id) do update set public=false,file_size_limit=8388608,allowed_mime_types=excluded.allowed_mime_types;
create policy dev_evidence_read on storage.objects for select to authenticated using(
    bucket_id='dev-qa-evidence' and exists(select 1 from public.dev_projects p where p.id::text=split_part(name,'/',1) and public.dev_can_access(p.id))
);
create policy dev_evidence_insert on storage.objects for insert to authenticated with check(
    bucket_id='dev-qa-evidence' and split_part(name,'/',2)=auth.uid()::text
    and exists(select 1 from public.dev_projects p where p.id::text=split_part(name,'/',1) and public.dev_can_work(p.id,'qa'))
);
revoke all on function public.dev_can_manage(),public.dev_can_access(uuid),public.dev_can_work(uuid,text),
    public.dev_save_project(jsonb),public.dev_save_sheet(jsonb),public.dev_save_issue(jsonb),public.dev_update_issue_status(jsonb),public.dev_add_decision(jsonb) from public,anon;
grant execute on function public.dev_can_manage(),public.dev_can_access(uuid),public.dev_can_work(uuid,text),
    public.dev_save_project(jsonb),public.dev_save_sheet(jsonb),public.dev_save_issue(jsonb),public.dev_update_issue_status(jsonb),public.dev_add_decision(jsonb) to authenticated;
commit;
