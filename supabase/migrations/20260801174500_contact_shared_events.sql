-- Person-level shared event counts on overlaps + settings helper RPC

alter table public.event_overlaps
  add column if not exists match_details jsonb not null default '[]'::jsonb;

comment on column public.event_overlaps.match_details is
  'Top matched contacts for this event: [{full_name, name_key, shared_events}]';

create or replace function public.refresh_event_overlaps(
  p_user_id uuid,
  p_event_id uuid default null
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  upserted integer := 0;
begin
  if p_user_id is null then
    raise exception 'p_user_id required';
  end if;

  if p_event_id is not null then
    insert into public.event_overlaps (user_id, event_id, linkedin_match_count, match_preview, match_details, computed_at)
    values (p_user_id, p_event_id, 0, '{}', '[]'::jsonb, now())
    on conflict (user_id, event_id) do nothing;
  end if;

  with contact_totals as (
    select
      lc.full_name,
      lc.name_key,
      count(distinct eg.event_id)::integer as shared_events
    from public.linkedin_contacts lc
    inner join public.event_guests eg
      on eg.name_key = lc.name_key
    where lc.user_id = p_user_id
    group by lc.full_name, lc.name_key
  ),
  matches as (
    select
      eg.event_id,
      count(distinct lc.id)::integer as match_count,
      (array_agg(distinct lc.full_name order by lc.full_name))[1:5] as preview,
      coalesce(
        (
          select jsonb_agg(
            jsonb_build_object(
              'full_name', ct.full_name,
              'name_key', ct.name_key,
              'shared_events', ct.shared_events
            )
            order by ct.shared_events desc, ct.full_name
          )
          from (
            select distinct on (lc2.name_key)
              lc2.full_name,
              lc2.name_key,
              coalesce(tot.shared_events, 1) as shared_events
            from public.event_guests eg2
            inner join public.linkedin_contacts lc2
              on lc2.user_id = p_user_id
             and lc2.name_key = eg2.name_key
            left join contact_totals tot
              on tot.name_key = lc2.name_key
            where eg2.event_id = eg.event_id
            order by lc2.name_key, coalesce(tot.shared_events, 1) desc, lc2.full_name
          ) ct
        ),
        '[]'::jsonb
      ) as details
    from public.event_guests eg
    inner join public.linkedin_contacts lc
      on lc.user_id = p_user_id
     and lc.name_key = eg.name_key
    where p_event_id is null or eg.event_id = p_event_id
    group by eg.event_id
  ),
  written as (
    insert into public.event_overlaps (
      user_id, event_id, linkedin_match_count, match_preview, match_details, computed_at
    )
    select
      p_user_id,
      m.event_id,
      m.match_count,
      coalesce(m.preview, '{}'),
      coalesce(m.details, '[]'::jsonb),
      now()
    from matches m
    on conflict (user_id, event_id) do update
      set linkedin_match_count = excluded.linkedin_match_count,
          match_preview = excluded.match_preview,
          match_details = excluded.match_details,
          computed_at = excluded.computed_at
    returning 1
  )
  select count(*)::integer into upserted from written;

  if p_event_id is not null and upserted = 0 then
    update public.event_overlaps
    set linkedin_match_count = 0,
        match_preview = '{}',
        match_details = '[]'::jsonb,
        computed_at = now()
    where user_id = p_user_id
      and event_id = p_event_id;
  end if;

  if p_event_id is null then
    update public.event_overlaps eo
    set linkedin_match_count = 0,
        match_preview = '{}',
        match_details = '[]'::jsonb,
        computed_at = now()
    where eo.user_id = p_user_id
      and eo.linkedin_match_count > 0
      and not exists (
        select 1
        from public.event_guests eg
        inner join public.linkedin_contacts lc
          on lc.user_id = p_user_id
         and lc.name_key = eg.name_key
        where eg.event_id = eo.event_id
      );
  end if;

  return upserted;
end;
$$;

revoke all on function public.refresh_event_overlaps(uuid, uuid) from public;
grant execute on function public.refresh_event_overlaps(uuid, uuid) to authenticated, service_role;

-- Top contacts by how many synced events they appear on
create or replace function public.list_contact_shared_events(
  p_limit integer default 12
)
returns table (
  full_name text,
  name_key text,
  shared_events integer
)
language sql
stable
security invoker
set search_path = public
as $$
  select
    lc.full_name,
    lc.name_key,
    count(distinct eg.event_id)::integer as shared_events
  from public.linkedin_contacts lc
  inner join public.event_guests eg
    on eg.name_key = lc.name_key
  where lc.user_id = auth.uid()
  group by lc.full_name, lc.name_key
  having count(distinct eg.event_id) > 0
  order by shared_events desc, lc.full_name
  limit greatest(1, least(coalesce(p_limit, 12), 50));
$$;

revoke all on function public.list_contact_shared_events(integer) from public;
grant execute on function public.list_contact_shared_events(integer) to authenticated;
