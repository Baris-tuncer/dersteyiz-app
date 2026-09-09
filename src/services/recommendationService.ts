import { supabase } from '../config/supabase';

export async function fetchRecommendations(
  userId: string,
  limit: number = 10,
): Promise<string[]> {
  const { data, error } = await supabase.rpc('get_recommendations', {
    p_user_id: userId,
    p_limit: limit,
  });
  if (error) throw error;
  return (data ?? []) as string[];
}
