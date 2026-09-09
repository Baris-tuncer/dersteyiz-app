import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../constants/colors';
import { fetchAvailability } from '../services/availabilityService';
import type { TeacherAvailability } from '../types/super';

const DAY_LABELS = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];

interface AvailabilityCalendarProps {
  teacherId: string;
}

function formatTime(time: string): string {
  return time.slice(0, 5); // "HH:MM:SS" -> "HH:MM"
}

export default function AvailabilityCalendar({ teacherId }: AvailabilityCalendarProps) {
  const [slots, setSlots] = useState<TeacherAvailability[]>([]);

  useEffect(() => {
    fetchAvailability(teacherId).then(setSlots).catch(() => {});
  }, [teacherId]);

  if (slots.length === 0) return null;

  // Group by day
  const byDay: Record<number, TeacherAvailability[]> = {};
  for (const slot of slots) {
    if (!byDay[slot.day_of_week]) byDay[slot.day_of_week] = [];
    byDay[slot.day_of_week].push(slot);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Müsaitlik Takvimi</Text>
      <Text style={styles.hint}>Aşağıdaki saatler, öğretmenin müsait olduğu zaman aralıklarını gösterir.</Text>
      <View style={styles.grid}>
        {[1, 2, 3, 4, 5, 6, 0].map((day) => {
          const daySlots = byDay[day] ?? [];
          return (
            <View key={day} style={styles.dayColumn}>
              <Text style={styles.dayLabel}>{DAY_LABELS[day]}</Text>
              {daySlots.length > 0 ? (
                daySlots.map((s) => (
                  <View key={s.id} style={styles.slotBadge}>
                    <Text style={styles.slotTime}>{formatTime(s.start_time)}</Text>
                    <Text style={styles.slotDivider}>–</Text>
                    <Text style={styles.slotTime}>{formatTime(s.end_time)}</Text>
                  </View>
                ))
              ) : (
                <Text style={styles.emptySlot}>-</Text>
              )}
            </View>
          );
        })}
      </View>
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
    marginBottom: 4,
  },
  hint: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  grid: {
    flexDirection: 'row',
    gap: 4,
  },
  dayColumn: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  dayLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  slotBadge: {
    backgroundColor: Colors.navyLight,
    borderRadius: 6,
    paddingHorizontal: 4,
    paddingVertical: 4,
    alignItems: 'center',
  },
  slotTime: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.navy,
  },
  slotDivider: {
    fontSize: 8,
    color: Colors.textTertiary,
    lineHeight: 10,
  },
  emptySlot: {
    fontSize: 12,
    color: Colors.textTertiary,
    marginTop: 4,
  },
});
