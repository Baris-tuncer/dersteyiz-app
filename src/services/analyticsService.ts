import { supabase } from '../config/supabase';
import type {
  ViewerProfile,
  HourlyViewCount,
  CityViewCount,
  ContactProfile,
} from '../types/super';

export async function fetchViewers(
  teacherId: string,
  since: string,
): Promise<ViewerProfile[]> {
  const { data, error } = await supabase
    .from('view_logs')
    .select(`
      viewer_id,
      created_at,
      viewer_city,
      viewer:profiles!view_logs_viewer_id_fkey(id, full_name, avatar_url)
    `)
    .eq('teacher_id', teacherId)
    .gte('created_at', since)
    .not('viewer_id', 'is', null)
    .order('created_at', { ascending: false });
  if (error) throw error;

  return (data ?? [])
    .filter((v: any) => v.viewer)
    .map((v: any) => ({
      id: v.viewer.id,
      full_name: v.viewer.full_name,
      avatar_url: v.viewer.avatar_url,
      viewed_at: v.created_at,
      city: v.viewer_city ?? undefined,
    }));
}

export async function fetchHourlyViews(
  teacherId: string,
  since: string,
): Promise<HourlyViewCount[]> {
  const { data, error } = await supabase.rpc('get_view_hours', {
    p_teacher_id: teacherId,
    p_since: since,
  });
  if (error) throw error;
  return (data ?? []) as HourlyViewCount[];
}

export async function fetchCityViews(
  teacherId: string,
  since: string,
): Promise<CityViewCount[]> {
  const { data, error } = await supabase.rpc('get_view_cities', {
    p_teacher_id: teacherId,
    p_since: since,
  });
  if (error) throw error;
  return (data ?? []) as CityViewCount[];
}

export async function fetchContacts(
  teacherId: string,
  since: string,
): Promise<ContactProfile[]> {
  const { data, error } = await supabase
    .from('contact_logs')
    .select(`
      user_id,
      created_at,
      user:profiles!contact_logs_user_id_fkey(id, full_name, avatar_url)
    `)
    .eq('teacher_id', teacherId)
    .gte('created_at', since)
    .order('created_at', { ascending: false });
  if (error) throw error;

  return (data ?? [])
    .filter((c: any) => c.user)
    .map((c: any) => ({
      id: c.user.id,
      full_name: c.user.full_name,
      avatar_url: c.user.avatar_url,
      contacted_at: c.created_at,
    }));
}
