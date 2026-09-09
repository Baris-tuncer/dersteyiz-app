import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { supabaseAdmin } from '../_shared/supabaseAdmin.ts';
import { sendExpoPush } from '../_shared/push.ts';
import { corsHeaders } from '../_shared/cors.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { teacher_id } = await req.json();
    if (!teacher_id) {
      return new Response(JSON.stringify({ error: 'teacher_id required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get teacher name
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('full_name')
      .eq('id', teacher_id)
      .single();

    const teacherName = profile?.full_name ?? 'Bir öğretmen';

    // Get users who favorited this teacher
    const { data: favorites } = await supabaseAdmin
      .from('favorites')
      .select('user_id')
      .eq('teacher_id', teacher_id);

    if (!favorites || favorites.length === 0) {
      return new Response(JSON.stringify({ sent: 0 }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const title = 'Favori Öğretmen Güncellendi';
    const body = `Favori öğretmeniniz ${teacherName} profilini güncelledi.`;

    let sentCount = 0;

    for (const fav of favorites) {
      const { data: prefs } = await supabaseAdmin
        .from('notification_preferences')
        .select('push_enabled')
        .eq('user_id', fav.user_id)
        .single();

      if (prefs?.push_enabled === false) continue;

      await supabaseAdmin.from('notifications').insert({
        user_id: fav.user_id,
        title,
        body,
        data: { type: 'favorite_update', teacher_id },
      });

      const { data: tokens } = await supabaseAdmin
        .from('push_tokens')
        .select('token')
        .eq('user_id', fav.user_id);

      if (tokens && tokens.length > 0) {
        await sendExpoPush(
          tokens.map((t) => ({
            to: t.token,
            title,
            body,
            data: { type: 'favorite_update', teacher_id },
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
