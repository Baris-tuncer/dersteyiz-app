import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { supabaseAdmin } from '../_shared/supabaseAdmin.ts';
import { sendExpoPush } from '../_shared/push.ts';
import { corsHeaders } from '../_shared/cors.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { teacher_id, reviewer_id, rating } = await req.json();
    if (!teacher_id || !reviewer_id) {
      return new Response(JSON.stringify({ error: 'teacher_id and reviewer_id required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: reviewer } = await supabaseAdmin
      .from('profiles')
      .select('full_name')
      .eq('id', reviewer_id)
      .single();

    const title = 'Yeni Yorum';
    const body = `${reviewer?.full_name ?? 'Bir veli'} size ${rating} yıldız verdi.`;

    // In-app notification
    await supabaseAdmin.from('notifications').insert({
      user_id: teacher_id,
      title,
      body,
      data: { type: 'new_review', reviewer_id },
    });

    // Push notification
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
          data: { type: 'new_review', reviewer_id },
          sound: 'default',
        })),
      );
    }

    return new Response(JSON.stringify({ sent: true }), {
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
