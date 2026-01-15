create table if not exists public.datagouv_events (
  id bigserial primary key,
  age text,
  geo text,
  jour text,
  slug text,
  titre text,
  ville text,
  etat text,
  adresse text,
  timings text,
  latitude double precision,
  longitude double precision,
  date_range text,
  code_insee text,
  lieu_id integer,
  image_full text,
  last_timing text,
  next_timing text,
  code_postal text,
  nom_lieu text,
  first_timing text,
  departement text,
  organisateur text,
  image_credits text,
  registration text,
  image_base text,
  image_fichier text,
  accessibilite text,
  event_id integer,
  image_vignette text,
  publics_vises text,
  accessibilite_alt text,
  site_web_lieu text,
  online_access_link text,
  date_creation timestamptz,
  description_courte text,
  type_evenement text,
  telephone_lieu text,
  conditions_acces text,
  mode_participation text,
  derniere_mise_a_jour timestamptz,
  activites_industrielles text,
  participants_attendus integer,
  profil_organisateur text
);

alter table public.datagouv_events enable row level security;

create policy "Admins can read datagouv events"
on public.datagouv_events
for select
using (public.is_admin());

create or replace function public.get_datagouv_stats()
returns table (
  field text,
  distinct_count bigint,
  total_count bigint,
  format text
)
language sql
stable
as $$
  select 'age', count(distinct age), count(age), 'string' from public.datagouv_events
  union all select 'geo', count(distinct geo), count(geo), 'latlon_wgs' from public.datagouv_events
  union all select 'jour', count(distinct jour), count(jour), 'string' from public.datagouv_events
  union all select 'slug', count(distinct slug), count(slug), 'string' from public.datagouv_events
  union all select 'titre', count(distinct titre), count(titre), 'string' from public.datagouv_events
  union all select 'ville', count(distinct ville), count(ville), 'commune' from public.datagouv_events
  union all select 'etat', count(distinct etat), count(etat), 'string' from public.datagouv_events
  union all select 'adresse', count(distinct adresse), count(adresse), 'adresse' from public.datagouv_events
  union all select 'timings', count(distinct timings), count(timings), 'string' from public.datagouv_events
  union all select 'latitude', count(distinct latitude), count(latitude), 'latitude_wgs_fr_metropole' from public.datagouv_events
  union all select 'longitude', count(distinct longitude), count(longitude), 'longitude_wgs_fr_metropole' from public.datagouv_events
  union all select 'date_range', count(distinct date_range), count(date_range), 'string' from public.datagouv_events
  union all select 'code_insee', count(distinct code_insee), count(code_insee), 'code_commune_insee' from public.datagouv_events
  union all select 'lieu_id', count(distinct lieu_id), count(lieu_id), 'int' from public.datagouv_events
  union all select 'image_full', count(distinct image_full), count(image_full), 'url' from public.datagouv_events
  union all select 'last_timing', count(distinct last_timing), count(last_timing), 'string' from public.datagouv_events
  union all select 'next_timing', count(distinct next_timing), count(next_timing), 'string' from public.datagouv_events
  union all select 'code_postal', count(distinct code_postal), count(code_postal), 'code_postal' from public.datagouv_events
  union all select 'nom_lieu', count(distinct nom_lieu), count(nom_lieu), 'string' from public.datagouv_events
  union all select 'first_timing', count(distinct first_timing), count(first_timing), 'string' from public.datagouv_events
  union all select 'departement', count(distinct departement), count(departement), 'departement' from public.datagouv_events
  union all select 'organisateur', count(distinct organisateur), count(organisateur), 'string' from public.datagouv_events
  union all select 'image_credits', count(distinct image_credits), count(image_credits), 'string' from public.datagouv_events
  union all select 'registration', count(distinct registration), count(registration), 'string' from public.datagouv_events
  union all select 'image_base', count(distinct image_base), count(image_base), 'url' from public.datagouv_events
  union all select 'image_fichier', count(distinct image_fichier), count(image_fichier), 'url' from public.datagouv_events
  union all select 'accessibilite', count(distinct accessibilite), count(accessibilite), 'string' from public.datagouv_events
  union all select 'event_id', count(distinct event_id), count(event_id), 'int' from public.datagouv_events
  union all select 'image_vignette', count(distinct image_vignette), count(image_vignette), 'url' from public.datagouv_events
  union all select 'publics_vises', count(distinct publics_vises), count(publics_vises), 'string' from public.datagouv_events
  union all select 'accessibilite_alt', count(distinct accessibilite_alt), count(accessibilite_alt), 'string' from public.datagouv_events
  union all select 'site_web_lieu', count(distinct site_web_lieu), count(site_web_lieu), 'string' from public.datagouv_events
  union all select 'online_access_link', count(distinct online_access_link), count(online_access_link), 'url' from public.datagouv_events
  union all select 'date_creation', count(distinct date_creation), count(date_creation), 'datetime_aware' from public.datagouv_events
  union all select 'description_courte', count(distinct description_courte), count(description_courte), 'string' from public.datagouv_events
  union all select 'type_evenement', count(distinct type_evenement), count(type_evenement), 'string' from public.datagouv_events
  union all select 'telephone_lieu', count(distinct telephone_lieu), count(telephone_lieu), 'string' from public.datagouv_events
  union all select 'conditions_acces', count(distinct conditions_acces), count(conditions_acces), 'string' from public.datagouv_events
  union all select 'mode_participation', count(distinct mode_participation), count(mode_participation), 'string' from public.datagouv_events
  union all select 'derniere_mise_a_jour', count(distinct derniere_mise_a_jour), count(derniere_mise_a_jour), 'datetime_aware' from public.datagouv_events
  union all select 'activites_industrielles', count(distinct activites_industrielles), count(activites_industrielles), 'string' from public.datagouv_events
  union all select 'participants_attendus', count(distinct participants_attendus), count(participants_attendus), 'int' from public.datagouv_events
  union all select 'profil_organisateur', count(distinct profil_organisateur), count(profil_organisateur), 'string' from public.datagouv_events;
$$;
