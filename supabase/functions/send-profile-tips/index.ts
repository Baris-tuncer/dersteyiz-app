import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { supabaseAdmin } from '../_shared/supabaseAdmin.ts';
import { sendExpoPush } from '../_shared/push.ts';
import { corsHeaders } from '../_shared/cors.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Find active teachers who don't have a video
    const { data: teachers } = await supabaseAdmin
      .from('teachers')
      .select('profile_id, video_url')
      .is('video_url', null);

    if (!teachers || teachers.length === 0) {
      return new Response(JSON.stringify({ sent: 0 }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const title = 'Profilinizi Güçlendirin';
    const body = 'Tanıtım videosu ekleyin ve daha fazla görüntülenme alın! Videolu profiller 3x daha fazla ilgi çekiyor.';

    let sentCount = 0;

    for (const teacher of teachers) {
      const teacherId = teacher.profile_id;

      // Check if this tip was already sent
      const { data: existing } = await supabaseAdmin
        .from('tip_notifications')
        .select('teacher_id')
        .eq('teacher_id', teacherId)
        .eq('tip_type', 'add_video')
        .single();

      if (existing) continue;

      // Check push preference
      const { data: prefs } = await supabaseAdmin
        .from('notification_preferences')
        .select('push_enabled')
        .eq('user_id', teacherId)
        .single();

      if (prefs?.push_enabled === false) continue;

      // Record that this tip was sent
      await supabaseAdmin
        .from('tip_notifications')
        .insert({ teacher_id: teacherId, tip_type: 'add_video' });

      // In-app notification
      await supabaseAdmin.from('notifications').insert({
        user_id: teacherId,
        title,
        body,
        data: { type: 'profile_tip', tip: 'add_video' },
      });

      // Push notification
      const { data: tokens } = await supabaseAdmin
        .from('push_tokens')
        .select('token')
        .eq('user_id', teacherId);

      if (tokens && tokens.length > 0) {
        await sendExpoPush(
          tokens.map((t) => ({
            to: t.token,
            title,
            body,
            data: { type: 'profile_tip', tip: 'add_video' },
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
