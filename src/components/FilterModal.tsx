import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  FlatList,
  SectionList,
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

interface FilterGroup {
  title: string;
  items: FilterOption[];
}

interface FilterModalProps {
  visible: boolean;
  title: string;
  options: FilterOption[];
  selectedValues: (string | number)[];
  multiSelect?: boolean;
  showCustomInput?: boolean;
  searchable?: boolean;
  groups?: FilterGroup[];
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
  searchable = false,
  groups,
  onSelectMulti,
  onClose,
}: FilterModalProps) {
  const [localSelection, setLocalSelection] = useState<(string | number)[]>(selectedValues);
  const [customText, setCustomText] = useState('');
  const [customOptions, setCustomOptions] = useState<FilterOption[]>([]);
  const [searchText, setSearchText] = useState('');

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
    const allOpts = [...options, ...customOptions];
    const exists = allOpts.some((o) => o.label.toLowerCase() === trimmed.toLowerCase());
    if (exists) {
      setCustomText('');
      return;
    }
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

  // Search filtering
  const query = searchText.toLowerCase();
  const isSearching = searchable && searchText.length >= 3;

  const filteredOptions = useMemo(() => {
    if (!isSearching) return allOptions;
    return allOptions.filter((o) => o.label.toLowerCase().includes(query));
  }, [allOptions, isSearching, query]);

  const filteredGroups = useMemo(() => {
    if (!groups) return undefined;
    const source = groups;
    if (!isSearching) return source;
    return source
      .map((g) => ({
        ...g,
        items: g.items.filter((item) => item.label.toLowerCase().includes(query)),
      }))
      .filter((g) => g.items.length > 0);
  }, [groups, isSearching, query]);

  // SectionList data format
  const sections = useMemo(() => {
    if (!filteredGroups) return [];
    return filteredGroups.map((g) => ({
      title: g.title,
      data: g.items,
    }));
  }, [filteredGroups]);

  const renderOption = (item: FilterOption) => (
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
  );

  const customFooter = showCustomInput ? (
    <View style={styles.customInputContainer}>
      <View style={styles.customInputDivider} />
      <Text style={styles.customInputLabel}>Kendiniz ekleyin</Text>
      <View style={styles.customInputRow}>
        <TextInput
          style={styles.customInput}
          placeholder="Etiket yazın..."
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
  ) : null;

  const useGrouped = !!filteredGroups && filteredGroups.length > 0;

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

          {/* Search */}
          {searchable && (
            <View style={styles.searchRow}>
              <Ionicons name="search" size={16} color={Colors.textTertiary} />
              <TextInput
                style={styles.searchInput}
                placeholder="Ara..."
                placeholderTextColor={Colors.textTertiary}
                value={searchText}
                onChangeText={setSearchText}
                autoCorrect={false}
                returnKeyType="search"
              />
              {searchText.length > 0 && (
                <TouchableOpacity onPress={() => setSearchText('')} hitSlop={8}>
                  <Ionicons name="close-circle" size={16} color={Colors.textTertiary} />
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* Divider */}
          <View style={styles.divider} />

          {/* Options — grouped or flat */}
          {useGrouped ? (
            <SectionList
              sections={sections}
              keyExtractor={(item) => String(item.value)}
              renderSectionHeader={({ section }) => (
                <Text style={styles.sectionHeader}>{section.title}</Text>
              )}
              renderItem={({ item }) => renderOption(item)}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContent}
              stickySectionHeadersEnabled={false}
              ListEmptyComponent={
                isSearching ? (
                  <Text style={styles.emptyText}>Sonuç bulunamadı</Text>
                ) : null
              }
              ListFooterComponent={customFooter}
            />
          ) : (
            <FlatList
              data={filteredOptions}
              keyExtractor={(item) => String(item.value)}
              renderItem={({ item }) => renderOption(item)}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContent}
              ListEmptyComponent={
                isSearching ? (
                  <Text style={styles.emptyText}>Sonuç bulunamadı</Text>
                ) : null
              }
              ListFooterComponent={customFooter}
            />
          )}

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
    paddingBottom: 8,
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
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 8,
    backgroundColor: Colors.background,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 10,
    height: 38,
    gap: 6,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: Colors.textPrimary,
    paddingVertical: 0,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
  },
  listContent: {
    paddingVertical: 8,
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textSecondary,
    backgroundColor: Colors.background,
    paddingHorizontal: 20,
    paddingVertical: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
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
  emptyText: {
    fontSize: 14,
    color: Colors.textTertiary,
    textAlign: 'center',
    paddingVertical: 24,
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
