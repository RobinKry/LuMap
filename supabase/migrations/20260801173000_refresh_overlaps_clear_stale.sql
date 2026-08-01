-- Clear stale LinkedIn overlaps on full refresh; keep scoped-event behavior.
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

  -- Ensure a row exists for scoped event even with zero matches
  if p_event_id is not null then
    insert into public.event_overlaps (user_id, event_id, linkedin_match_count, match_preview, computed_at)
    values (p_user_id, p_event_id, 0, '{}', now())
    on conflict (user_id, event_id) do nothing;
  end if;

  with matches as (
    select
      eg.event_id,
      count(distinct lc.id)::integer as match_count,
      (array_agg(distinct lc.full_name order by lc.full_name))[1:5] as preview
    from public.event_guests eg
    inner join public.linkedin_contacts lc
      on lc.user_id = p_user_id
     and lc.name_key = eg.name_key
    where p_event_id is null or eg.event_id = p_event_id
    group by eg.event_id
  ),
  written as (
    insert into public.event_overlaps (user_id, event_id, linkedin_match_count, match_preview, computed_at)
    select p_user_id, m.event_id, m.match_count, coalesce(m.preview, '{}'), now()
    from matches m
    on conflict (user_id, event_id) do update
      set linkedin_match_count = excluded.linkedin_match_count,
          match_preview = excluded.match_preview,
          computed_at = excluded.computed_at
    returning 1
  )
  select count(*)::integer into upserted from written;

  -- Clear stale matches for scoped event with no current hits
  if p_event_id is not null and upserted = 0 then
    update public.event_overlaps
    set linkedin_match_count = 0,
        match_preview = '{}',
        computed_at = now()
    where user_id = p_user_id
      and event_id = p_event_id;
  end if;

  -- Full refresh: zero out events that no longer have name matches
  if p_event_id is null then
    update public.event_overlaps eo
    set linkedin_match_count = 0,
        match_preview = '{}',
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
