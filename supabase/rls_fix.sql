-- RLS fixes to avoid recursive policies

begin;

-- Drop policies that rely on recursive helpers

drop policy if exists "Users can view own profile" on public.users;
drop policy if exists "Users can insert own profile" on public.users;
drop policy if exists "Users can update own profile" on public.users;

drop policy if exists "Public can view approved companies" on public.companies;
drop policy if exists "Company owner can insert" on public.companies;
drop policy if exists "Company owner can update" on public.companies;
drop policy if exists "Company owner can delete" on public.companies;

drop policy if exists "Company owner can manage photos" on public.company_photos;

drop policy if exists "Public can view open time slots" on public.time_slots;
drop policy if exists "Company owner can manage time slots" on public.time_slots;

-- Recreate non-recursive policies

create policy "Users can view own profile" on public.users
  for select using (id = auth.uid());

create policy "Users can insert own profile" on public.users
  for insert with check (id = auth.uid());

create policy "Users can update own profile" on public.users
  for update using (id = auth.uid())
  with check (id = auth.uid());

create policy "Public can view approved companies" on public.companies
  for select using (status = 'approved' or user_id = auth.uid());

create policy "Company owner can insert" on public.companies
  for insert with check (user_id = auth.uid());

create policy "Company owner can update" on public.companies
  for update using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "Company owner can delete" on public.companies
  for delete using (user_id = auth.uid());

create policy "Company owner can manage photos" on public.company_photos
  for all using (
    exists (
      select 1 from public.companies c
      where c.id = company_id
        and c.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.companies c
      where c.id = company_id
        and c.user_id = auth.uid()
    )
  );

create policy "Public can view open time slots" on public.time_slots
  for select using (
    status = 'open'
    or exists (
      select 1 from public.companies c
      where c.id = company_id
        and c.user_id = auth.uid()
    )
  );

create policy "Company owner can manage time slots" on public.time_slots
  for all using (
    exists (
      select 1 from public.companies c
      where c.id = company_id
        and c.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.companies c
      where c.id = company_id
        and c.user_id = auth.uid()
    )
  );

commit;
