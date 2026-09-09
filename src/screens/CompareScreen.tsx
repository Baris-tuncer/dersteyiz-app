import React from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import { formatPrice, getInitials } from '../utils/formatters';
import { useCompare } from '../contexts/CompareContext';
import StarRating from '../components/StarRating';

export default function CompareScreen() {
  const navigation = useNavigation<any>();
  const { compareList, clearCompare } = useCompare();

  if (compareList.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Karşılaştırmak için öğretmen seçilmedi.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const rows: { label: string; getValue: (t: typeof compareList[0]) => string }[] = [
    { label: 'Branş', getValue: (t) => t.major },
    { label: 'Üniversite', getValue: (t) => t.university || '-' },
    { label: 'Fiyat', getValue: (t) => formatPrice(t.hourly_rate) + ' /saat' },
    {
      label: 'Mod',
      getValue: (t) => {
        const modeLabels: string[] = [];
        if (t.modes.some((m) => m.mode === 'online')) modeLabels.push('Online');
        if (t.modes.some((m) => m.mode === 'face_to_face')) modeLabels.push('Yüz Yüze');
        return modeLabels.join(', ') || '-';
      },
    },
    {
      label: 'Konum',
      getValue: (t) =>
        t.locations.length > 0
          ? t.locations.map((l) => `${l.district}, ${l.city}`).join(' · ')
          : '-',
    },
    { label: 'Puan', getValue: (t) => t.avg_rating > 0 ? `${t.avg_rating.toFixed(1)} (${t.review_count})` : '-' },
    { label: 'Deneyim', getValue: (t) => t.experience_years > 0 ? `${t.experience_years} yıl` : '-' },
    { label: 'Görüntülenme', getValue: (t) => String(t.view_count) },
    { label: 'Onaylı', getValue: (t) => t.is_verified ? 'Evet' : 'Hayır' },
    { label: 'Video', getValue: (t) => t.video_url ? 'Var' : 'Yok' },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.screen} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Teacher Headers */}
        <View style={styles.headerRow}>
          <View style={styles.labelCell} />
          {compareList.map((teacher) => (
            <TouchableOpacity
              key={teacher.profile_id}
              style={styles.teacherHeader}
              onPress={() => navigation.navigate('TeacherDetail', { teacherId: teacher.profile_id })}
              activeOpacity={0.7}
            >
              {teacher.profile?.avatar_url ? (
                <Image source={{ uri: teacher.profile.avatar_url }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatar, styles.avatarPlaceholder]}>
                  <Text style={styles.avatarInitials}>
                    {getInitials(teacher.profile?.full_name ?? '')}
                  </Text>
                </View>
              )}
              <View style={styles.nameVerifiedRow}>
                <Text style={styles.teacherName} numberOfLines={2}>
                  {teacher.profile?.full_name ?? ''}
                </Text>
                {teacher.is_verified && (
                  <MaterialIcons name="verified" size={14} color={Colors.navy} />
                )}
              </View>
              {teacher.avg_rating > 0 && (
                <StarRating rating={teacher.avg_rating} size={12} />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Comparison Rows */}
        {rows.map((row, index) => (
          <View
            key={row.label}
            style={[styles.row, index % 2 === 0 && styles.rowAlt]}
          >
            <Text style={styles.rowLabel}>{row.label}</Text>
            {compareList.map((teacher) => (
              <Text key={teacher.profile_id} style={styles.rowValue}>
                {row.getValue(teacher)}
              </Text>
            ))}
          </View>
        ))}

        {/* Clear Button */}
        <TouchableOpacity
          style={styles.clearButton}
          onPress={() => {
            clearCompare();
            navigation.goBack();
          }}
          activeOpacity={0.7}
        >
          <Ionicons name="trash-outline" size={16} color={Colors.error} />
          <Text style={styles.clearText}>Karşılaştırmayı Temizle</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  screen: {
    flex: 1,
  },
  content: {
    paddingBottom: 40,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 15,
    color: Colors.textSecondary,
  },
  headerRow: {
    flexDirection: 'row',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  labelCell: {
    width: 90,
  },
  teacherHeader: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 4,
    gap: 4,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
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
  nameVerifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  teacherName: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'center',
    flexShrink: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  rowAlt: {
    backgroundColor: Colors.surface,
  },
  rowLabel: {
    width: 90,
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  rowValue: {
    flex: 1,
    fontSize: 13,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    marginTop: 20,
    gap: 8,
  },
  clearText: {
    fontSize: 14,
    color: Colors.error,
    fontWeight: '600',
  },
});
