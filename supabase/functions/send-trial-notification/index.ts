import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { supabaseAdmin } from '../_shared/supabaseAdmin.ts';
import { sendExpoPush } from '../_shared/push.ts';
import { corsHeaders } from '../_shared/cors.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { request_id, type } = await req.json();
    if (!request_id || !type) {
      return new Response(JSON.stringify({ error: 'request_id and type required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: request } = await supabaseAdmin
      .from('trial_requests')
      .select('teacher_id, parent_id, status')
      .eq('id', request_id)
      .single();

    if (!request) {
      return new Response(JSON.stringify({ error: 'request not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let targetUserId: string;
    let title: string;
    let body: string;

    if (type === 'new_request') {
      // Notify teacher
      targetUserId = request.teacher_id;
      const { data: parent } = await supabaseAdmin
        .from('profiles')
        .select('full_name')
        .eq('id', request.parent_id)
        .single();
      title = 'Yeni Tanışma Talebi';
      body = `${parent?.full_name ?? 'Bir veli'} size tanışma talebi gönderdi.`;
    } else {
      // Notify parent about accept/reject
      targetUserId = request.parent_id;
      const { data: teacher } = await supabaseAdmin
        .from('profiles')
        .select('full_name')
        .eq('id', request.teacher_id)
        .single();
      const statusText = request.status === 'accepted' ? 'kabul etti' : 'reddetti';
      title = 'Tanışma Talebi Güncellendi';
      body = `${teacher?.full_name ?? 'Öğretmen'} tanışma talebinizi ${statusText}.`;
    }

    // In-app notification
    await supabaseAdmin.from('notifications').insert({
      user_id: targetUserId,
      title,
      body,
      data: { type: 'trial_request', request_id },
    });

    // Push notification
    const { data: tokens } = await supabaseAdmin
      .from('push_tokens')
      .select('token')
      .eq('user_id', targetUserId);

    if (tokens && tokens.length > 0) {
      await sendExpoPush(
        tokens.map((t) => ({
          to: t.token,
          title,
          body,
          data: { type: 'trial_request', request_id },
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
