-- Paywall event tracking
CREATE TABLE IF NOT EXISTS public.paywall_events (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  event text NOT NULL,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Index for querying by user and event type
CREATE INDEX idx_paywall_events_user ON public.paywall_events(user_id, created_at DESC);
CREATE INDEX idx_paywall_events_event ON public.paywall_events(event, created_at DESC);

-- RLS
ALTER TABLE public.paywall_events ENABLE ROW LEVEL SECURITY;

-- Users can insert their own events
CREATE POLICY "Users can insert own paywall events"
  ON public.paywall_events FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Admins can read all events
CREATE POLICY "Admins can read all paywall events"
  ON public.paywall_events FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true));
