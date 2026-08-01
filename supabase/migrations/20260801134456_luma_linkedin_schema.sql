-- LuMap v1: events, guests, LinkedIn contacts, overlaps

create extension if not exists unaccent;

create or replace function public.normalize_name_key(raw text)
returns text
language sql
immutable
as $$
  select nullif(
    trim(both ' ' from lower(
      regexp_replace(
        coalesce(unaccent(coalesce(raw, '')), coalesce(raw, '')),
        '\s+',
        ' ',
        'g'
      )
    )),
    ''
  );
$$;

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  source_platform text not null check (source_platform in ('LUMA', 'PARTIFUL', 'LINKEDIN', 'EVENTBRITE')),
  mode text not null check (mode in ('WORK', 'PARTY')),
  title text not null,
  event_url text not null,
  slug text,
  luma_event_id text,
  venue_name text,
  latitude double precision,
  longitude double precision,
  is_residential boolean not null default false,
  guest_list_public boolean not null default false,
  attendee_count integer,
  start_time timestamptz,
  original_author_name text,
  original_author_headline text,
  cover_url text,
  host_name text,
  fetched_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (event_url)
);

create index if not exists events_mode_idx on public.events (mode);
create index if not exists events_start_time_idx on public.events (start_time);
create index if not exists events_luma_event_id_idx on public.events (luma_event_id);

create table if not exists public.event_guests (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events (id) on delete cascade,
  display_name text not null,
  name_key text not null,
  avatar_url text,
  source text not null default 'luma',
  created_at timestamptz not null default now(),
  unique (event_id, name_key, display_name)
);

create index if not exists event_guests_name_key_idx on public.event_guests (name_key);
create index if not exists event_guests_event_id_idx on public.event_guests (event_id);

create table if not exists public.linkedin_contacts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  first_name text,
  last_name text,
  full_name text not null,
  name_key text not null,
  position text,
  company text,
  profile_url text,
  email text,
  connected_on date,
  imported_at timestamptz not null default now(),
  unique (user_id, name_key)
);

create index if not exists linkedin_contacts_user_id_idx on public.linkedin_contacts (user_id);
create index if not exists linkedin_contacts_name_key_idx on public.linkedin_contacts (name_key);

create table if not exists public.event_overlaps (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  event_id uuid not null references public.events (id) on delete cascade,
  linkedin_match_count integer not null default 0,
  match_preview text[] not null default '{}',
  computed_at timestamptz not null default now(),
  unique (user_id, event_id)
);

create index if not exists event_overlaps_user_id_idx on public.event_overlaps (user_id);
create index if not exists event_overlaps_event_id_idx on public.event_overlaps (event_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists events_set_updated_at on public.events;
create trigger events_set_updated_at
before update on public.events
for each row execute function public.set_updated_at();

-- Refresh LinkedIn name overlaps for one user (all events or one event)
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

  return upserted;
end;
$$;

revoke all on function public.refresh_event_overlaps(uuid, uuid) from public;
grant execute on function public.refresh_event_overlaps(uuid, uuid) to authenticated, service_role;

alter table public.events enable row level security;
alter table public.event_guests enable row level security;
alter table public.linkedin_contacts enable row level security;
alter table public.event_overlaps enable row level security;

-- Events + guests: readable by authenticated users (public social graph signals)
drop policy if exists events_select_authenticated on public.events;
create policy events_select_authenticated
  on public.events for select
  to authenticated
  using (true);

drop policy if exists event_guests_select_authenticated on public.event_guests;
create policy event_guests_select_authenticated
  on public.event_guests for select
  to authenticated
  using (true);

-- Also allow anon read for map prototype without login (names already public on Luma)
drop policy if exists events_select_anon on public.events;
create policy events_select_anon
  on public.events for select
  to anon
  using (true);

drop policy if exists event_guests_select_anon on public.event_guests;
create policy event_guests_select_anon
  on public.event_guests for select
  to anon
  using (true);

-- LinkedIn contacts: owner only
drop policy if exists linkedin_contacts_select_own on public.linkedin_contacts;
create policy linkedin_contacts_select_own
  on public.linkedin_contacts for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists linkedin_contacts_insert_own on public.linkedin_contacts;
create policy linkedin_contacts_insert_own
  on public.linkedin_contacts for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists linkedin_contacts_update_own on public.linkedin_contacts;
create policy linkedin_contacts_update_own
  on public.linkedin_contacts for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists linkedin_contacts_delete_own on public.linkedin_contacts;
create policy linkedin_contacts_delete_own
  on public.linkedin_contacts for delete
  to authenticated
  using (auth.uid() = user_id);

-- Overlaps: owner only
drop policy if exists event_overlaps_select_own on public.event_overlaps;
create policy event_overlaps_select_own
  on public.event_overlaps for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists event_overlaps_insert_own on public.event_overlaps;
create policy event_overlaps_insert_own
  on public.event_overlaps for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists event_overlaps_update_own on public.event_overlaps;
create policy event_overlaps_update_own
  on public.event_overlaps for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists event_overlaps_delete_own on public.event_overlaps;
create policy event_overlaps_delete_own
  on public.event_overlaps for delete
  to authenticated
  using (auth.uid() = user_id);

-- Tracked Luma URLs per user (discovery v1)
create table if not exists public.user_tracked_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  event_id uuid not null references public.events (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, event_id)
);

alter table public.user_tracked_events enable row level security;

drop policy if exists user_tracked_events_all_own on public.user_tracked_events;
create policy user_tracked_events_all_own
  on public.user_tracked_events for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
