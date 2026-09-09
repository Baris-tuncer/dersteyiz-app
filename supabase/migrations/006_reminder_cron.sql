-- ============================================================
-- 006: Cron job for reminder push notifications
-- Calls send-reminder-notifications Edge Function every 5 min
-- ============================================================

SELECT cron.schedule(
  'send-reminder-notifications',
  '*/5 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://dosuweocrtcotvsunefn.supabase.co/functions/v1/send-reminder-notifications',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRvc3V3ZW9jcnRjb3R2c3VuZWZuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg3MjI3NzMsImV4cCI6MjEwNDI5ODc3M30.ikFjn_eNAnwfZPBn8AQnxyEnQDHC_r76-UQmi-CWN4k"}'::jsonb,
    body := '{}'::jsonb
  ) AS request_id;
  $$
);
