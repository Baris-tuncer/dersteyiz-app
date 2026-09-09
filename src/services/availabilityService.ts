import { supabase } from '../config/supabase';
import type { TeacherAvailability } from '../types/super';

export async function fetchAvailability(teacherId: string): Promise<TeacherAvailability[]> {
  const { data, error } = await supabase
    .from('teacher_availability')
    .select('*')
    .eq('teacher_id', teacherId)
    .order('day_of_week')
    .order('start_time');
  if (error) throw error;
  return (data ?? []) as TeacherAvailability[];
}

export async function setAvailability(
  teacherId: string,
  slots: { day_of_week: number; start_time: string; end_time: string }[],
): Promise<void> {
  // Replace all slots: delete existing, insert new
  const { error: deleteError } = await supabase
    .from('teacher_availability')
    .delete()
    .eq('teacher_id', teacherId);
  if (deleteError) throw deleteError;

  if (slots.length === 0) return;

  const rows = slots.map((s) => ({
    teacher_id: teacherId,
    day_of_week: s.day_of_week,
    start_time: s.start_time,
    end_time: s.end_time,
  }));

  const { error: insertError } = await supabase
    .from('teacher_availability')
    .insert(rows);
  if (insertError) throw insertError;
}

export async function deleteAvailability(slotId: number): Promise<void> {
  const { error } = await supabase
    .from('teacher_availability')
    .delete()
    .eq('id', slotId);
  if (error) throw error;
}
