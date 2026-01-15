create table if not exists public.admin_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.admin_settings enable row level security;

create policy "Admins can read admin settings"
on public.admin_settings
for select
using (public.is_admin());

create policy "Admins can write admin settings"
on public.admin_settings
for insert
with check (public.is_admin());

create policy "Admins can update admin settings"
on public.admin_settings
for update
using (public.is_admin());
