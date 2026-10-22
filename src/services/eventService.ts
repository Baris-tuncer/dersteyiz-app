import { supabase } from '../config/supabase';

type PaywallEvent =
  | 'paywall_viewed'
  | 'subscribe_tapped'
  | 'purchase_started'
  | 'purchase_completed'
  | 'purchase_failed'
  | 'purchase_cancelled'
  | 'restore_tapped';

export async function trackPaywallEvent(
  event: PaywallEvent,
  metadata?: Record<string, unknown>,
): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from('paywall_events').insert({
      user_id: user.id,
      event,
      metadata: metadata ?? {},
    });
  } catch {
    // Analytics should never crash the app
  }
}
