import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import { fetchRecommendations } from '../services/recommendationService';
import { fetchTeacher } from '../services/teacherService';
import { formatPrice, getInitials } from '../utils/formatters';
import type { TeacherWithDetails } from '../types/teacher';
import StarRating from './StarRating';

interface RecommendationSectionProps {
  userId: string;
  onTeacherPress: (teacherId: string) => void;
}

export default function RecommendationSection({ userId, onTeacherPress }: RecommendationSectionProps) {
  const [teachers, setTeachers] = useState<TeacherWithDetails[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const ids = await fetchRecommendations(userId, 6);
        if (cancelled || ids.length === 0) return;

        const results = await Promise.all(
          ids.map((id) => fetchTeacher(id)),
        );
        if (!cancelled) {
          setTeachers(results.filter(Boolean) as TeacherWithDetails[]);
        }
      } catch {
        // Silently fail
      }
    }

    load();
    return () => { cancelled = true; };
  }, [userId]);

  if (teachers.length === 0) return null;

  const renderItem = ({ item }: { item: TeacherWithDetails }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onTeacherPress(item.profile_id)}
      activeOpacity={0.7}
    >
      {item.profile?.avatar_url ? (
        <Image source={{ uri: item.profile.avatar_url }} style={styles.avatar} />
      ) : (
        <View style={[styles.avatar, styles.avatarPlaceholder]}>
          <Text style={styles.avatarInitials}>
            {getInitials(item.profile?.full_name ?? '')}
          </Text>
        </View>
      )}
      <Text style={styles.name} numberOfLines={1}>{item.profile?.full_name ?? ''}</Text>
      <Text style={styles.major} numberOfLines={1}>{item.major}</Text>
      {item.avg_rating > 0 && (
        <View style={styles.ratingRow}>
          <StarRating rating={item.avg_rating} size={12} />
          <Text style={styles.ratingText}>{item.avg_rating.toFixed(1)}</Text>
        </View>
      )}
      <Text style={styles.rate}>{formatPrice(item.hourly_rate)}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="sparkles" size={18} color={Colors.orange} />
        <Text style={styles.title}>Senin İçin Önerilen</Text>
      </View>
      <FlatList
        data={teachers}
        renderItem={renderItem}
        keyExtractor={(item) => item.profile_id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 10,
    gap: 6,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  listContent: {
    paddingHorizontal: 16,
    gap: 10,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 12,
    width: 140,
    alignItems: 'center',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginBottom: 8,
  },
  avatarPlaceholder: {
    backgroundColor: Colors.navyLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitials: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.navy,
  },
  name: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  major: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  ratingText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  rate: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.orange,
    marginTop: 4,
  },
});
