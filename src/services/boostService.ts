import { supabase } from '../config/supabase';
import type { TeacherBoost } from '../types/super';

export async function canBoost(teacherId: string): Promise<boolean> {
  const { data, error } = await supabase.rpc('can_boost', {
    p_teacher_id: teacherId,
  });
  if (error) throw error;
  return data as boolean;
}

export async function createBoost(teacherId: string): Promise<TeacherBoost> {
  const { data, error } = await supabase
    .from('teacher_boosts')
    .insert({ teacher_id: teacherId })
    .select()
    .single();
  if (error) throw error;
  return data as TeacherBoost;
}

export async function getActiveBoost(teacherId: string): Promise<TeacherBoost | null> {
  const { data, error } = await supabase
    .from('teacher_boosts')
    .select('*')
    .eq('teacher_id', teacherId)
    .gt('expires_at', new Date().toISOString())
    .order('expires_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data as TeacherBoost | null;
}

export async function fetchBoostedTeacherIds(): Promise<string[]> {
  const { data, error } = await supabase
    .from('teacher_boosts')
    .select('teacher_id, teacher:teachers!inner(subscription_status)')
    .gt('expires_at', new Date().toISOString())
    .eq('teacher.subscription_status', true);
  if (error) throw error;
  return (data ?? []).map((b) => b.teacher_id);
}
