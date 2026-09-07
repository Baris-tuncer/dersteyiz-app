-- Favori öğretmenler tablosu
create table public.favorites (
  user_id    uuid not null references public.profiles(id) on delete cascade,
  teacher_id uuid not null references public.teachers(profile_id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, teacher_id)
);

alter table public.favorites enable row level security;

create policy "Kullanıcı kendi favorilerini görebilir"
  on public.favorites for select using (auth.uid() = user_id);
create policy "Kullanıcı favori ekleyebilir"
  on public.favorites for insert with check (auth.uid() = user_id);
create policy "Kullanıcı favori silebilir"
  on public.favorites for delete using (auth.uid() = user_id);

create index idx_favorites_user on public.favorites(user_id);
create index idx_favorites_teacher on public.favorites(teacher_id);
