-- ============================================================
-- 005: Super Features - Boost, Reviews, Availability,
--      Trial Requests, Reminders, Analytics Enhancements
-- ============================================================

-- 1. TEACHER BOOSTS (2x per month, 3-day profile boost)
CREATE TABLE public.teacher_boosts (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id  uuid NOT NULL REFERENCES public.teachers(profile_id) ON DELETE CASCADE,
  boosted_at  timestamptz NOT NULL DEFAULT now(),
  expires_at  timestamptz NOT NULL DEFAULT (now() + interval '3 days'),
  created_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.teacher_boosts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Öğretmen kendi boost kayıtlarını görebilir"
  ON public.teacher_boosts FOR SELECT
  USING (auth.uid() = teacher_id);
CREATE POLICY "Öğretmen boost oluşturabilir"
  ON public.teacher_boosts FOR INSERT
  WITH CHECK (auth.uid() = teacher_id);
CREATE POLICY "Herkes aktif boostları görebilir"
  ON public.teacher_boosts FOR SELECT
  USING (expires_at > now());

CREATE INDEX idx_teacher_boosts_active
  ON public.teacher_boosts(teacher_id, expires_at);

-- Function to check if teacher can boost (premium + max 2 per month + no active boost)
CREATE OR REPLACE FUNCTION public.can_boost(p_teacher_id uuid)
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.teachers
    WHERE profile_id = p_teacher_id AND subscription_status = true
  )
  AND (
    SELECT COUNT(*) FROM public.teacher_boosts
    WHERE teacher_id = p_teacher_id
      AND boosted_at >= date_trunc('month', now())
  ) < 2
  AND NOT EXISTS (
    SELECT 1 FROM public.teacher_boosts
    WHERE teacher_id = p_teacher_id
      AND expires_at > now()
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- 2. REVIEWS (parent reviews teacher after lesson)
CREATE TABLE public.reviews (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id  uuid NOT NULL REFERENCES public.teachers(profile_id) ON DELETE CASCADE,
  reviewer_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating      smallint NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment     text NOT NULL DEFAULT '',
  created_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE(teacher_id, reviewer_id)
);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Herkes yorumları görebilir"
  ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Veli yorum yazabilir"
  ON public.reviews FOR INSERT
  WITH CHECK (
    auth.uid() = reviewer_id
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'parent'
    )
  );
CREATE POLICY "Veli kendi yorumunu güncelleyebilir"
  ON public.reviews FOR UPDATE
  USING (auth.uid() = reviewer_id);
CREATE POLICY "Veli kendi yorumunu silebilir"
  ON public.reviews FOR DELETE
  USING (auth.uid() = reviewer_id);

CREATE INDEX idx_reviews_teacher ON public.reviews(teacher_id);

-- Denormalized avg_rating and review_count on teachers
ALTER TABLE public.teachers
  ADD COLUMN IF NOT EXISTS avg_rating numeric(2,1) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS review_count int NOT NULL DEFAULT 0;

-- Trigger to auto-update avg_rating/review_count
CREATE OR REPLACE FUNCTION public.update_teacher_rating()
RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    UPDATE public.teachers SET
      avg_rating = COALESCE((SELECT ROUND(AVG(rating)::numeric, 1) FROM public.reviews WHERE teacher_id = OLD.teacher_id), 0),
      review_count = (SELECT COUNT(*) FROM public.reviews WHERE teacher_id = OLD.teacher_id)
    WHERE profile_id = OLD.teacher_id;
    RETURN OLD;
  ELSE
    UPDATE public.teachers SET
      avg_rating = COALESCE((SELECT ROUND(AVG(rating)::numeric, 1) FROM public.reviews WHERE teacher_id = NEW.teacher_id), 0),
      review_count = (SELECT COUNT(*) FROM public.reviews WHERE teacher_id = NEW.teacher_id)
    WHERE profile_id = NEW.teacher_id;
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_review_change
  AFTER INSERT OR UPDATE OR DELETE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_teacher_rating();

-- 3. TEACHER AVAILABILITY (weekly schedule)
CREATE TABLE public.teacher_availability (
  id          serial PRIMARY KEY,
  teacher_id  uuid NOT NULL REFERENCES public.teachers(profile_id) ON DELETE CASCADE,
  day_of_week smallint NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time  time NOT NULL,
  end_time    time NOT NULL,
  CHECK (end_time > start_time),
  UNIQUE(teacher_id, day_of_week, start_time)
);

ALTER TABLE public.teacher_availability ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Herkes müsaitlik görebilir"
  ON public.teacher_availability FOR SELECT USING (true);
CREATE POLICY "Öğretmen kendi müsaitliğini ekleyebilir"
  ON public.teacher_availability FOR INSERT
  WITH CHECK (auth.uid() = teacher_id);
CREATE POLICY "Öğretmen kendi müsaitliğini güncelleyebilir"
  ON public.teacher_availability FOR UPDATE
  USING (auth.uid() = teacher_id);
CREATE POLICY "Öğretmen kendi müsaitliğini silebilir"
  ON public.teacher_availability FOR DELETE
  USING (auth.uid() = teacher_id);

CREATE INDEX idx_availability_teacher ON public.teacher_availability(teacher_id);

-- 4. TRIAL LESSON REQUESTS
CREATE TYPE public.trial_request_status AS ENUM ('pending', 'accepted', 'rejected', 'cancelled');

CREATE TABLE public.trial_requests (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id  uuid NOT NULL REFERENCES public.teachers(profile_id) ON DELETE CASCADE,
  parent_id   uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status      public.trial_request_status NOT NULL DEFAULT 'pending',
  message     text NOT NULL DEFAULT '',
  teacher_note text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.trial_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Öğretmen kendi taleplerini görebilir"
  ON public.trial_requests FOR SELECT
  USING (auth.uid() = teacher_id);
CREATE POLICY "Veli kendi taleplerini görebilir"
  ON public.trial_requests FOR SELECT
  USING (auth.uid() = parent_id);
CREATE POLICY "Veli talep oluşturabilir"
  ON public.trial_requests FOR INSERT
  WITH CHECK (auth.uid() = parent_id);
CREATE POLICY "Öğretmen talep durumunu güncelleyebilir"
  ON public.trial_requests FOR UPDATE
  USING (auth.uid() = teacher_id);
CREATE POLICY "Veli kendi talebini iptal edebilir"
  ON public.trial_requests FOR UPDATE
  USING (auth.uid() = parent_id);

CREATE INDEX idx_trial_requests_teacher ON public.trial_requests(teacher_id, status);
CREATE INDEX idx_trial_requests_parent ON public.trial_requests(parent_id, status);

CREATE TRIGGER trial_requests_updated_at
  BEFORE UPDATE ON public.trial_requests
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 5. REMINDERS (personal reminders with push)
CREATE TABLE public.reminders (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title       text NOT NULL,
  note        text NOT NULL DEFAULT '',
  remind_at   timestamptz NOT NULL,
  notified_2h boolean NOT NULL DEFAULT false,
  notified_1h boolean NOT NULL DEFAULT false,
  created_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Kullanıcı kendi hatırlatıcılarını görebilir"
  ON public.reminders FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "Kullanıcı hatırlatıcı oluşturabilir"
  ON public.reminders FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Kullanıcı kendi hatırlatıcısını güncelleyebilir"
  ON public.reminders FOR UPDATE
  USING (auth.uid() = user_id);
CREATE POLICY "Kullanıcı kendi hatırlatıcısını silebilir"
  ON public.reminders FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX idx_reminders_user ON public.reminders(user_id);
CREATE INDEX idx_reminders_pending
  ON public.reminders(remind_at)
  WHERE notified_1h = false;

-- 6. Additional columns
ALTER TABLE public.view_logs ADD COLUMN IF NOT EXISTS viewer_city text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS city text;
ALTER TABLE public.teachers ADD COLUMN IF NOT EXISTS experience_years smallint NOT NULL DEFAULT 0;
ALTER TABLE public.teachers ADD COLUMN IF NOT EXISTS offers_trial boolean NOT NULL DEFAULT false;
ALTER TABLE public.teachers ADD COLUMN IF NOT EXISTS diploma_type text NOT NULL DEFAULT 'diploma' CHECK (diploma_type IN ('diploma', 'certificate'));

-- 7. Analytics RPC functions
CREATE OR REPLACE FUNCTION public.get_view_hours(p_teacher_id uuid, p_since timestamptz)
RETURNS TABLE(hour int, count bigint) AS $$
  SELECT EXTRACT(HOUR FROM created_at)::int AS hour, COUNT(*)
  FROM public.view_logs
  WHERE teacher_id = p_teacher_id AND created_at >= p_since
  GROUP BY hour ORDER BY hour;
$$ LANGUAGE sql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.get_view_cities(p_teacher_id uuid, p_since timestamptz)
RETURNS TABLE(city text, count bigint) AS $$
  SELECT COALESCE(viewer_city, 'Bilinmiyor') AS city, COUNT(*)
  FROM public.view_logs
  WHERE teacher_id = p_teacher_id AND created_at >= p_since
  GROUP BY viewer_city ORDER BY count DESC;
$$ LANGUAGE sql SECURITY DEFINER;

-- 8. Recommendation RPC function
CREATE OR REPLACE FUNCTION public.get_recommendations(p_user_id uuid, p_limit int DEFAULT 10)
RETURNS SETOF uuid AS $$
  WITH fav_teachers AS (
    SELECT teacher_id FROM public.favorites WHERE user_id = p_user_id
  ),
  fav_categories AS (
    SELECT DISTINCT category_id FROM public.teacher_categories
    WHERE teacher_id IN (SELECT teacher_id FROM fav_teachers)
  ),
  fav_majors AS (
    SELECT DISTINCT major FROM public.teachers
    WHERE profile_id IN (SELECT teacher_id FROM fav_teachers)
  )
  SELECT t.profile_id
  FROM public.teachers t
  LEFT JOIN public.teacher_categories tc ON tc.teacher_id = t.profile_id
  WHERE t.subscription_status = true
    AND t.profile_id NOT IN (SELECT teacher_id FROM fav_teachers)
    AND t.profile_id != p_user_id
    AND (tc.category_id IN (SELECT category_id FROM fav_categories)
         OR t.major IN (SELECT major FROM fav_majors))
  GROUP BY t.profile_id
  ORDER BY COUNT(DISTINCT tc.category_id) DESC, t.view_count DESC
  LIMIT p_limit;
$$ LANGUAGE sql SECURITY DEFINER;
