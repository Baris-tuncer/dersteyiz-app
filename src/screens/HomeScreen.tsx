import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  StyleSheet,
  SafeAreaView,
  Image,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import { fetchTeachers } from '../services/teacherService';
import { useAuth } from '../contexts/AuthContext';
import type { TeacherWithDetails, TeacherFilters } from '../types/teacher';
import type { RootStackParamList } from '../types/navigation';
import TeacherCard from '../components/TeacherCard';
import FilterBar from '../components/FilterBar';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const INITIAL_FILTERS: TeacherFilters = {
  search: '',
  categoryIds: [],
  majors: [],
  modes: [],
  city: '',
  tagIds: [],
  priceSort: '',
};

function applyFilters(
  teachers: TeacherWithDetails[],
  filters: TeacherFilters,
): TeacherWithDetails[] {
  const result = teachers.filter((teacher) => {
    if (filters.search) {
      const q = filters.search.toLowerCase();
      const matchesName = teacher.profile?.full_name?.toLowerCase().includes(q);
      const matchesBio = teacher.bio?.toLowerCase().includes(q);
      const matchesMajor = teacher.major?.toLowerCase().includes(q);
      if (!matchesName && !matchesBio && !matchesMajor) return false;
    }

    if (filters.categoryIds.length > 0) {
      const teacherCatIds = teacher.categories.map((c) => c.category.id);
      const hasAny = filters.categoryIds.some((id) => teacherCatIds.includes(id));
      if (!hasAny) return false;
    }

    if (filters.majors.length > 0) {
      if (!filters.majors.includes(teacher.major)) return false;
    }

    if (filters.modes.length > 0) {
      const teacherModes = teacher.modes.map((m) => m.mode);
      const hasAny = filters.modes.some((m) => teacherModes.includes(m));
      if (!hasAny) return false;
    }

    if (filters.city) {
      const hasCity = teacher.locations.some((l) => l.city === filters.city);
      if (!hasCity) return false;
    }

    if (filters.tagIds.length > 0) {
      const teacherTagIds = teacher.tags.map((t) => t.tag.id);
      const hasAllTags = filters.tagIds.every((id) =>
        teacherTagIds.includes(id),
      );
      if (!hasAllTags) return false;
    }

    return true;
  });

  // Apply price sort
  if (filters.priceSort === 'asc') {
    result.sort((a, b) => a.hourly_rate - b.hourly_rate);
  } else if (filters.priceSort === 'desc') {
    result.sort((a, b) => b.hourly_rate - a.hourly_rate);
  }

  return result;
}

export default function HomeScreen() {
  const navigation = useNavigation<Nav>();
  const { state: authState } = useAuth();
  const isLoggedIn = !!authState.session;

  const [teachers, setTeachers] = useState<TeacherWithDetails[]>([]);
  const [filters, setFilters] = useState<TeacherFilters>(INITIAL_FILTERS);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        const data = await fetchTeachers();
        if (!cancelled) {
          setTeachers(data);
          setError(false);
        }
      } catch {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    init();
    return () => { cancelled = true; };
  }, []);

  const filteredTeachers = useMemo(
    () => applyFilters(teachers, filters),
    [teachers, filters],
  );

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const data = await fetchTeachers();
      setTeachers(data);
      setError(false);
    } catch {
      setError(true);
    } finally {
      setRefreshing(false);
    }
  }, []);

  const handleTeacherPress = useCallback(
    (teacher: TeacherWithDetails) => {
      navigation.navigate('TeacherDetail', { teacherId: teacher.profile_id });
    },
    [navigation],
  );

  const renderTeacher = useCallback(
    ({ item }: { item: TeacherWithDetails }) => (
      <TeacherCard
        teacher={item}
        onPress={() => handleTeacherPress(item)}
        isLoggedIn={isLoggedIn}
      />
    ),
    [isLoggedIn, handleTeacherPress],
  );

  const keyExtractor = useCallback(
    (item: TeacherWithDetails) => item.profile_id,
    [],
  );

  const renderEmpty = useCallback(
    () => {
      if (loading) {
        return (
          <View style={styles.emptyContainer}>
            <ActivityIndicator size="large" color={Colors.navy} />
          </View>
        );
      }

      if (error) {
        return (
          <View style={styles.emptyContainer}>
            <Ionicons name="cloud-offline-outline" size={48} color={Colors.textTertiary} />
            <Text style={styles.emptyTitle}>Bağlantı hatası</Text>
            <Text style={styles.emptySubtitle}>
              Öğretmenler yüklenemedi. Lütfen internet bağlantınızı kontrol edin.
            </Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={handleRefresh}
              activeOpacity={0.7}
            >
              <Text style={styles.retryText}>Tekrar Dene</Text>
            </TouchableOpacity>
          </View>
        );
      }

      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>Sonuç bulunamadı</Text>
          <Text style={styles.emptySubtitle}>
            Filtreleri değiştirerek tekrar deneyin.
          </Text>
        </View>
      );
    },
    [loading, error, handleRefresh],
  );

  const renderHeader = useCallback(
    () => (
      <View style={styles.resultCountContainer}>
        <Text style={styles.resultCount}>
          {filteredTeachers.length} sonuç
        </Text>
      </View>
    ),
    [filteredTeachers.length],
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        {/* Header */}
        <View style={styles.headerArea}>
          <Image
            source={require('../../assets/logo.jpg')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.headerSubtitle}>
            Öğrenmenin en doğru adresi
          </Text>
        </View>

        {/* Filters */}
        <FilterBar filters={filters} onChange={setFilters} />

        {/* Teacher List */}
        <FlatList
          data={filteredTeachers}
          renderItem={renderTeacher}
          keyExtractor={keyExtractor}
          ListHeaderComponent={!loading && !error && teachers.length > 0 ? renderHeader : undefined}
          ListEmptyComponent={renderEmpty}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={Colors.navy}
              colors={[Colors.navy]}
            />
          }
        />
      </View>
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
    backgroundColor: Colors.background,
  },
  headerArea: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
  },
  logo: {
    height: 40,
    width: 140,
  },
  headerSubtitle: {
    fontSize: 16,
    color: Colors.textPrimary,
    marginTop: 6,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  listContent: {
    paddingTop: 4,
    paddingBottom: 32,
    flexGrow: 1,
  },
  resultCountContainer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  resultCount: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  retryButton: {
    marginTop: 20,
    backgroundColor: Colors.navy,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  retryText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textOnDark,
  },
});
