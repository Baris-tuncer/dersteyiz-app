import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import { fetchAvailability, setAvailability } from '../services/availabilityService';

const DAY_LABELS = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
const HOURS = Array.from({ length: 15 }, (_, i) => i + 8); // 08:00 - 22:00

interface Slot {
  day_of_week: number;
  start_time: string;
  end_time: string;
}

interface AvailabilityEditorProps {
  teacherId: string;
}

export default function AvailabilityEditor({ teacherId }: AvailabilityEditorProps) {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAvailability(teacherId)
      .then((data) => {
        setSlots(
          data.map((d) => ({
            day_of_week: d.day_of_week,
            start_time: d.start_time,
            end_time: d.end_time,
          })),
        );
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [teacherId]);

  const isSlotActive = (day: number, hour: number) => {
    const timeStr = `${String(hour).padStart(2, '0')}:00:00`;
    return slots.some(
      (s) =>
        s.day_of_week === day && s.start_time <= timeStr && s.end_time > timeStr,
    );
  };

  const toggleHour = (day: number, hour: number) => {
    const timeStr = `${String(hour).padStart(2, '0')}:00:00`;
    const nextTime = `${String(hour + 1).padStart(2, '0')}:00:00`;

    // Check if this hour is within an existing slot
    const existingIdx = slots.findIndex(
      (s) => s.day_of_week === day && s.start_time <= timeStr && s.end_time > timeStr,
    );

    if (existingIdx >= 0) {
      // Remove this hour from existing slot - simplify by removing and re-adding
      const existing = slots[existingIdx];
      const newSlots = slots.filter((_, i) => i !== existingIdx);

      // If the slot is exactly this hour, just remove it
      if (existing.start_time === timeStr && existing.end_time === nextTime) {
        setSlots(newSlots);
        return;
      }

      // Split if needed
      if (existing.start_time < timeStr) {
        newSlots.push({
          day_of_week: day,
          start_time: existing.start_time,
          end_time: timeStr,
        });
      }
      if (existing.end_time > nextTime) {
        newSlots.push({
          day_of_week: day,
          start_time: nextTime,
          end_time: existing.end_time,
        });
      }

      setSlots(newSlots);
    } else {
      // Add new 1-hour slot and merge adjacent
      const newSlots = [...slots, { day_of_week: day, start_time: timeStr, end_time: nextTime }];

      // Merge adjacent slots for the same day
      const daySlots = newSlots
        .filter((s) => s.day_of_week === day)
        .sort((a, b) => a.start_time.localeCompare(b.start_time));
      const otherSlots = newSlots.filter((s) => s.day_of_week !== day);

      const merged: Slot[] = [];
      for (const s of daySlots) {
        const last = merged[merged.length - 1];
        if (last && last.end_time >= s.start_time) {
          last.end_time = s.end_time > last.end_time ? s.end_time : last.end_time;
        } else {
          merged.push({ ...s });
        }
      }

      setSlots([...otherSlots, ...merged]);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await setAvailability(teacherId, slots);
      Alert.alert('Kaydedildi', 'Müsaitlik takviminiz güncellendi.');
    } catch {
      Alert.alert('Hata', 'Müsaitlik kaydedilemedi.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color={Colors.navy} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Müsaitlik Takvimi</Text>
      <Text style={styles.hint}>Müsait olduğunuz saatlere dokunarak seçin.</Text>

      {/* Grid Header */}
      <View style={styles.gridHeader}>
        <View style={styles.hourLabelSpace} />
        {[1, 2, 3, 4, 5, 6, 0].map((day) => (
          <Text key={day} style={styles.dayHeaderText}>
            {DAY_LABELS[day].slice(0, 3)}
          </Text>
        ))}
      </View>

      {/* Grid Body */}
      {HOURS.map((hour) => (
        <View key={hour} style={styles.gridRow}>
          <Text style={styles.hourLabel}>{String(hour).padStart(2, '0')}:00</Text>
          {[1, 2, 3, 4, 5, 6, 0].map((day) => {
            const active = isSlotActive(day, hour);
            return (
              <TouchableOpacity
                key={`${day}-${hour}`}
                style={[styles.cell, active && styles.cellActive]}
                onPress={() => toggleHour(day, hour)}
                activeOpacity={0.6}
              />
            );
          })}
        </View>
      ))}

      <TouchableOpacity
        style={[styles.saveButton, saving && styles.saveButtonDisabled]}
        onPress={handleSave}
        activeOpacity={0.8}
        disabled={saving}
      >
        {saving ? (
          <ActivityIndicator color={Colors.textOnDark} />
        ) : (
          <>
            <Ionicons name="checkmark" size={18} color={Colors.textOnDark} />
            <Text style={styles.saveText}>Müsaitliği Kaydet</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
  },
  loadingContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  hint: {
    fontSize: 13,
    color: Colors.textTertiary,
    marginBottom: 12,
  },
  gridHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  hourLabelSpace: {
    width: 44,
  },
  dayHeaderText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  gridRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  hourLabel: {
    width: 44,
    fontSize: 11,
    color: Colors.textTertiary,
    fontWeight: '500',
  },
  cell: {
    flex: 1,
    height: 24,
    backgroundColor: Colors.border,
    borderRadius: 4,
    marginHorizontal: 1,
  },
  cellActive: {
    backgroundColor: Colors.navy,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.navy,
    borderRadius: 12,
    paddingVertical: 14,
    marginTop: 16,
    gap: 8,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textOnDark,
  },
});
