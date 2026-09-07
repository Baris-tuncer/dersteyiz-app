import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  StyleSheet,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Colors } from '../constants/colors';
import { useAuth } from '../contexts/AuthContext';
import { submitReport } from '../services/reportService';
import type { RootStackParamList } from '../types/navigation';

type RouteProps = NativeStackScreenProps<RootStackParamList, 'Report'>['route'];

const REPORT_REASONS = [
  'Uygunsuz içerik',
  'Sahte profil',
  'Taciz / Kötü davranış',
  'Diğer',
] as const;

export default function ReportScreen() {
  const route = useRoute<RouteProps>();
  const navigation = useNavigation();
  const { state } = useAuth();
  const { teacherId } = route.params;

  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = selectedReason !== null && description.trim().length > 0 && !submitting;

  const handleSubmit = async () => {
    if (!canSubmit || !selectedReason) return;

    const userId = state.user?.id;
    if (!userId) {
      Alert.alert('Hata', 'Şikâyet göndermek için giriş yapmalısınız.');
      return;
    }

    setSubmitting(true);
    try {
      await submitReport({
        reporter_id: userId,
        teacher_id: teacherId,
        reason: selectedReason,
        description: description.trim(),
      });

      Alert.alert(
        'Şikâyet Gönderildi',
        'Şikâyetiniz başarıyla iletildi. En kısa sürede incelenecektir.',
        [
          {
            text: 'Tamam',
            onPress: () => navigation.goBack(),
          },
        ],
      );
    } catch (error: any) {
      Alert.alert(
        'Hata',
        error?.message || 'Şikâyet gönderilemedi. Lütfen tekrar deneyin.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>Öğretmeni Şikayet Et</Text>
      <Text style={styles.subtitle}>
        Lütfen şikayet nedeninizi seçin ve detayları açıklayın.
      </Text>

      {/* Reason Selector */}
      <View style={styles.reasonsContainer}>
        <Text style={styles.sectionLabel}>Şikayet Nedeni</Text>
        {REPORT_REASONS.map((reason) => {
          const isSelected = selectedReason === reason;
          return (
            <TouchableOpacity
              key={reason}
              style={styles.reasonRow}
              onPress={() => setSelectedReason(reason)}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.radioOuter,
                  isSelected && styles.radioOuterSelected,
                ]}
              >
                {isSelected && <View style={styles.radioInner} />}
              </View>
              <Text
                style={[
                  styles.reasonText,
                  isSelected && styles.reasonTextSelected,
                ]}
              >
                {reason}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Description */}
      <View style={styles.descriptionContainer}>
        <Text style={styles.sectionLabel}>Açıklama</Text>
        <TextInput
          style={styles.descriptionInput}
          value={description}
          onChangeText={setDescription}
          placeholder="Şikayetinizi detaylı olarak açıklayın..."
          placeholderTextColor={Colors.textTertiary}
          multiline
          numberOfLines={5}
          textAlignVertical="top"
          maxLength={1000}
        />
        <Text style={styles.charCount}>{description.length}/1000</Text>
      </View>

      {/* Submit Button */}
      <TouchableOpacity
        style={[styles.submitButton, !canSubmit && styles.submitButtonDisabled]}
        onPress={handleSubmit}
        activeOpacity={0.8}
        disabled={!canSubmit}
      >
        <Text style={styles.submitButtonText}>Şikayeti Gönder</Text>
      </TouchableOpacity>

      {/* Cancel Button */}
      <TouchableOpacity
        style={styles.cancelButton}
        onPress={handleCancel}
        activeOpacity={0.7}
      >
        <Text style={styles.cancelButtonText}>İptal</Text>
      </TouchableOpacity>

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 40,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    lineHeight: 22,
    marginBottom: 24,
  },
  reasonsContainer: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  reasonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: Colors.borderDark,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  radioOuterSelected: {
    borderColor: Colors.orange,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.orange,
  },
  reasonText: {
    fontSize: 15,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  reasonTextSelected: {
    fontWeight: '600',
    color: Colors.orange,
  },
  descriptionContainer: {
    marginBottom: 28,
  },
  descriptionInput: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 14,
    fontSize: 15,
    color: Colors.textPrimary,
    minHeight: 120,
    lineHeight: 22,
  },
  charCount: {
    fontSize: 12,
    color: Colors.textTertiary,
    textAlign: 'right',
    marginTop: 6,
  },
  submitButton: {
    backgroundColor: Colors.orange,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.textOnDark,
  },
  cancelButton: {
    alignItems: 'center',
    paddingVertical: 14,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  bottomSpacer: {
    height: 20,
  },
});
