-- ============================================================
-- Dersteyiz - Veritabanı Şeması
-- Öğretmen-Öğrenci Pazar Yeri
-- ============================================================

-- ============================================================
-- 1. ENUM TYPES
-- ============================================================
create type public.user_role as enum ('teacher', 'parent');
create type public.teaching_mode as enum ('online', 'face_to_face');
create type public.category_group as enum ('academic', 'special');
create type public.diploma_status as enum ('pending', 'approved', 'rejected');
create type public.report_status as enum ('pending', 'reviewed', 'dismissed');

-- ============================================================
-- 2. PROFILES
-- ============================================================
create table public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  full_name     text not null default '',
  avatar_url    text,
  phone_number  text not null default '',
  role          public.user_role not null default 'parent',
  is_admin      boolean not null default false,
  email_verified boolean not null default false,
  created_at    timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Herkes profilleri görebilir"
  on public.profiles for select using (true);
create policy "Kullanıcı kendi profilini güncelleyebilir"
  on public.profiles for update using (auth.uid() = id);
create policy "Kullanıcı kendi profilini oluşturabilir"
  on public.profiles for insert with check (auth.uid() = id);

-- ============================================================
-- 3. TEACHERS
-- ============================================================
create table public.teachers (
  profile_id          uuid primary key references public.profiles(id) on delete cascade,
  bio                 text not null default '',
  major               text not null default '',
  phone_number        text not null default '',
  email               text not null default '',
  hourly_rate         int not null default 0,
  video_url           text,
  diploma_url         text,
  diploma_status      public.diploma_status not null default 'pending',
  subscription_status boolean not null default false,
  is_verified         boolean not null default false,
  view_count          int not null default 0,
  contact_count       int not null default 0,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

alter table public.teachers enable row level security;

create policy "Herkes aboneli öğretmenleri görebilir"
  on public.teachers for select using (subscription_status = true);
create policy "Öğretmen kendi kaydını görebilir"
  on public.teachers for select using (auth.uid() = profile_id);
create policy "Öğretmen kendi kaydını güncelleyebilir"
  on public.teachers for update using (auth.uid() = profile_id);
create policy "Öğretmen kendi kaydını oluşturabilir"
  on public.teachers for insert with check (auth.uid() = profile_id);
-- Admin tüm öğretmenleri görebilir
create policy "Admin tüm öğretmenleri görebilir"
  on public.teachers for select
  using (exists (select 1 from public.profiles where id = auth.uid() and is_admin = true));

-- ============================================================
-- 4. TEACHER MODES
-- ============================================================
create table public.teacher_modes (
  teacher_id uuid not null references public.teachers(profile_id) on delete cascade,
  mode       public.teaching_mode not null,
  primary key (teacher_id, mode)
);

alter table public.teacher_modes enable row level security;
create policy "Herkes öğretmen modlarını görebilir"
  on public.teacher_modes for select using (true);
create policy "Öğretmen kendi modlarını yönetebilir"
  on public.teacher_modes for all using (auth.uid() = teacher_id);

-- ============================================================
-- 5. TEACHER LOCATIONS
-- ============================================================
create table public.teacher_locations (
  id         serial primary key,
  teacher_id uuid not null references public.teachers(profile_id) on delete cascade,
  city       text not null,
  district   text not null default '',
  created_at timestamptz not null default now()
);

alter table public.teacher_locations enable row level security;
create policy "Herkes öğretmen lokasyonlarını görebilir"
  on public.teacher_locations for select using (true);
create policy "Öğretmen kendi lokasyonlarını yönetebilir"
  on public.teacher_locations for all using (auth.uid() = teacher_id);

-- ============================================================
-- 6. CATEGORIES
-- ============================================================
create table public.categories (
  id            serial primary key,
  name          text not null unique,
  group_type    public.category_group not null,
  display_order int not null default 0
);

insert into public.categories (name, group_type, display_order) values
  ('LGS & Ortaokul', 'academic', 1),
  ('YKS & Lise', 'academic', 2),
  ('İlkokul Temel', 'academic', 3),
  ('Sınav Koçluğu', 'academic', 4),
  ('Yabancı Dil', 'academic', 5),
  ('ALES', 'academic', 6),
  ('Açık Öğretim Dersleri', 'academic', 7),
  ('Okul Öncesi / Oyun Ablalığı', 'special', 8),
  ('Özel Eğitim', 'special', 9),
  ('Pilates', 'special', 10),
  ('Personal Training', 'special', 11),
  ('Enstrüman', 'special', 12);

-- ============================================================
-- 7. TEACHER CATEGORIES
-- ============================================================
create table public.teacher_categories (
  teacher_id  uuid not null references public.teachers(profile_id) on delete cascade,
  category_id int not null references public.categories(id) on delete cascade,
  primary key (teacher_id, category_id)
);

alter table public.teacher_categories enable row level security;
create policy "Herkes öğretmen kategorilerini görebilir"
  on public.teacher_categories for select using (true);
create policy "Öğretmen kendi kategorilerini yönetebilir"
  on public.teacher_categories for all using (auth.uid() = teacher_id);

-- ============================================================
-- 8. TAGS
-- ============================================================
create table public.tags (
  id            serial primary key,
  name          text not null unique,
  display_order int not null default 0
);

insert into public.tags (name, display_order) values
  ('Sadece Soru Çözümü', 1),
  ('Yeni Nesil Sorular', 2),
  ('Derece Öğrencileri İçin', 3),
  ('Hızlı ve Etkili Okuma', 4);

-- ============================================================
-- 9. TEACHER TAGS
-- ============================================================
create table public.teacher_tags (
  teacher_id uuid not null references public.teachers(profile_id) on delete cascade,
  tag_id     int not null references public.tags(id) on delete cascade,
  primary key (teacher_id, tag_id)
);

alter table public.teacher_tags enable row level security;
create policy "Herkes öğretmen etiketlerini görebilir"
  on public.teacher_tags for select using (true);
create policy "Öğretmen kendi etiketlerini yönetebilir"
  on public.teacher_tags for all using (auth.uid() = teacher_id);

-- ============================================================
-- 10. CONTACT LOGS (iletişime geçme kayıtları)
-- ============================================================
create table public.contact_logs (
  id          uuid primary key default gen_random_uuid(),
  teacher_id  uuid not null references public.teachers(profile_id) on delete cascade,
  user_id     uuid not null references public.profiles(id) on delete cascade,
  created_at  timestamptz not null default now()
);

alter table public.contact_logs enable row level security;
create policy "Öğretmen kendi iletişim loglarını görebilir"
  on public.contact_logs for select
  using (auth.uid() = teacher_id);
create policy "Giriş yapmış kullanıcı log oluşturabilir"
  on public.contact_logs for insert
  with check (auth.uid() = user_id);

-- ============================================================
-- 11. VIEW LOGS (görüntülenme kayıtları)
-- ============================================================
create table public.view_logs (
  id          uuid primary key default gen_random_uuid(),
  teacher_id  uuid not null references public.teachers(profile_id) on delete cascade,
  viewer_id   uuid references public.profiles(id) on delete set null,
  created_at  timestamptz not null default now()
);

alter table public.view_logs enable row level security;
create policy "Öğretmen kendi görüntülenme loglarını görebilir"
  on public.view_logs for select
  using (auth.uid() = teacher_id);
create policy "Herkes log oluşturabilir"
  on public.view_logs for insert
  with check (true);

-- ============================================================
-- 12. REPORTS (şikayet)
-- ============================================================
create table public.reports (
  id           uuid primary key default gen_random_uuid(),
  reporter_id  uuid not null references public.profiles(id) on delete cascade,
  teacher_id   uuid not null references public.teachers(profile_id) on delete cascade,
  reason       text not null,
  description  text,
  status       public.report_status not null default 'pending',
  created_at   timestamptz not null default now()
);

alter table public.reports enable row level security;
create policy "Admin raporları görebilir"
  on public.reports for select
  using (exists (select 1 from public.profiles where id = auth.uid() and is_admin = true));
create policy "Kullanıcı rapor oluşturabilir"
  on public.reports for insert
  with check (auth.uid() = reporter_id);

-- ============================================================
-- 13. EMAIL VERIFICATION CODES
-- ============================================================
create table public.verification_codes (
  id         uuid primary key default gen_random_uuid(),
  email      text not null,
  code       text not null,
  expires_at timestamptz not null default (now() + interval '15 minutes'),
  used       boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.verification_codes enable row level security;
create policy "Herkes doğrulama kodu oluşturabilir"
  on public.verification_codes for insert with check (true);
create policy "Herkes kendi kodunu okuyabilir"
  on public.verification_codes for select using (true);

-- ============================================================
-- 14. NOTIFICATIONS (uygulama içi bildirimler)
-- ============================================================
create table public.notifications (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  title       text not null,
  body        text not null,
  read        boolean not null default false,
  data        jsonb,
  created_at  timestamptz not null default now()
);

alter table public.notifications enable row level security;
create policy "Kullanıcı kendi bildirimlerini görebilir"
  on public.notifications for select using (auth.uid() = user_id);
create policy "Kullanıcı kendi bildirimlerini güncelleyebilir"
  on public.notifications for update using (auth.uid() = user_id);

-- ============================================================
-- 15. PUSH TOKENS
-- ============================================================
create table public.push_tokens (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  token      text not null,
  platform   text not null default 'web',
  created_at timestamptz not null default now(),
  unique(user_id, token)
);

alter table public.push_tokens enable row level security;
create policy "Kullanıcı kendi tokenını yönetebilir"
  on public.push_tokens for all using (auth.uid() = user_id);

-- ============================================================
-- TRIGGERS
-- ============================================================
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger teachers_updated_at
  before update on public.teachers
  for each row execute function public.set_updated_at();

-- Yeni kullanıcı kaydında otomatik profil oluşturma
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, phone_number, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'phone_number', ''),
    coalesce((new.raw_user_meta_data->>'role')::public.user_role, 'parent')
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- İletişim logu oluşturulduğunda contact_count artır
create or replace function public.increment_contact_count()
returns trigger as $$
begin
  update public.teachers set contact_count = contact_count + 1
  where profile_id = new.teacher_id;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_contact_log_created
  after insert on public.contact_logs
  for each row execute function public.increment_contact_count();

-- Görüntülenme logu oluşturulduğunda view_count artır
create or replace function public.increment_view_count()
returns trigger as $$
begin
  update public.teachers set view_count = view_count + 1
  where profile_id = new.teacher_id;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_view_log_created
  after insert on public.view_logs
  for each row execute function public.increment_view_count();

-- ============================================================
-- INDEXES
-- ============================================================
create index idx_teachers_subscription on public.teachers(subscription_status) where subscription_status = true;
create index idx_teachers_verified on public.teachers(is_verified) where is_verified = true;
create index idx_teacher_locations_city on public.teacher_locations(city);
create index idx_teacher_locations_teacher on public.teacher_locations(teacher_id);
create index idx_teacher_categories_teacher on public.teacher_categories(teacher_id);
create index idx_teacher_categories_category on public.teacher_categories(category_id);
create index idx_teacher_tags_teacher on public.teacher_tags(teacher_id);
create index idx_contact_logs_teacher on public.contact_logs(teacher_id);
create index idx_view_logs_teacher on public.view_logs(teacher_id);
create index idx_notifications_user on public.notifications(user_id, read);
create index idx_reports_status on public.reports(status);
create index idx_verification_codes_email on public.verification_codes(email, used);

-- ============================================================
-- STORAGE BUCKETS
-- ============================================================
insert into storage.buckets (id, name, public) values ('avatars', 'avatars', true) on conflict do nothing;
insert into storage.buckets (id, name, public) values ('diplomas', 'diplomas', false) on conflict do nothing;
insert into storage.buckets (id, name, public) values ('videos', 'videos', true) on conflict do nothing;

create policy "Herkes avatarları görebilir"
  on storage.objects for select using (bucket_id = 'avatars');
create policy "Giriş yapmış kullanıcılar avatar yükleyebilir"
  on storage.objects for insert with check (bucket_id = 'avatars' and auth.role() = 'authenticated');

create policy "Admin diplomaları görebilir"
  on storage.objects for select
  using (bucket_id = 'diplomas' and exists (select 1 from public.profiles where id = auth.uid() and is_admin = true));
create policy "Öğretmen diploma yükleyebilir"
  on storage.objects for insert
  with check (bucket_id = 'diplomas' and auth.role() = 'authenticated');

create policy "Herkes videoları görebilir"
  on storage.objects for select using (bucket_id = 'videos');
create policy "Öğretmen video yükleyebilir"
  on storage.objects for insert
  with check (bucket_id = 'videos' and auth.role() = 'authenticated');
