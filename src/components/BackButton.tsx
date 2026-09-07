import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../constants/colors';

interface BackButtonProps {
  label?: string;
  onPress?: () => void;
}

export function BackButton({ label = 'Geri', onPress }: BackButtonProps) {
  const navigation = useNavigation();

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  return (
    <TouchableOpacity style={styles.container} onPress={handlePress} activeOpacity={0.7}>
      <Text style={styles.arrow}>{'<'}</Text>
      <Text style={styles.label}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 8,
  },
  arrow: {
    fontSize: 18,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  label: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
});
