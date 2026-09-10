-- ============================================================
-- 007: Admin UPDATE policy for teachers table
-- Fix: Admin could view but not update teacher records (diploma approval was silently failing)
-- ============================================================

-- Allow admin to update any teacher record (diploma approval, verification etc.)
CREATE POLICY "Admin öğretmen kaydını güncelleyebilir"
  ON public.teachers FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true));
