import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { supabaseAdmin } from '../_shared/supabaseAdmin.ts';
import { sendExpoPush } from '../_shared/push.ts';
import { corsHeaders } from '../_shared/cors.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const now = new Date();
    const twoHoursFromNow = new Date(now.getTime() + 2 * 60 * 60 * 1000);
    const oneHourFromNow = new Date(now.getTime() + 1 * 60 * 60 * 1000);

    let sentCount = 0;

    // 2-hour notifications
    const { data: twoHourReminders } = await supabaseAdmin
      .from('reminders')
      .select('*')
      .eq('notified_2h', false)
      .lte('remind_at', twoHoursFromNow.toISOString())
      .gt('remind_at', now.toISOString());

    if (twoHourReminders) {
      for (const reminder of twoHourReminders) {
        const title = reminder.title;
        const body = reminder.note
          ? `2 saat kaldı — ${reminder.note}`
          : '2 saat kaldı';
        const subtitle = 'Hatırlatıcı';

        await supabaseAdmin.from('notifications').insert({
          user_id: reminder.user_id,
          title,
          body,
          data: { type: 'reminder', reminder_id: reminder.id },
        });

        const { data: tokens } = await supabaseAdmin
          .from('push_tokens')
          .select('token')
          .eq('user_id', reminder.user_id);

        if (tokens && tokens.length > 0) {
          await sendExpoPush(
            tokens.map((t) => ({
              to: t.token,
              title,
              subtitle,
              body,
              channelId: 'default',
              data: { type: 'reminder', reminder_id: reminder.id },
              sound: 'default',
            })),
          );
        }

        await supabaseAdmin
          .from('reminders')
          .update({ notified_2h: true })
          .eq('id', reminder.id);

        sentCount++;
      }
    }

    // 1-hour notifications
    const { data: oneHourReminders } = await supabaseAdmin
      .from('reminders')
      .select('*')
      .eq('notified_1h', false)
      .lte('remind_at', oneHourFromNow.toISOString())
      .gt('remind_at', now.toISOString());

    if (oneHourReminders) {
      for (const reminder of oneHourReminders) {
        const title = reminder.title;
        const body = reminder.note
          ? `1 saat kaldı — ${reminder.note}`
          : '1 saat kaldı';
        const subtitle = 'Hatırlatıcı';

        await supabaseAdmin.from('notifications').insert({
          user_id: reminder.user_id,
          title,
          body,
          data: { type: 'reminder', reminder_id: reminder.id },
        });

        const { data: tokens } = await supabaseAdmin
          .from('push_tokens')
          .select('token')
          .eq('user_id', reminder.user_id);

        if (tokens && tokens.length > 0) {
          await sendExpoPush(
            tokens.map((t) => ({
              to: t.token,
              title,
              subtitle,
              body,
              channelId: 'default',
              data: { type: 'reminder', reminder_id: reminder.id },
              sound: 'default',
            })),
          );
        }

        await supabaseAdmin
          .from('reminders')
          .update({ notified_1h: true })
          .eq('id', reminder.id);

        sentCount++;
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
