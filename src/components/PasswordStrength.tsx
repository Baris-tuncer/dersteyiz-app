import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { validatePassword } from '../utils/validation';
import { Colors } from '../constants/colors';

interface PasswordStrengthProps {
  password: string;
}

interface RuleItemProps {
  passed: boolean;
  label: string;
}

function RuleItem({ passed, label }: RuleItemProps) {
  return (
    <View style={styles.ruleRow}>
      <Ionicons
        name={passed ? 'checkmark-circle' : 'close-circle'}
        size={16}
        color={passed ? Colors.success : Colors.error}
        style={styles.icon}
      />
      <Text style={[styles.ruleText, passed ? styles.textPass : styles.textFail]}>
        {label}
      </Text>
    </View>
  );
}

export function PasswordStrength({ password }: PasswordStrengthProps) {
  const validation = validatePassword(password);

  const rules: { key: keyof typeof validation; label: string }[] = [
    { key: 'minLength', label: 'En az 6 karakter' },
    { key: 'hasUppercase', label: 'Bir b\u00fcy\u00fck harf (A-Z)' },
    { key: 'hasLowercase', label: 'Bir k\u00fc\u00e7\u00fck harf (a-z)' },
    { key: 'hasNumber', label: 'Bir rakam (0-9)' },
    { key: 'hasSymbol', label: 'Bir \u00f6zel karakter (!@#$...)' },
  ];

  if (!password) return null;

  return (
    <View style={styles.container}>
      {rules.map((rule) => (
        <RuleItem
          key={rule.key}
          passed={validation[rule.key]}
          label={rule.label}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
    paddingHorizontal: 4,
    gap: 4,
  },
  ruleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  icon: {
    fontSize: 14,
    fontWeight: '700',
    width: 18,
    textAlign: 'center',
  },
  iconPass: {
    color: Colors.success,
  },
  iconFail: {
    color: Colors.error,
  },
  ruleText: {
    fontSize: 13,
  },
  textPass: {
    color: Colors.success,
  },
  textFail: {
    color: Colors.textSecondary,
  },
});
