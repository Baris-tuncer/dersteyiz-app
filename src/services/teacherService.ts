import { supabase } from '../config/supabase';
import type { TeacherWithDetails } from '../types/teacher';

export async function fetchTeachers(): Promise<TeacherWithDetails[]> {
  const { data, error } = await supabase
    .from('teachers')
    .select(`
      *,
      profile:profiles!teachers_profile_id_fkey(*),
      modes:teacher_modes(mode),
      locations:teacher_locations(id, city, district),
      categories:teacher_categories(category:categories(*)),
      tags:teacher_tags(tag:tags(*))
    `)
    .eq('subscription_status', true)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []) as unknown as TeacherWithDetails[];
}

export async function fetchTeacher(profileId: string): Promise<TeacherWithDetails | null> {
  const { data, error } = await supabase
    .from('teachers')
    .select(`
      *,
      profile:profiles!teachers_profile_id_fkey(*),
      modes:teacher_modes(mode),
      locations:teacher_locations(id, city, district),
      categories:teacher_categories(category:categories(*)),
      tags:teacher_tags(tag:tags(*))
    `)
    .eq('profile_id', profileId)
    .single();

  if (error) return null;
  return data as unknown as TeacherWithDetails;
}

export async function logView(teacherId: string, viewerId?: string): Promise<void> {
  await supabase.from('view_logs').insert({
    teacher_id: teacherId,
    viewer_id: viewerId ?? null,
  });
}

export async function logContact(teacherId: string, userId: string): Promise<void> {
  await supabase.from('contact_logs').insert({
    teacher_id: teacherId,
    user_id: userId,
  });
}
