create table if not exists public.site_state (
    key text primary key,
    owner_id uuid references auth.users(id) on delete cascade,
    payload jsonb not null default '{}'::jsonb,
    updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.admin_users (
    email text primary key,
    created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.contact_submissions (
    id bigint generated always as identity primary key,
    name text not null,
    email text not null,
    topic text not null,
    message text not null,
    created_at timestamptz not null default timezone('utc', now())
);

alter table public.admin_users
    drop column if exists can_manage_admins;

drop function if exists public.can_manage_admins();

create or replace function public.normalized_auth_email()
returns text
language sql
stable
as $$
    select lower(coalesce(auth.jwt() ->> 'email', ''));
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
    select exists (
        select 1
        from public.admin_users
        where lower(email) = public.normalized_auth_email()
    );
$$;

alter table public.site_state enable row level security;
alter table public.admin_users enable row level security;
alter table public.contact_submissions enable row level security;

grant execute on function public.normalized_auth_email() to anon, authenticated;
grant execute on function public.is_admin() to anon, authenticated;

drop policy if exists "Public read site state" on public.site_state;
create policy "Public read site state"
on public.site_state
for select
to anon, authenticated
using (key = 'main');

drop policy if exists "Owner insert site state" on public.site_state;
drop policy if exists "Owner update site state" on public.site_state;
drop policy if exists "Admin insert site state" on public.site_state;
create policy "Admin insert site state"
on public.site_state
for insert
to authenticated
with check (
    key = 'main'
    and public.is_admin()
);

drop policy if exists "Admin update site state" on public.site_state;
create policy "Admin update site state"
on public.site_state
for update
to authenticated
using (
    key = 'main'
    and public.is_admin()
)
with check (
    key = 'main'
    and public.is_admin()
);

drop policy if exists "Admin read admin users" on public.admin_users;
create policy "Admin read admin users"
on public.admin_users
for select
to authenticated
using (public.is_admin());

drop policy if exists "Bootstrap or admin insert admin users" on public.admin_users;
drop policy if exists "Admin delete admin users" on public.admin_users;

drop policy if exists "Public insert contact submissions" on public.contact_submissions;
create policy "Public insert contact submissions"
on public.contact_submissions
for insert
to anon, authenticated
with check (
    length(trim(name)) > 1
    and position('@' in email) > 1
    and length(trim(topic)) > 1
    and length(trim(message)) > 5
);

drop policy if exists "Admin read contact submissions" on public.contact_submissions;
create policy "Admin read contact submissions"
on public.contact_submissions
for select
to authenticated
using (public.is_admin());
