-- ============================================
-- 004: Notification System Tables & Functions
-- ============================================

-- 1. Notification Preferences
CREATE TABLE IF NOT EXISTS notification_preferences (
  user_id uuid PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  push_enabled boolean NOT NULL DEFAULT true,
  email_enabled boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own_prefs_select" ON notification_preferences
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own_prefs_insert" ON notification_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own_prefs_update" ON notification_preferences
  FOR UPDATE USING (auth.uid() = user_id);

-- 2. Milestone Notifications (tracks which milestones were sent)
CREATE TABLE IF NOT EXISTS milestone_notifications (
  teacher_id uuid REFERENCES teachers(profile_id) ON DELETE CASCADE,
  milestone int NOT NULL,
  sent_at timestamptz DEFAULT now(),
  PRIMARY KEY (teacher_id, milestone)
);

-- 3. Tip Notifications (tracks which tips were sent)
CREATE TABLE IF NOT EXISTS tip_notifications (
  teacher_id uuid REFERENCES teachers(profile_id) ON DELETE CASCADE,
  tip_type text NOT NULL,
  sent_at timestamptz DEFAULT now(),
  PRIMARY KEY (teacher_id, tip_type)
);

-- 4. Add last_active_at to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_active_at timestamptz DEFAULT now();

-- 5. Daily view count function (used by Edge Functions)
CREATE OR REPLACE FUNCTION get_daily_view_counts(since timestamptz)
RETURNS TABLE(teacher_id uuid, view_count bigint) AS $$
  SELECT teacher_id, count(*)
  FROM view_logs
  WHERE created_at >= since
  GROUP BY teacher_id
  HAVING count(*) > 0;
$$ LANGUAGE sql SECURITY DEFINER;
