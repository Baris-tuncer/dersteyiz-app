import { supabase } from '../config/supabase';
import type { Reminder } from '../types/super';

export async function fetchReminders(userId: string): Promise<Reminder[]> {
  const { data, error } = await supabase
    .from('reminders')
    .select('*')
    .eq('user_id', userId)
    .order('remind_at', { ascending: true });
  if (error) throw error;
  return (data ?? []) as Reminder[];
}

export async function createReminder(
  userId: string,
  title: string,
  note: string,
  remindAt: string,
): Promise<Reminder> {
  const { data, error } = await supabase
    .from('reminders')
    .insert({
      user_id: userId,
      title,
      note,
      remind_at: remindAt,
    })
    .select()
    .single();
  if (error) throw error;
  return data as Reminder;
}

export async function deleteReminder(reminderId: string): Promise<void> {
  const { error } = await supabase
    .from('reminders')
    .delete()
    .eq('id', reminderId);
  if (error) throw error;
}
