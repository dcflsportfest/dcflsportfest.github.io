create table if not exists public.site_state (
    key text primary key,
    owner_id uuid references auth.users(id) on delete cascade,
    payload jsonb not null default '{}'::jsonb,
    updated_at timestamptz not null default timezone('utc', now())
);

alter table public.site_state enable row level security;

drop policy if exists "Public read site state" on public.site_state;
create policy "Public read site state"
on public.site_state
for select
to anon, authenticated
using (key = 'main');

drop policy if exists "Owner insert site state" on public.site_state;
create policy "Owner insert site state"
on public.site_state
for insert
to authenticated
with check (
    key = 'main'
    and auth.uid() = owner_id
);

drop policy if exists "Owner update site state" on public.site_state;
create policy "Owner update site state"
on public.site_state
for update
to authenticated
using (
    key = 'main'
    and auth.uid() = owner_id
)
with check (
    key = 'main'
    and auth.uid() = owner_id
);
