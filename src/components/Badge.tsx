import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../constants/colors';

type BadgeVariant = 'navy' | 'orange' | 'gray' | 'green';

interface BadgeProps {
  label: string;
  variant: BadgeVariant;
}

const VARIANT_STYLES: Record<BadgeVariant, { bg: string; text: string }> = {
  navy: { bg: Colors.navyLight, text: Colors.navy },
  orange: { bg: Colors.orangeLight, text: Colors.orange },
  gray: { bg: Colors.border, text: Colors.textSecondary },
  green: { bg: Colors.successLight, text: Colors.success },
};

export default function Badge({ label, variant }: BadgeProps) {
  const colors = VARIANT_STYLES[variant];

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 100,
    alignSelf: 'flex-start',
    marginRight: 6,
    marginBottom: 4,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
  },
});
