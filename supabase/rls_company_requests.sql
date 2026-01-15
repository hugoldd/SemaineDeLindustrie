-- Allow public company creation requests without auth.
create policy "Public can request company creation"
on public.companies
for insert
with check (status = 'pending' and user_id is null);
