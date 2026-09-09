import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { supabaseAdmin } from '../_shared/supabaseAdmin.ts';
import { sendExpoPush } from '../_shared/push.ts';
import { corsHeaders } from '../_shared/cors.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Find parents inactive for 7+ days
    const { data: inactiveParents } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('role', 'parent')
      .lt('last_active_at', sevenDaysAgo.toISOString());

    if (!inactiveParents || inactiveParents.length === 0) {
      return new Response(JSON.stringify({ sent: 0 }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const title = 'Sizi Özledik!';
    const body = 'Yeni öğretmenler sizi bekliyor! Hemen keşfetmeye başlayın.';

    let sentCount = 0;

    for (const parent of inactiveParents) {
      // Check if a re-engagement notification was sent in last 7 days
      const { data: recentNotif } = await supabaseAdmin
        .from('notifications')
        .select('id')
        .eq('user_id', parent.id)
        .eq('data->>type', 're_engagement')
        .gte('created_at', sevenDaysAgo.toISOString())
        .limit(1);

      if (recentNotif && recentNotif.length > 0) continue;

      // Check push preference
      const { data: prefs } = await supabaseAdmin
        .from('notification_preferences')
        .select('push_enabled')
        .eq('user_id', parent.id)
        .single();

      if (prefs?.push_enabled === false) continue;

      await supabaseAdmin.from('notifications').insert({
        user_id: parent.id,
        title,
        body,
        data: { type: 're_engagement' },
      });

      const { data: tokens } = await supabaseAdmin
        .from('push_tokens')
        .select('token')
        .eq('user_id', parent.id);

      if (tokens && tokens.length > 0) {
        await sendExpoPush(
          tokens.map((t) => ({
            to: t.token,
            title,
            body,
            data: { type: 're_engagement' },
            sound: 'default',
          })),
        );
      }

      sentCount++;
    }

    return new Response(JSON.stringify({ sent: sentCount }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
