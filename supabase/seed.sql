-- Seed data for Semaine de l'Industrie Platform (ASCII only)

begin;

-- Themes
insert into public.themes (id, name, slug, icon, color)
values
  ('11111111-1111-1111-1111-111111111111', 'Aeronautique', 'aerospace', 'plane', '#4A90E2'),
  ('22222222-2222-2222-2222-222222222222', 'Automobile', 'automotive', 'car', '#E94B3C'),
  ('33333333-3333-3333-3333-333333333333', 'Energie', 'energy', 'bolt', '#34A853'),
  ('44444444-4444-4444-4444-444444444444', 'Numerique', 'digital', 'cpu', '#9B59B6'),
  ('55555555-5555-5555-5555-555555555555', 'Pharmacie', 'pharma', 'flask', '#1ABC9C'),
  ('66666666-6666-6666-6666-666666666666', 'Agroalimentaire', 'agro', 'leaf', '#F39C12')
on conflict (id) do nothing;

-- Users (admin, visitors, companies)
insert into public.users (id, email, role, full_name, phone, establishment, grade_level)
values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'admin@semaine-industrie.local', 'admin', 'Admin User', null, null, null),
  ('b1111111-1111-1111-1111-111111111111', 'lucas.martin@example.com', 'visitor', 'Lucas Martin', '06 10 20 30 40', 'Lycee Gustave Eiffel', 'Premiere STI2D'),
  ('b2222222-2222-2222-2222-222222222222', 'sarah.dubois@example.com', 'visitor', 'Sarah Dubois', '06 11 22 33 44', 'Lycee Henri IV', 'Terminale S'),
  ('b3333333-3333-3333-3333-333333333333', 'emma.lefevre@example.com', 'visitor', 'Emma Lefevre', '06 12 23 34 45', 'Lycee Henri IV', 'Terminale S'),
  ('c1111111-1111-1111-1111-111111111111', 'marie.dubois@airbus.com', 'company', 'Marie Dubois', '05 61 93 33 33', null, null),
  ('c2222222-2222-2222-2222-222222222222', 'thomas.martin@renault.com', 'company', 'Thomas Martin', '01 76 84 00 00', null, null),
  ('c3333333-3333-3333-3333-333333333333', 'sophie.bernard@edf.fr', 'company', 'Sophie Bernard', '04 76 44 00 00', null, null),
  ('c4444444-4444-4444-4444-444444444444', 'laurent.petit@capgemini.com', 'company', 'Laurent Petit', '01 47 54 50 00', null, null),
  ('c5555555-5555-5555-5555-555555555555', 'jp.moreau@safran.com', 'company', 'Jean-Pierre Moreau', '01 60 59 80 00', null, null),
  ('c6666666-6666-6666-6666-666666666666', 'claire.rousseau@sanofi.com', 'company', 'Claire Rousseau', '04 72 60 00 00', null, null),
  ('c7777777-7777-7777-7777-777777777777', 'm.dupont@bosch.fr', 'company', 'Marie Dupont', '05 65 00 00 00', null, null)
on conflict (id) do nothing;

-- Companies
insert into public.companies (
  id, user_id, name, description, address, city, postal_code,
  latitude, longitude, logo_url, banner_url, siret, max_capacity,
  themes, safety_measures, equipment_provided, equipment_required,
  pmr_accessible, contact_name, contact_email, contact_phone, status
)
values
  (
    'd1111111-1111-1111-1111-111111111111',
    'c1111111-1111-1111-1111-111111111111',
    'Airbus Industries',
    'Global aerospace leader. Discover engineering, assembly lines, and innovation labs.',
    '2 Rond-Point Emile Dewoitine',
    'Toulouse',
    '31700',
    43.6047, 1.4442,
    'https://images.unsplash.com/photo-1615990890466-6bbab10e0d77?w=200&h=200&fit=crop',
    'https://images.unsplash.com/photo-1705614681506-45a2bcdd458d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    '987654321',
    80,
    array['aerospace'],
    'Helmet required; safety shoes; high-visibility vest',
    'Helmet; vest; hearing protection',
    'Closed shoes; long sleeves',
    true,
    'Marie Dubois',
    'marie.dubois@airbus.com',
    '05 61 93 33 33',
    'approved'
  ),
  (
    'd2222222-2222-2222-2222-222222222222',
    'c2222222-2222-2222-2222-222222222222',
    'Renault Technocentre',
    'Design and engineering center for next-generation vehicles.',
    '1 Avenue du Golf',
    'Guyancourt',
    '78280',
    48.7667, 2.0667,
    'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=200&h=200&fit=crop',
    'https://images.unsplash.com/photo-1567789884554-0b844b597180?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    '123456789',
    60,
    array['automotive'],
    'Safety shoes required',
    'Vest',
    'Closed shoes',
    true,
    'Thomas Martin',
    'thomas.martin@renault.com',
    '01 76 84 00 00',
    'approved'
  ),
  (
    'd3333333-3333-3333-3333-333333333333',
    'c3333333-3333-3333-3333-333333333333',
    'EDF Centrale Hydroelectrique',
    'Renewable energy production site with hydroelectric facilities.',
    'Route de la Vallee',
    'Grenoble',
    '38000',
    45.1885, 5.7245,
    'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=200&h=200&fit=crop',
    'https://images.unsplash.com/photo-1616077147157-bbed557e0907?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    '234567890',
    40,
    array['energy'],
    'Helmet required; safety shoes; hearing protection',
    'Helmet; hearing protection',
    'Safety shoes; warm clothes',
    false,
    'Sophie Bernard',
    'sophie.bernard@edf.fr',
    '04 76 44 00 00',
    'approved'
  ),
  (
    'd4444444-4444-4444-4444-444444444444',
    'c4444444-4444-4444-4444-444444444444',
    'Capgemini Engineering',
    'Digital engineering leader: AI, cybersecurity, and cloud innovation.',
    '11 Rue de Tilsitt',
    'Paris',
    '75017',
    48.8738, 2.2950,
    'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=200&h=200&fit=crop',
    'https://images.unsplash.com/photo-1573757056004-065ad36e2cf4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    '345678901',
    70,
    array['digital'],
    null,
    null,
    null,
    true,
    'Laurent Petit',
    'laurent.petit@capgemini.com',
    '01 47 54 50 00',
    'approved'
  ),
  (
    'd5555555-5555-5555-5555-555555555555',
    'c5555555-5555-5555-5555-555555555555',
    'Safran Aircraft Engines',
    'Aerospace engine manufacturer with high-tech production lines.',
    'Rond-Point Rene Ravaud',
    'Villaroche',
    '77550',
    48.6333, 2.6167,
    'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=200&h=200&fit=crop',
    'https://images.unsplash.com/photo-1705614681506-45a2bcdd458d?w=1080',
    '456789012',
    50,
    array['aerospace'],
    'Helmet required; safety shoes; protective glasses',
    'Helmet; glasses; earplugs',
    'Safety shoes',
    true,
    'Jean-Pierre Moreau',
    'jp.moreau@safran.com',
    '01 60 59 80 00',
    'approved'
  ),
  (
    'd6666666-6666-6666-6666-666666666666',
    'c6666666-6666-6666-6666-666666666666',
    'Sanofi Recherche',
    'Pharmaceutical R&D center focused on biotech and drug development.',
    '82 Avenue Raspail',
    'Lyon',
    '69007',
    45.7485, 4.8467,
    'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=200&h=200&fit=crop',
    'https://images.unsplash.com/photo-1582489851864-4b4bddaf6a1b?w=1080',
    '567890123',
    30,
    array['pharma'],
    'Lab coat required; gloves; hair cover',
    'Lab coat; gloves; hair cover',
    null,
    true,
    'Claire Rousseau',
    'claire.rousseau@sanofi.com',
    '04 72 60 00 00',
    'approved'
  ),
  (
    'd7777777-7777-7777-7777-777777777777',
    'c7777777-7777-7777-7777-777777777777',
    'Bosch France',
    'Industrial site focused on automotive systems and manufacturing.',
    'Route de Rodez',
    'Rodez',
    '12000',
    44.3510, 2.5750,
    'https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?w=200&h=200&fit=crop',
    'https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?w=1080',
    '678901234',
    40,
    array['automotive'],
    'Safety shoes required',
    'Vest',
    'Closed shoes',
    true,
    'Marie Dupont',
    'm.dupont@bosch.fr',
    '05 65 00 00 00',
    'pending'
  )
on conflict (id) do nothing;

-- Company photos
insert into public.company_photos (id, company_id, photo_url, order_index)
values
  ('e1111111-1111-1111-1111-111111111111', 'd1111111-1111-1111-1111-111111111111', 'https://images.unsplash.com/photo-1705614681506-45a2bcdd458d?w=800', 0),
  ('e1111111-1111-1111-1111-111111111112', 'd1111111-1111-1111-1111-111111111111', 'https://images.unsplash.com/photo-1615990860014-99e51245218c?w=800', 1),
  ('e1111111-1111-1111-1111-111111111113', 'd1111111-1111-1111-1111-111111111111', 'https://images.unsplash.com/photo-1573757056004-065ad36e2cf4?w=800', 2),

  ('e2222222-2222-2222-2222-222222222221', 'd2222222-2222-2222-2222-222222222222', 'https://images.unsplash.com/photo-1567789884554-0b844b597180?w=800', 0),
  ('e2222222-2222-2222-2222-222222222222', 'd2222222-2222-2222-2222-222222222222', 'https://images.unsplash.com/photo-1615990860014-99e51245218c?w=800', 1),

  ('e3333333-3333-3333-3333-333333333331', 'd3333333-3333-3333-3333-333333333333', 'https://images.unsplash.com/photo-1616077147157-bbed557e0907?w=800', 0),
  ('e3333333-3333-3333-3333-333333333332', 'd3333333-3333-3333-3333-333333333333', 'https://images.unsplash.com/photo-1615990860014-99e51245218c?w=800', 1),

  ('e4444444-4444-4444-4444-444444444441', 'd4444444-4444-4444-4444-444444444444', 'https://images.unsplash.com/photo-1573757056004-065ad36e2cf4?w=800', 0),
  ('e4444444-4444-4444-4444-444444444442', 'd4444444-4444-4444-4444-444444444444', 'https://images.unsplash.com/photo-1615990860014-99e51245218c?w=800', 1),

  ('e5555555-5555-5555-5555-555555555551', 'd5555555-5555-5555-5555-555555555555', 'https://images.unsplash.com/photo-1705614681506-45a2bcdd458d?w=800', 0),

  ('e6666666-6666-6666-6666-666666666661', 'd6666666-6666-6666-6666-666666666666', 'https://images.unsplash.com/photo-1582489851864-4b4bddaf6a1b?w=800', 0),

  ('e7777777-7777-7777-7777-777777777771', 'd7777777-7777-7777-7777-777777777777', 'https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?w=800', 0)
on conflict (id) do nothing;

-- Time slots
insert into public.time_slots (
  id, company_id, start_datetime, end_datetime, capacity, available_spots,
  visit_type, description, specific_instructions, requires_manual_validation, status
)
values
  ('f1111111-1111-1111-1111-111111111111', 'd1111111-1111-1111-1111-111111111111', '2026-03-20 09:00:00+00', '2026-03-20 11:00:00+00', 25, 7, 'Guided visit + workshop', null, null, false, 'open'),
  ('f1111111-1111-1111-1111-111111111112', 'd1111111-1111-1111-1111-111111111111', '2026-03-20 14:00:00+00', '2026-03-20 16:00:00+00', 25, 0, 'Guided visit + workshop', null, null, false, 'full'),
  ('f1111111-1111-1111-1111-111111111113', 'd1111111-1111-1111-1111-111111111111', '2026-03-22 10:00:00+00', '2026-03-22 11:30:00+00', 30, 18, 'Guided visit', null, null, false, 'open'),

  ('f2222222-2222-2222-2222-222222222221', 'd2222222-2222-2222-2222-222222222222', '2026-03-19 09:30:00+00', '2026-03-19 12:00:00+00', 20, 12, 'Full visit', null, null, false, 'open'),
  ('f2222222-2222-2222-2222-222222222222', 'd2222222-2222-2222-2222-222222222222', '2026-03-21 14:00:00+00', '2026-03-21 16:00:00+00', 20, 5, 'Guided visit', null, null, false, 'open'),

  ('f3333333-3333-3333-3333-333333333331', 'd3333333-3333-3333-3333-333333333333', '2026-03-18 10:00:00+00', '2026-03-18 13:00:00+00', 15, 0, 'Technical deep dive', null, null, false, 'full'),
  ('f3333333-3333-3333-3333-333333333332', 'd3333333-3333-3333-3333-333333333333', '2026-03-23 09:00:00+00', '2026-03-23 11:00:00+00', 15, 10, 'Discovery visit', null, null, false, 'open'),

  ('f4444444-4444-4444-4444-444444444441', 'd4444444-4444-4444-4444-444444444444', '2026-03-19 14:00:00+00', '2026-03-19 15:30:00+00', 30, 8, 'Conference + demo', null, null, false, 'open'),
  ('f4444444-4444-4444-4444-444444444442', 'd4444444-4444-4444-4444-444444444444', '2026-03-21 10:00:00+00', '2026-03-21 12:00:00+00', 25, 15, 'Hands-on workshop', null, null, false, 'open'),

  ('f5555555-5555-5555-5555-555555555551', 'd5555555-5555-5555-5555-555555555555', '2026-03-20 09:00:00+00', '2026-03-20 11:30:00+00', 20, 0, 'Full visit', null, null, false, 'full'),
  ('f5555555-5555-5555-5555-555555555552', 'd5555555-5555-5555-5555-555555555555', '2026-03-24 13:30:00+00', '2026-03-24 15:30:00+00', 20, 14, 'Guided visit', null, null, false, 'open'),

  ('f6666666-6666-6666-6666-666666666661', 'd6666666-6666-6666-6666-666666666666', '2026-03-22 10:00:00+00', '2026-03-22 12:00:00+00', 12, 4, 'Lab visit', null, null, false, 'open'),

  ('f7777777-7777-7777-7777-777777777771', 'd7777777-7777-7777-7777-777777777777', '2026-03-26 09:00:00+00', '2026-03-26 10:30:00+00', 18, 18, 'Discovery visit', null, null, true, 'open')
on conflict (id) do nothing;

-- Bookings (from mock reservations)
insert into public.bookings (
  id, time_slot_id, user_id, booking_type, number_of_participants, teacher_name,
  special_needs, status, parental_authorization, cancellation_reason
)
values
  ('a1111111-1111-1111-1111-111111111111', 'f1111111-1111-1111-1111-111111111111', 'b1111111-1111-1111-1111-111111111111', 'individual', 1, null, null, 'confirmed', false, null),
  ('a2222222-2222-2222-2222-222222222222', 'f4444444-4444-4444-4444-444444444441', 'b2222222-2222-2222-2222-222222222222', 'individual', 1, null, null, 'pending', false, null),
  ('a3333333-3333-3333-3333-333333333333', 'f2222222-2222-2222-2222-222222222221', 'b3333333-3333-3333-3333-333333333333', 'group', 25, 'Mme Lefevre', null, 'confirmed', false, null),
  ('a4444444-4444-4444-4444-444444444444', 'f3333333-3333-3333-3333-333333333331', 'b1111111-1111-1111-1111-111111111111', 'individual', 1, null, null, 'cancelled', false, 'Cancelled by user')
on conflict (id) do nothing;

-- Favorites
insert into public.favorites (id, user_id, company_id)
values
  ('b1111111-1111-1111-1111-111111111111', 'b1111111-1111-1111-1111-111111111111', 'd1111111-1111-1111-1111-111111111111'),
  ('b2222222-2222-2222-2222-222222222222', 'b1111111-1111-1111-1111-111111111111', 'd4444444-4444-4444-4444-444444444444'),
  ('b3333333-3333-3333-3333-333333333333', 'b2222222-2222-2222-2222-222222222222', 'd2222222-2222-2222-2222-222222222222')
on conflict (id) do nothing;

-- Messages
insert into public.messages (id, sender_id, recipient_id, booking_id, subject, content, read)
values
  (
    'c1111111-1111-1111-1111-111111111111',
    'b1111111-1111-1111-1111-111111111111',
    'c1111111-1111-1111-1111-111111111111',
    'a1111111-1111-1111-1111-111111111111',
    'Visit details',
    'Hello, can you confirm the meeting point for the visit?',
    false
  ),
  (
    'c2222222-2222-2222-2222-222222222222',
    'c1111111-1111-1111-1111-111111111111',
    'b1111111-1111-1111-1111-111111111111',
    'a1111111-1111-1111-1111-111111111111',
    'Re: Visit details',
    'Please arrive 10 minutes early at the main entrance.',
    true
  )
on conflict (id) do nothing;

-- Notifications
insert into public.notifications (id, user_id, type, title, message, link, read)
values
  (
    'd1111111-1111-1111-1111-111111111111',
    'b1111111-1111-1111-1111-111111111111',
    'booking_confirmed',
    'Booking confirmed',
    'Your booking for Airbus Industries has been confirmed.',
    '/bookings',
    false
  ),
  (
    'd2222222-2222-2222-2222-222222222222',
    'b2222222-2222-2222-2222-222222222222',
    'booking_pending',
    'Booking pending',
    'Your booking for Capgemini Engineering is pending validation.',
    '/bookings',
    false
  ),
  (
    'd3333333-3333-3333-3333-333333333333',
    'c7777777-7777-7777-7777-777777777777',
    'company_pending',
    'Company pending',
    'Your company profile is pending admin validation.',
    '/company-dashboard',
    false
  )
on conflict (id) do nothing;

commit;

