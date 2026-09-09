import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { Colors } from '../constants/colors';
import { fetchReviews } from '../services/reviewService';
import { getInitials } from '../utils/formatters';
import type { Review } from '../types/super';
import StarRating from './StarRating';

interface ReviewSectionProps {
  teacherId: string;
  avgRating: number;
  reviewCount: number;
}

export default function ReviewSection({ teacherId, avgRating, reviewCount }: ReviewSectionProps) {
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    fetchReviews(teacherId).then(setReviews).catch(() => {});
  }, [teacherId]);

  if (reviewCount === 0 && reviews.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Yorumlar</Text>
        <Text style={styles.emptyText}>Henüz yorum yapılmamış.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Yorumlar</Text>

      {/* Average Rating Summary */}
      <View style={styles.summaryRow}>
        <Text style={styles.avgRating}>{avgRating.toFixed(1)}</Text>
        <StarRating rating={avgRating} size={20} />
        <Text style={styles.countText}>({reviewCount} yorum)</Text>
      </View>

      {/* Review List */}
      {reviews.map((review) => (
        <View key={review.id} style={styles.reviewCard}>
          <View style={styles.reviewHeader}>
            {review.reviewer?.avatar_url ? (
              <Image source={{ uri: review.reviewer.avatar_url }} style={styles.reviewerAvatar} />
            ) : (
              <View style={[styles.reviewerAvatar, styles.reviewerAvatarPlaceholder]}>
                <Text style={styles.reviewerInitials}>
                  {getInitials(review.reviewer?.full_name ?? '')}
                </Text>
              </View>
            )}
            <View style={styles.reviewerInfo}>
              <Text style={styles.reviewerName}>{review.reviewer?.full_name ?? 'Anonim'}</Text>
              <StarRating rating={review.rating} size={14} />
            </View>
            <Text style={styles.reviewDate}>
              {new Date(review.created_at).toLocaleDateString('tr-TR')}
            </Text>
          </View>
          {review.comment ? (
            <Text style={styles.reviewComment}>{review.comment}</Text>
          ) : null}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  avgRating: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  countText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textTertiary,
  },
  reviewCard: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviewerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  reviewerAvatarPlaceholder: {
    backgroundColor: Colors.navyLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewerInitials: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.navy,
  },
  reviewerInfo: {
    flex: 1,
    marginLeft: 10,
    gap: 2,
  },
  reviewerName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  reviewDate: {
    fontSize: 12,
    color: Colors.textTertiary,
  },
  reviewComment: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginTop: 10,
  },
});
