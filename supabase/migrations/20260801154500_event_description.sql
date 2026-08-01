-- Luma description for feed cards
alter table public.events
  add column if not exists description text;
