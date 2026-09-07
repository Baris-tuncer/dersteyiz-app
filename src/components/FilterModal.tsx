import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  FlatList,
  TextInput,
  StyleSheet,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';

interface FilterOption {
  label: string;
  value: string | number;
}

interface FilterModalProps {
  visible: boolean;
  title: string;
  options: FilterOption[];
  selectedValues: (string | number)[];
  multiSelect?: boolean;
  showCustomInput?: boolean;
  onSelectMulti: (values: (string | number)[]) => void;
  onClose: () => void;
}

export default function FilterModal({
  visible,
  title,
  options,
  selectedValues,
  multiSelect = false,
  showCustomInput = false,
  onSelectMulti,
  onClose,
}: FilterModalProps) {
  const [localSelection, setLocalSelection] = useState<(string | number)[]>(selectedValues);
  const [customText, setCustomText] = useState('');
  const [customOptions, setCustomOptions] = useState<FilterOption[]>([]);

  const handleToggle = (value: string | number) => {
    if (multiSelect) {
      setLocalSelection((prev) =>
        prev.includes(value)
          ? prev.filter((v) => v !== value)
          : [...prev, value],
      );
    } else {
      // Single select: select and close immediately
      const newValue = selectedValues.includes(value) ? [] : [value];
      onSelectMulti(newValue);
      onClose();
    }
  };

  const handleApply = () => {
    onSelectMulti(localSelection);
    onClose();
  };

  const handleClear = () => {
    setLocalSelection([]);
  };

  const handleAddCustom = () => {
    const trimmed = customText.trim();
    if (!trimmed) return;
    // Check if already exists in options or custom options
    const allOpts = [...options, ...customOptions];
    const exists = allOpts.some((o) => o.label.toLowerCase() === trimmed.toLowerCase());
    if (exists) {
      setCustomText('');
      return;
    }
    // Create a negative ID to distinguish from real tags
    const newId = -(customOptions.length + 1);
    const newOption: FilterOption = { label: trimmed, value: newId };
    setCustomOptions((prev) => [...prev, newOption]);
    setLocalSelection((prev) => [...prev, newId]);
    setCustomText('');
  };

  const allOptions = [...options, ...customOptions];

  const isSelected = (value: string | number) => {
    return multiSelect
      ? localSelection.includes(value)
      : selectedValues.includes(value);
  };

  const selectionCount = multiSelect ? localSelection.length : 0;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={() => {}}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <TouchableOpacity onPress={onClose} hitSlop={12}>
              <Ionicons name="close" size={22} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Multi-select hint */}
          {multiSelect && (
            <View style={styles.hintRow}>
              <Ionicons name="information-circle-outline" size={16} color={Colors.textTertiary} />
              <Text style={styles.hintText}>Birden fazla seçebilirsiniz</Text>
              {selectionCount > 0 && (
                <TouchableOpacity onPress={handleClear} activeOpacity={0.7}>
                  <Text style={styles.clearLink}>Temizle</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* Divider */}
          <View style={styles.divider} />

          {/* Options */}
          <FlatList
            data={allOptions}
            keyExtractor={(item) => String(item.value)}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.optionRow,
                  isSelected(item.value) && styles.optionRowSelected,
                ]}
                onPress={() => handleToggle(item.value)}
                activeOpacity={0.6}
              >
                {multiSelect && (
                  <View style={[styles.checkbox, isSelected(item.value) && styles.checkboxActive]}>
                    {isSelected(item.value) && (
                      <Ionicons name="checkmark" size={14} color={Colors.textOnDark} />
                    )}
                  </View>
                )}
                <Text
                  style={[
                    styles.optionText,
                    isSelected(item.value) && styles.optionTextSelected,
                  ]}
                >
                  {item.label}
                </Text>
                {!multiSelect && isSelected(item.value) && (
                  <Ionicons name="checkmark" size={20} color={Colors.navy} style={styles.singleCheck} />
                )}
              </TouchableOpacity>
            )}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            ListFooterComponent={
              showCustomInput ? (
                <View style={styles.customInputContainer}>
                  <View style={styles.customInputDivider} />
                  <Text style={styles.customInputLabel}>Kendiniz ekleyin</Text>
                  <View style={styles.customInputRow}>
                    <TextInput
                      style={styles.customInput}
                      placeholder="Etiket yazin..."
                      placeholderTextColor={Colors.textTertiary}
                      value={customText}
                      onChangeText={setCustomText}
                      returnKeyType="done"
                      onSubmitEditing={handleAddCustom}
                    />
                    <TouchableOpacity
                      style={[
                        styles.customAddButton,
                        !customText.trim() && styles.customAddButtonDisabled,
                      ]}
                      onPress={handleAddCustom}
                      disabled={!customText.trim()}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="add" size={20} color={Colors.textOnDark} />
                    </TouchableOpacity>
                  </View>
                </View>
              ) : null
            }
          />

          {/* Apply button (multi-select only) */}
          {multiSelect && (
            <View style={styles.footer}>
              <TouchableOpacity
                style={styles.applyButton}
                onPress={handleApply}
                activeOpacity={0.8}
              >
                <Text style={styles.applyButtonText}>
                  Uygula{selectionCount > 0 ? ` (${selectionCount})` : ''}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '70%',
    paddingBottom: 34,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    flex: 1,
  },
  hintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 12,
    gap: 6,
  },
  hintText: {
    fontSize: 13,
    color: Colors.textTertiary,
    flex: 1,
  },
  clearLink: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.error,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
  },
  listContent: {
    paddingVertical: 8,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  optionRowSelected: {
    backgroundColor: Colors.navyLight,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: Colors.borderDark,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    marginRight: 12,
  },
  checkboxActive: {
    backgroundColor: Colors.navy,
    borderColor: Colors.navy,
  },
  optionText: {
    fontSize: 16,
    color: Colors.textPrimary,
    flex: 1,
  },
  optionTextSelected: {
    fontWeight: '700',
    color: Colors.navy,
  },
  singleCheck: {
    marginLeft: 12,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  applyButton: {
    backgroundColor: Colors.navy,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textOnDark,
  },
  customInputContainer: {
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  customInputDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginBottom: 12,
  },
  customInputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  customInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  customInput: {
    flex: 1,
    fontSize: 15,
    color: Colors.textPrimary,
    backgroundColor: Colors.background,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.borderDark,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  customAddButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: Colors.navy,
    alignItems: 'center',
    justifyContent: 'center',
  },
  customAddButtonDisabled: {
    backgroundColor: Colors.borderDark,
  },
});
