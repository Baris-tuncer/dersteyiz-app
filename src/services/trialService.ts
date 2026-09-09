import { supabase } from '../config/supabase';
import type { TrialRequest, TrialRequestStatus } from '../types/super';

export async function createTrialRequest(
  teacherId: string,
  parentId: string,
  message: string,
): Promise<TrialRequest> {
  const { data, error } = await supabase
    .from('trial_requests')
    .insert({
      teacher_id: teacherId,
      parent_id: parentId,
      message,
    })
    .select()
    .single();
  if (error) throw error;
  return data as TrialRequest;
}

export async function fetchTrialRequestsForTeacher(teacherId: string): Promise<TrialRequest[]> {
  const { data, error } = await supabase
    .from('trial_requests')
    .select(`
      *,
      parent:profiles!trial_requests_parent_id_fkey(full_name, avatar_url)
    `)
    .eq('teacher_id', teacherId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as TrialRequest[];
}

export async function fetchTrialRequestsForParent(parentId: string): Promise<TrialRequest[]> {
  const { data, error } = await supabase
    .from('trial_requests')
    .select(`
      *,
      teacher:profiles!trial_requests_teacher_id_fkey(full_name, avatar_url)
    `)
    .eq('parent_id', parentId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as TrialRequest[];
}

export async function updateTrialRequestStatus(
  requestId: string,
  status: TrialRequestStatus,
  teacherNote?: string,
): Promise<void> {
  const update: Record<string, unknown> = { status };
  if (teacherNote !== undefined) {
    update.teacher_note = teacherNote;
  }
  const { error } = await supabase
    .from('trial_requests')
    .update(update)
    .eq('id', requestId);
  if (error) throw error;
}

export async function getPendingTrialCount(teacherId: string): Promise<number> {
  const { count, error } = await supabase
    .from('trial_requests')
    .select('id', { count: 'exact', head: true })
    .eq('teacher_id', teacherId)
    .eq('status', 'pending');
  if (error) throw error;
  return count ?? 0;
}
