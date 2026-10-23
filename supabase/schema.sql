-- Run once in the Supabase SQL editor (Dashboard > SQL Editor > New query).

create table if not exists public.gifts (
  id          text primary key,
  arrangement jsonb not null,
  created_at  timestamptz not null default now(),
  -- Guard the table even if someone calls the REST API directly.
  constraint gifts_id_shape check (id ~ '^[a-z0-9]{8,16}$'),
  constraint gifts_is_object check (jsonb_typeof(arrangement) = 'object'),
  constraint gifts_small check (pg_column_size(arrangement) < 8192)
);

alter table public.gifts enable row level security;

-- Anyone with the link can read a gift; anyone can create one. No updates or deletes.
drop policy if exists "gifts are readable" on public.gifts;
create policy "gifts are readable" on public.gifts for select using (true);

drop policy if exists "gifts can be created" on public.gifts;
create policy "gifts can be created" on public.gifts for insert with check (true);
