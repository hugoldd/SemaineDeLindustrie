-- Admin policies and helper for Supabase

begin;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.users
    where id = auth.uid()
      and role = 'admin'
  );
$$;

-- Users
drop policy if exists "Admins can view all users" on public.users;
create policy "Admins can view all users" on public.users
  for select using (public.is_admin());

-- Companies
drop policy if exists "Admins can manage companies" on public.companies;
create policy "Admins can manage companies" on public.companies
  for all using (public.is_admin())
  with check (public.is_admin());

-- Company photos
drop policy if exists "Admins can manage company photos" on public.company_photos;
create policy "Admins can manage company photos" on public.company_photos
  for all using (public.is_admin())
  with check (public.is_admin());

-- Time slots
drop policy if exists "Admins can manage time slots" on public.time_slots;
create policy "Admins can manage time slots" on public.time_slots
  for all using (public.is_admin())
  with check (public.is_admin());

-- Bookings
drop policy if exists "Admins can manage bookings" on public.bookings;
create policy "Admins can manage bookings" on public.bookings
  for all using (public.is_admin())
  with check (public.is_admin());

-- Themes
drop policy if exists "Admins can manage themes" on public.themes;
create policy "Admins can manage themes" on public.themes
  for all using (public.is_admin())
  with check (public.is_admin());

-- Notifications
drop policy if exists "Admins can manage notifications" on public.notifications;
create policy "Admins can manage notifications" on public.notifications
  for all using (public.is_admin())
  with check (public.is_admin());

commit;
