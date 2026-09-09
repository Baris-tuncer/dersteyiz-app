import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { supabaseAdmin } from '../_shared/supabaseAdmin.ts';
import { sendExpoPush } from '../_shared/push.ts';
import { corsHeaders } from '../_shared/cors.ts';

const MILESTONES = [10, 50, 100, 500, 1000];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const since = new Date();
    since.setHours(0, 0, 0, 0);

    // Get today's view counts per teacher
    const { data: viewCounts } = await supabaseAdmin.rpc('get_daily_view_counts', {
      since: since.toISOString(),
    });

    if (!viewCounts || viewCounts.length === 0) {
      return new Response(JSON.stringify({ sent: 0 }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let sentCount = 0;

    for (const row of viewCounts) {
      const teacherId = row.teacher_id;
      const count = Number(row.view_count);

      // Check push preference
      const { data: prefs } = await supabaseAdmin
        .from('notification_preferences')
        .select('push_enabled')
        .eq('user_id', teacherId)
        .single();

      if (prefs?.push_enabled === false) continue;

      // Daily summary notification
      const title = 'Günlük Görüntülenme';
      const body = `Bugün profiliniz ${count} kez görüntülendi!`;

      await supabaseAdmin.from('notifications').insert({
        user_id: teacherId,
        title,
        body,
        data: { type: 'daily_summary', view_count: count },
      });

      // Get push tokens
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
            data: { type: 'daily_summary', view_count: count },
            sound: 'default',
          })),
        );
      }

      sentCount++;

      // Check milestones (total view count)
      const { count: totalViews } = await supabaseAdmin
        .from('view_logs')
        .select('id', { count: 'exact', head: true })
        .eq('teacher_id', teacherId);

      const total = totalViews ?? 0;

      for (const milestone of MILESTONES) {
        if (total >= milestone) {
          // Check if milestone was already sent
          const { data: existing } = await supabaseAdmin
            .from('milestone_notifications')
            .select('teacher_id')
            .eq('teacher_id', teacherId)
            .eq('milestone', milestone)
            .single();

          if (!existing) {
            // Record milestone
            await supabaseAdmin
              .from('milestone_notifications')
              .insert({ teacher_id: teacherId, milestone });

            const mTitle = 'Tebrikler!';
            const mBody = `Profiliniz ${milestone} görüntülenmeye ulaştı!`;

            await supabaseAdmin.from('notifications').insert({
              user_id: teacherId,
              title: mTitle,
              body: mBody,
              data: { type: 'milestone', milestone },
            });

            if (tokens && tokens.length > 0) {
              await sendExpoPush(
                tokens.map((t) => ({
                  to: t.token,
                  title: mTitle,
                  body: mBody,
                  data: { type: 'milestone', milestone },
                  sound: 'default',
                })),
              );
            }
          }
        }
      }
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
