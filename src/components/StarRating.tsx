import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface StarRatingProps {
  rating: number;
  size?: number;
  color?: string;
  interactive?: boolean;
  onRate?: (rating: number) => void;
}

export default function StarRating({
  rating,
  size = 18,
  color = '#F59E0B',
  interactive = false,
  onRate,
}: StarRatingProps) {
  const stars = [1, 2, 3, 4, 5];

  const getStarName = (star: number): 'star' | 'star-half' | 'star-outline' => {
    if (rating >= star) return 'star';
    if (rating >= star - 0.5) return 'star-half';
    return 'star-outline';
  };

  return (
    <View style={styles.container}>
      {stars.map((star) =>
        interactive ? (
          <TouchableOpacity
            key={star}
            onPress={() => onRate?.(star)}
            activeOpacity={0.6}
            hitSlop={4}
          >
            <Ionicons name={getStarName(star)} size={size} color={color} />
          </TouchableOpacity>
        ) : (
          <Ionicons key={star} name={getStarName(star)} size={size} color={color} />
        ),
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
});
