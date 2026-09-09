import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { supabaseAdmin } from '../_shared/supabaseAdmin.ts';
import { sendExpoPush } from '../_shared/push.ts';
import { corsHeaders } from '../_shared/cors.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { teacher_id, status } = await req.json();
    if (!teacher_id || !status) {
      return new Response(JSON.stringify({ error: 'teacher_id and status required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get teacher's profile
    const { data: teacher } = await supabaseAdmin
      .from('teachers')
      .select('profile_id, profiles!inner(full_name)')
      .eq('profile_id', teacher_id)
      .single();

    if (!teacher) {
      return new Response(JSON.stringify({ error: 'Teacher not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const isApproved = status === 'approve';
    const title = isApproved ? 'Diplomanız Onaylandı!' : 'Diploma Durumu';
    const body = isApproved
      ? 'Tebrikler! Diplomanız doğrulandı. Artık profilinizde onay rozeti görünecek.'
      : 'Diplomanız reddedildi. Lütfen geçerli bir diploma yükleyerek tekrar deneyin.';

    // Insert in-app notification
    await supabaseAdmin.from('notifications').insert({
      user_id: teacher_id,
      title,
      body,
      data: { type: 'diploma_status', status },
    });

    // Check push preference
    const { data: prefs } = await supabaseAdmin
      .from('notification_preferences')
      .select('push_enabled')
      .eq('user_id', teacher_id)
      .single();

    if (prefs?.push_enabled !== false) {
      // Get push tokens
      const { data: tokens } = await supabaseAdmin
        .from('push_tokens')
        .select('token')
        .eq('user_id', teacher_id);

      if (tokens && tokens.length > 0) {
        await sendExpoPush(
          tokens.map((t) => ({
            to: t.token,
            title,
            body,
            data: { type: 'diploma_status', status },
            sound: 'default',
          })),
        );
      }
    }

    return new Response(JSON.stringify({ success: true }), {
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
