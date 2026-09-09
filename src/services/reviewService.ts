import { supabase } from '../config/supabase';
import type { Review } from '../types/super';

export async function fetchReviews(teacherId: string): Promise<Review[]> {
  const { data, error } = await supabase
    .from('reviews')
    .select(`
      *,
      reviewer:profiles!reviews_reviewer_id_fkey(full_name, avatar_url)
    `)
    .eq('teacher_id', teacherId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as Review[];
}

export async function createReview(
  teacherId: string,
  reviewerId: string,
  rating: number,
  comment: string,
): Promise<Review> {
  const { data, error } = await supabase
    .from('reviews')
    .insert({
      teacher_id: teacherId,
      reviewer_id: reviewerId,
      rating,
      comment,
    })
    .select()
    .single();
  if (error) throw error;

  // Send push notification to teacher (non-blocking)
  supabase.functions.invoke('send-review-notification', {
    body: { teacher_id: teacherId, reviewer_id: reviewerId, rating },
  }).catch(() => {});

  return data as Review;
}

export async function updateReview(
  reviewId: string,
  rating: number,
  comment: string,
): Promise<void> {
  const { error } = await supabase
    .from('reviews')
    .update({ rating, comment })
    .eq('id', reviewId);
  if (error) throw error;
}

export async function deleteReview(reviewId: string): Promise<void> {
  const { error } = await supabase
    .from('reviews')
    .delete()
    .eq('id', reviewId);
  if (error) throw error;
}

export async function hasReviewed(teacherId: string, reviewerId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('reviews')
    .select('id')
    .eq('teacher_id', teacherId)
    .eq('reviewer_id', reviewerId)
    .maybeSingle();
  if (error) throw error;
  return data !== null;
}

/**
 * Check if this parent can review this teacher.
 * Requires: contacted via WhatsApp (contact_logs) OR accepted trial request.
 */
export async function canReview(teacherId: string, parentId: string): Promise<boolean> {
  // Already reviewed?
  const alreadyReviewed = await hasReviewed(teacherId, parentId);
  if (alreadyReviewed) return false;

  // Check contact_logs
  const { data: contact } = await supabase
    .from('contact_logs')
    .select('id')
    .eq('teacher_id', teacherId)
    .eq('user_id', parentId)
    .limit(1)
    .maybeSingle();
  if (contact) return true;

  // Check accepted trial requests
  const { data: trial } = await supabase
    .from('trial_requests')
    .select('id')
    .eq('teacher_id', teacherId)
    .eq('parent_id', parentId)
    .eq('status', 'accepted')
    .limit(1)
    .maybeSingle();
  if (trial) return true;

  return false;
}
