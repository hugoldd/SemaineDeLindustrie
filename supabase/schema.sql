-- Supabase schema for Semaine de l'Industrie Platform

begin;

create extension if not exists "pgcrypto";
create extension if not exists "postgis";

do $$ begin
  create type public.user_role as enum ('visitor', 'company', 'admin');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.company_status as enum ('pending', 'approved', 'rejected');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.time_slot_status as enum ('open', 'full', 'cancelled', 'completed');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.booking_status as enum ('pending', 'confirmed', 'rejected', 'cancelled');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.booking_type as enum ('individual', 'group');
exception when duplicate_object then null;
end $$;

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  role public.user_role not null default 'visitor',
  full_name text,
  phone text,
  establishment text,
  grade_level text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.companies (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  name text not null,
  description text,
  address text,
  city text,
  postal_code text,
  latitude double precision,
  longitude double precision,
  logo_url text,
  banner_url text,
  siret text,
  max_capacity integer,
  themes text[] not null default '{}',
  safety_measures text,
  equipment_provided text,
  equipment_required text,
  pmr_accessible boolean not null default false,
  contact_name text,
  contact_email text,
  contact_phone text,
  status public.company_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.company_photos (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  photo_url text not null,
  order_index integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.time_slots (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  start_datetime timestamptz not null,
  end_datetime timestamptz not null,
  capacity integer not null,
  available_spots integer not null,
  visit_type text not null,
  description text,
  specific_instructions text,
  requires_manual_validation boolean not null default false,
  status public.time_slot_status not null default 'open',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint time_slots_capacity_check check (capacity >= 0),
  constraint time_slots_available_check check (available_spots >= 0 and available_spots <= capacity),
  constraint time_slots_time_check check (end_datetime > start_datetime)
);

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  time_slot_id uuid not null references public.time_slots(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  booking_type public.booking_type not null default 'individual',
  number_of_participants integer not null default 1,
  teacher_name text,
  special_needs text,
  status public.booking_status not null default 'pending',
  parental_authorization boolean not null default false,
  cancellation_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint bookings_participants_check check (number_of_participants > 0)
);

create table if not exists public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  company_id uuid not null references public.companies(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, company_id)
);

create table if not exists public.themes (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  slug text unique not null,
  icon text,
  color text,
  created_at timestamptz not null default now()
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references public.users(id),
  recipient_id uuid not null references public.users(id),
  booking_id uuid references public.bookings(id),
  subject text,
  content text not null,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  type text not null,
  title text not null,
  message text not null,
  link text,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists companies_status_idx on public.companies(status);
create index if not exists companies_city_idx on public.companies(city);
create index if not exists companies_themes_idx on public.companies using gin (themes);
create index if not exists time_slots_company_idx on public.time_slots(company_id);
create index if not exists time_slots_status_idx on public.time_slots(status);
create index if not exists bookings_time_slot_idx on public.bookings(time_slot_id);
create index if not exists bookings_user_idx on public.bookings(user_id);
create index if not exists favorites_user_idx on public.favorites(user_id);
create index if not exists favorites_company_idx on public.favorites(company_id);
create index if not exists messages_recipient_idx on public.messages(recipient_id);
create index if not exists notifications_user_idx on public.notifications(user_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$ begin
  create trigger users_set_updated_at
  before update on public.users
  for each row execute function public.set_updated_at();
exception when duplicate_object then null;
end $$;

do $$ begin
  create trigger companies_set_updated_at
  before update on public.companies
  for each row execute function public.set_updated_at();
exception when duplicate_object then null;
end $$;

do $$ begin
  create trigger time_slots_set_updated_at
  before update on public.time_slots
  for each row execute function public.set_updated_at();
exception when duplicate_object then null;
end $$;

do $$ begin
  create trigger bookings_set_updated_at
  before update on public.bookings
  for each row execute function public.set_updated_at();
exception when duplicate_object then null;
end $$;

create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.users
    where id = auth.uid()
      and role = 'admin'
  );
$$;

create or replace function public.is_company_owner(company_uuid uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.companies c
    where c.id = company_uuid
      and c.user_id = auth.uid()
  );
$$;

alter table public.users enable row level security;
alter table public.companies enable row level security;
alter table public.company_photos enable row level security;
alter table public.time_slots enable row level security;
alter table public.bookings enable row level security;
alter table public.favorites enable row level security;
alter table public.themes enable row level security;
alter table public.messages enable row level security;
alter table public.notifications enable row level security;

create policy "Users can view own profile" on public.users
  for select using (id = auth.uid() or public.is_admin());

create policy "Users can insert own profile" on public.users
  for insert with check (id = auth.uid());

create policy "Users can update own profile" on public.users
  for update using (id = auth.uid() or public.is_admin())
  with check (id = auth.uid() or public.is_admin());

create policy "Public can view approved companies" on public.companies
  for select using (status = 'approved' or public.is_company_owner(id) or public.is_admin());

create policy "Company owner can insert" on public.companies
  for insert with check (user_id = auth.uid() or public.is_admin());

create policy "Company owner can update" on public.companies
  for update using (public.is_company_owner(id) or public.is_admin())
  with check (public.is_company_owner(id) or public.is_admin());

create policy "Company owner can delete" on public.companies
  for delete using (public.is_company_owner(id) or public.is_admin());

create policy "Company owner can manage photos" on public.company_photos
  for all using (public.is_company_owner(company_id) or public.is_admin())
  with check (public.is_company_owner(company_id) or public.is_admin());

create policy "Public can view open time slots" on public.time_slots
  for select using (status = 'open' or public.is_company_owner(company_id) or public.is_admin());

create policy "Company owner can manage time slots" on public.time_slots
  for all using (public.is_company_owner(company_id) or public.is_admin())
  with check (public.is_company_owner(company_id) or public.is_admin());

create policy "Users can view own bookings" on public.bookings
  for select using (
    user_id = auth.uid()
    or public.is_admin()
    or exists (
      select 1
      from public.time_slots ts
      join public.companies c on c.id = ts.company_id
      where ts.id = time_slot_id
        and c.user_id = auth.uid()
    )
  );

create policy "Users can create bookings" on public.bookings
  for insert with check (user_id = auth.uid() or public.is_admin());

create policy "Users or companies can update bookings" on public.bookings
  for update using (
    user_id = auth.uid()
    or public.is_admin()
    or exists (
      select 1
      from public.time_slots ts
      join public.companies c on c.id = ts.company_id
      where ts.id = time_slot_id
        and c.user_id = auth.uid()
    )
  )
  with check (
    user_id = auth.uid()
    or public.is_admin()
    or exists (
      select 1
      from public.time_slots ts
      join public.companies c on c.id = ts.company_id
      where ts.id = time_slot_id
        and c.user_id = auth.uid()
    )
  );

create policy "Users or companies can delete bookings" on public.bookings
  for delete using (
    user_id = auth.uid()
    or public.is_admin()
    or exists (
      select 1
      from public.time_slots ts
      join public.companies c on c.id = ts.company_id
      where ts.id = time_slot_id
        and c.user_id = auth.uid()
    )
  );

create policy "Users can manage favorites" on public.favorites
  for all using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "Public can view themes" on public.themes
  for select using (true);

create policy "Admins can manage themes" on public.themes
  for all using (public.is_admin())
  with check (public.is_admin());

create policy "Participants can view messages" on public.messages
  for select using (sender_id = auth.uid() or recipient_id = auth.uid());

create policy "Sender can create messages" on public.messages
  for insert with check (sender_id = auth.uid());

create policy "Participants can update messages" on public.messages
  for update using (sender_id = auth.uid() or recipient_id = auth.uid())
  with check (sender_id = auth.uid() or recipient_id = auth.uid());

create policy "Participants can delete messages" on public.messages
  for delete using (sender_id = auth.uid() or recipient_id = auth.uid());

create policy "Users can manage notifications" on public.notifications
  for all using (user_id = auth.uid() or public.is_admin())
  with check (user_id = auth.uid() or public.is_admin());

commit;
