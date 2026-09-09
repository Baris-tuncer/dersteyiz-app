import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import { CATEGORIES, MAJORS, TAGS, TEACHING_MODES } from '../constants/categories';
import { TURKEY_CITIES } from '../constants/cities';
import type { TeacherFilters, TeachingMode } from '../types/teacher';
import FilterModal from './FilterModal';

type FilterType = 'category' | 'major' | 'mode' | 'city' | 'tag' | 'price';

interface FilterBarProps {
  filters: TeacherFilters;
  onChange: (filters: TeacherFilters) => void;
}

const PRICE_SORT_OPTIONS = [
  { label: 'Önce en düşük', value: 'asc' },
  { label: 'Önce en yüksek', value: 'desc' },
];

const FILTER_CHIPS: { key: FilterType; label: string }[] = [
  { key: 'category', label: 'Kategori' },
  { key: 'major', label: 'Branş' },
  { key: 'price', label: 'Fiyat' },
  { key: 'mode', label: 'Mod' },
  { key: 'city', label: 'Şehir' },
  { key: 'tag', label: 'Etiket' },
];

function isFilterActive(filters: TeacherFilters, key: FilterType): boolean {
  switch (key) {
    case 'category':
      return filters.categoryIds.length > 0;
    case 'major':
      return filters.majors.length > 0;
    case 'mode':
      return filters.modes.length > 0;
    case 'city':
      return filters.city !== '';
    case 'tag':
      return filters.tagIds.length > 0;
    case 'price':
      return filters.priceSort !== '';
  }
}

function getFilterLabel(filters: TeacherFilters, key: FilterType): string {
  switch (key) {
    case 'category': {
      const count = filters.categoryIds.length;
      if (count === 0) return 'Kategori';
      if (count === 1) {
        const cat = CATEGORIES.find((c) => c.id === filters.categoryIds[0]);
        return cat ? cat.name : 'Kategori';
      }
      return `${count} Kategori`;
    }
    case 'major': {
      const count = filters.majors.length;
      if (count === 0) return 'Branş';
      if (count === 1) return filters.majors[0];
      return `${count} Branş`;
    }
    case 'mode': {
      const count = filters.modes.length;
      if (count === 0) return 'Mod';
      if (count === 1) {
        const m = TEACHING_MODES.find((t) => t.value === filters.modes[0]);
        return m ? m.label : 'Mod';
      }
      return `${count} Mod`;
    }
    case 'city':
      return filters.city || 'Şehir';
    case 'tag': {
      const count = filters.tagIds.length;
      if (count === 0) return 'Etiket';
      if (count === 1) {
        const tag = TAGS.find((t) => t.id === filters.tagIds[0]);
        return tag ? tag.name : 'Etiket';
      }
      return `${count} Etiket`;
    }
    case 'price': {
      if (!filters.priceSort) return 'Fiyat';
      const opt = PRICE_SORT_OPTIONS.find((o) => o.value === filters.priceSort);
      return opt ? opt.label : 'Fiyat';
    }
  }
}

function getModalTitle(key: FilterType): string {
  switch (key) {
    case 'category': return 'Kategori Seçin (birden fazla)';
    case 'major': return 'Branş Seçin (birden fazla)';
    case 'mode': return 'Ders Modu Seçin (birden fazla)';
    case 'city': return 'Şehir Seçin';
    case 'tag': return 'Etiket Seçin (birden fazla)';
    case 'price': return 'Fiyata Göre Sırala';
  }
}

function getModalOptions(key: FilterType): { label: string; value: string | number }[] {
  switch (key) {
    case 'category':
      return CATEGORIES.map((c) => ({ label: c.name, value: c.id }));
    case 'major':
      return MAJORS.map((m) => ({ label: m, value: m }));
    case 'mode':
      return TEACHING_MODES.map((m) => ({ label: m.label, value: m.value }));
    case 'city':
      return TURKEY_CITIES.map((c) => ({ label: c, value: c }));
    case 'tag':
      return TAGS.map((t) => ({ label: t.name, value: t.id }));
    case 'price':
      return PRICE_SORT_OPTIONS;
  }
}

function getFilterCount(filters: TeacherFilters, key: FilterType): number {
  switch (key) {
    case 'category': return filters.categoryIds.length;
    case 'major': return filters.majors.length;
    case 'mode': return filters.modes.length;
    case 'city': return filters.city ? 1 : 0;
    case 'tag': return filters.tagIds.length;
    case 'price': return filters.priceSort ? 1 : 0;
  }
}

function isMultiSelect(key: FilterType): boolean {
  return key !== 'city' && key !== 'price';
}

function getSelectedValues(filters: TeacherFilters, key: FilterType): (string | number)[] {
  switch (key) {
    case 'category': return filters.categoryIds;
    case 'major': return filters.majors;
    case 'mode': return filters.modes;
    case 'city': return filters.city ? [filters.city] : [];
    case 'tag': return filters.tagIds;
    case 'price': return filters.priceSort ? [filters.priceSort] : [];
  }
}

export default function FilterBar({ filters, onChange }: FilterBarProps) {
  const [activeModal, setActiveModal] = useState<FilterType | null>(null);

  const hasAnyFilter =
    filters.categoryIds.length > 0 ||
    filters.majors.length > 0 ||
    filters.modes.length > 0 ||
    filters.city !== '' ||
    filters.tagIds.length > 0 ||
    filters.priceSort !== '' ||
    filters.isVerified ||
    filters.hasVideo ||
    filters.priceMin !== null ||
    filters.priceMax !== null;

  const handleSearchChange = useCallback(
    (text: string) => {
      onChange({ ...filters, search: text });
    },
    [filters, onChange],
  );

  const handleMultiFilterSelect = useCallback(
    (key: FilterType, values: (string | number)[]) => {
      const updated = { ...filters };
      switch (key) {
        case 'category':
          updated.categoryIds = values as number[];
          break;
        case 'major':
          updated.majors = values as string[];
          break;
        case 'mode':
          updated.modes = values as TeachingMode[];
          break;
        case 'city':
          updated.city = (values[0] as string) ?? '';
          break;
        case 'tag':
          updated.tagIds = values as number[];
          break;
        case 'price':
          updated.priceSort = ((values[0] as string) ?? '') as 'asc' | 'desc' | '';
          break;
      }
      onChange(updated);
    },
    [filters, onChange],
  );

  const handleClearAll = useCallback(() => {
    onChange({
      search: filters.search,
      categoryIds: [],
      majors: [],
      modes: [],
      city: '',
      tagIds: [],
      priceSort: '',
      priceMin: null,
      priceMax: null,
      isVerified: false,
      hasVideo: false,
      minExperience: null,
    });
  }, [filters.search, onChange]);

  return (
    <View style={styles.container}>
      {/* Search */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={18} color={Colors.textSecondary} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Öğretmen, branş veya anahtar kelime ara..."
          placeholderTextColor={Colors.textTertiary}
          value={filters.search}
          onChangeText={handleSearchChange}
          returnKeyType="search"
          autoCorrect={false}
        />
        {filters.search.length > 0 && (
          <TouchableOpacity
            onPress={() => handleSearchChange('')}
            hitSlop={8}
          >
            <Ionicons name="close" size={18} color={Colors.textTertiary} style={styles.clearSearch} />
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Chips */}
      <View style={styles.chipContainer}>
        {FILTER_CHIPS.map((chip) => {
          const active = isFilterActive(filters, chip.key);
          const count = getFilterCount(filters, chip.key);
          return (
            <TouchableOpacity
              key={chip.key}
              style={[styles.chip, active && styles.chipActive]}
              onPress={() => setActiveModal(chip.key)}
              activeOpacity={0.7}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>
                {chip.label}
              </Text>
              {count > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{count}</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}

        {/* Toggle Chips */}
        <TouchableOpacity
          style={[styles.chip, filters.isVerified && styles.chipActive]}
          onPress={() => onChange({ ...filters, isVerified: !filters.isVerified })}
          activeOpacity={0.7}
        >
          <Text style={[styles.chipText, filters.isVerified && styles.chipTextActive]}>
            Onaylı
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.chip, filters.hasVideo && styles.chipActive]}
          onPress={() => onChange({ ...filters, hasVideo: !filters.hasVideo })}
          activeOpacity={0.7}
        >
          <Text style={[styles.chipText, filters.hasVideo && styles.chipTextActive]}>
            Videolu
          </Text>
        </TouchableOpacity>

        {hasAnyFilter && (
          <TouchableOpacity
            style={styles.clearChip}
            onPress={handleClearAll}
            activeOpacity={0.7}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Ionicons name="close" size={14} color={Colors.error} />
              <Text style={styles.clearChipText}>Temizle</Text>
            </View>
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Modal */}
      {activeModal !== null && (
        <FilterModal
          visible
          title={getModalTitle(activeModal)}
          options={getModalOptions(activeModal)}
          selectedValues={getSelectedValues(filters, activeModal)}
          multiSelect={isMultiSelect(activeModal)}
          showCustomInput={activeModal === 'tag'}
          onSelectMulti={(values) => handleMultiFilterSelect(activeModal, values)}
          onClose={() => setActiveModal(null)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    marginHorizontal: 16,
    paddingHorizontal: 12,
    height: 44,
    marginBottom: 10,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: Colors.textPrimary,
    paddingVertical: 0,
  },
  clearSearch: {
    paddingLeft: 8,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: Colors.borderDark,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  chipActive: {
    backgroundColor: Colors.navy,
    borderColor: Colors.navy,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  chipTextActive: {
    color: Colors.textOnDark,
  },
  badge: {
    backgroundColor: Colors.orange,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
    paddingHorizontal: 4,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textOnDark,
  },
  clearChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.errorLight,
    borderRadius: 100,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  clearChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.error,
  },
});
