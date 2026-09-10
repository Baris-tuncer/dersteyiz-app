-- ============================================================
-- 008: Add new categories for recently added subject groups
-- ============================================================

-- Fix sequence (IELTS/TOEFL were inserted manually with IDs 13-14)
SELECT setval('categories_id_seq', (SELECT MAX(id) FROM categories));

INSERT INTO public.categories (name, group_type, display_order) VALUES
  ('KPSS', 'academic', 15),
  ('DGS', 'academic', 16),
  ('YDS', 'academic', 17),
  ('Spor & Sağlık', 'special', 18),
  ('Sanat & Tasarım', 'special', 19),
  ('Teknoloji', 'special', 20),
  ('Kişisel Gelişim & Hobi', 'special', 21),
  ('Çocuk Gelişimi', 'special', 22);
