-- Storage buckets and policies (run as postgres in Supabase SQL editor)

begin;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('company-logos', 'company-logos', true, 2097152, array['image/jpeg', 'image/png', 'image/webp']),
  ('company-banners', 'company-banners', true, 5242880, array['image/jpeg', 'image/png', 'image/webp']),
  ('company-photos', 'company-photos', true, 5242880, array['image/jpeg', 'image/png', 'image/webp']),
  ('documents', 'documents', false, 10485760, array['application/pdf'])
on conflict (id) do nothing;

create policy "Public read company logos" on storage.objects
  for select using (bucket_id = 'company-logos');

create policy "Public read company banners" on storage.objects
  for select using (bucket_id = 'company-banners');

create policy "Public read company photos" on storage.objects
  for select using (bucket_id = 'company-photos');

create policy "Authenticated upload company logos" on storage.objects
  for insert with check (bucket_id = 'company-logos' and auth.role() = 'authenticated');

create policy "Authenticated upload company banners" on storage.objects
  for insert with check (bucket_id = 'company-banners' and auth.role() = 'authenticated');

create policy "Authenticated upload company photos" on storage.objects
  for insert with check (bucket_id = 'company-photos' and auth.role() = 'authenticated');

create policy "Update own company logos" on storage.objects
  for update using (bucket_id = 'company-logos' and owner = auth.uid())
  with check (bucket_id = 'company-logos' and owner = auth.uid());

create policy "Update own company banners" on storage.objects
  for update using (bucket_id = 'company-banners' and owner = auth.uid())
  with check (bucket_id = 'company-banners' and owner = auth.uid());

create policy "Update own company photos" on storage.objects
  for update using (bucket_id = 'company-photos' and owner = auth.uid())
  with check (bucket_id = 'company-photos' and owner = auth.uid());

create policy "Delete own company logos" on storage.objects
  for delete using (bucket_id = 'company-logos' and owner = auth.uid());

create policy "Delete own company banners" on storage.objects
  for delete using (bucket_id = 'company-banners' and owner = auth.uid());

create policy "Delete own company photos" on storage.objects
  for delete using (bucket_id = 'company-photos' and owner = auth.uid());

create policy "Documents read own" on storage.objects
  for select using (bucket_id = 'documents' and owner = auth.uid());

create policy "Documents insert own" on storage.objects
  for insert with check (bucket_id = 'documents' and owner = auth.uid());

create policy "Documents update own" on storage.objects
  for update using (bucket_id = 'documents' and owner = auth.uid())
  with check (bucket_id = 'documents' and owner = auth.uid());

create policy "Documents delete own" on storage.objects
  for delete using (bucket_id = 'documents' and owner = auth.uid());

commit;
