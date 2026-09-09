import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { supabaseAdmin } from '../_shared/supabaseAdmin.ts';
import { sendExpoPush } from '../_shared/push.ts';
import { corsHeaders } from '../_shared/cors.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Count teachers joined in last 7 days
    const since = new Date();
    since.setDate(since.getDate() - 7);

    const { count: newTeacherCount } = await supabaseAdmin
      .from('teachers')
      .select('profile_id', { count: 'exact', head: true })
      .gte('created_at', since.toISOString());

    if (!newTeacherCount || newTeacherCount === 0) {
      return new Response(JSON.stringify({ sent: 0, reason: 'no_new_teachers' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const title = 'Yeni Öğretmenler!';
    const body = `Bu hafta ${newTeacherCount} yeni öğretmen katıldı. Hemen keşfedin!`;

    // Get all parent users
    const { data: parents } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('role', 'parent');

    if (!parents || parents.length === 0) {
      return new Response(JSON.stringify({ sent: 0, reason: 'no_parents' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let sentCount = 0;

    for (const parent of parents) {
      // Check push preference
      const { data: prefs } = await supabaseAdmin
        .from('notification_preferences')
        .select('push_enabled')
        .eq('user_id', parent.id)
        .single();

      if (prefs?.push_enabled === false) continue;

      // In-app notification
      await supabaseAdmin.from('notifications').insert({
        user_id: parent.id,
        title,
        body,
        data: { type: 'weekly_new_teachers', count: newTeacherCount },
      });

      // Push notification
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
            data: { type: 'weekly_new_teachers', count: newTeacherCount },
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
