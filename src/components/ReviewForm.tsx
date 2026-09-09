import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Colors } from '../constants/colors';
import { createReview } from '../services/reviewService';
import StarRating from './StarRating';

interface ReviewFormProps {
  teacherId: string;
  reviewerId: string;
  onReviewSubmitted: () => void;
}

export default function ReviewForm({ teacherId, reviewerId, onReviewSubmitted }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      Alert.alert('Uyarı', 'Lütfen bir puan verin.');
      return;
    }

    setSubmitting(true);
    try {
      await createReview(teacherId, reviewerId, rating, comment.trim());
      Alert.alert('Teşekkürler', 'Yorumunuz başarıyla gönderildi.');
      setRating(0);
      setComment('');
      onReviewSubmitted();
    } catch (err: any) {
      if (err?.code === '23505') {
        Alert.alert('Bilgi', 'Bu öğretmene zaten yorum yapmışsınız.');
      } else {
        Alert.alert('Hata', 'Yorum gönderilemedi. Lütfen tekrar deneyin.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Yorum Yap</Text>

      <View style={styles.ratingRow}>
        <Text style={styles.ratingLabel}>Puanınız:</Text>
        <StarRating rating={rating} size={28} interactive onRate={setRating} />
      </View>

      <TextInput
        style={styles.input}
        value={comment}
        onChangeText={setComment}
        placeholder="Yorumunuzu yazın (isteğe bağlı)..."
        placeholderTextColor={Colors.textTertiary}
        multiline
        numberOfLines={3}
        textAlignVertical="top"
        maxLength={500}
      />

      <TouchableOpacity
        style={[styles.submitButton, (submitting || rating === 0) && styles.submitButtonDisabled]}
        onPress={handleSubmit}
        activeOpacity={0.8}
        disabled={submitting || rating === 0}
      >
        {submitting ? (
          <ActivityIndicator color={Colors.textOnDark} />
        ) : (
          <Text style={styles.submitText}>Gönder</Text>
        )}
      </TouchableOpacity>
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
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  ratingLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  input: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: Colors.textPrimary,
    minHeight: 80,
    lineHeight: 20,
    marginBottom: 12,
  },
  submitButton: {
    backgroundColor: Colors.navy,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textOnDark,
  },
});
