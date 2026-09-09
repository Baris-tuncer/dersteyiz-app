-- ============================================================
-- Hesap Silme Fonksiyonu + Storage Silme Policy'leri
-- ============================================================

-- Storage silme policy'leri (kullanıcı kendi dosyalarını silebilsin)
create policy "Kullanıcı kendi avatarını silebilir"
  on storage.objects for delete
  using (bucket_id = 'avatars' and auth.role() = 'authenticated');

create policy "Öğretmen kendi videosunu silebilir"
  on storage.objects for delete
  using (bucket_id = 'videos' and auth.role() = 'authenticated');

create policy "Öğretmen kendi diplomasını silebilir"
  on storage.objects for delete
  using (bucket_id = 'diplomas' and auth.role() = 'authenticated');

-- Kullanıcının kendi hesabını silmesi için RPC
create or replace function public.delete_own_account()
returns void as $$
begin
  -- auth.users'dan sil (cascade ile profiles, teachers, vb. hepsi silinir)
  delete from auth.users where id = auth.uid();
end;
$$ language plpgsql security definer;
