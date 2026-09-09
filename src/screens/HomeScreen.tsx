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
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import { fetchTeachers, fetchTeacher } from '../services/teacherService';
import { formatPrice, getInitials } from '../utils/formatters';
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
  const isTeacher = authState.user?.user_metadata?.role === 'teacher';
  const userId = authState.user?.id;

  const [teachers, setTeachers] = useState<TeacherWithDetails[]>([]);
  const [myProfile, setMyProfile] = useState<TeacherWithDetails | null>(null);
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
        // Fetch own profile for teacher users
        if (isTeacher && userId) {
          const me = await fetchTeacher(userId);
          if (!cancelled && me) setMyProfile(me);
        }
      } catch {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    init();
    return () => { cancelled = true; };
  }, [isTeacher, userId]);

  const filteredTeachers = useMemo(() => {
    const filtered = applyFilters(teachers, filters);
    // Exclude own card for teacher users
    if (isTeacher && userId) {
      return filtered.filter((t) => t.profile_id !== userId);
    }
    return filtered;
  }, [teachers, filters, isTeacher, userId]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const data = await fetchTeachers();
      setTeachers(data);
      setError(false);
      if (isTeacher && userId) {
        const me = await fetchTeacher(userId);
        if (me) setMyProfile(me);
      }
    } catch {
      setError(true);
    } finally {
      setRefreshing(false);
    }
  }, [isTeacher, userId]);

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
    () => {
      if (isTeacher) return null;
      return (
        <View style={styles.resultCountContainer}>
          <Text style={styles.resultCount}>
            {filteredTeachers.length} sonuç
          </Text>
        </View>
      );
    },
    [isTeacher, filteredTeachers.length],
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        {/* Header */}
        <View style={styles.headerArea}>
          <Image
            source={require('../../assets/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.headerSubtitle}>
            Öğrenmenin en doğru adresi
          </Text>
        </View>

        {/* Filters (only for parents/visitors) */}
        {!isTeacher && <FilterBar filters={filters} onChange={setFilters} />}

        {/* Teacher Dashboard (only for teachers) */}
        {isTeacher && myProfile && (
          <View style={styles.dashboardContainer}>
            {/* Own Profile Card */}
            <TouchableOpacity
              style={styles.myProfileCard}
              onPress={() => navigation.navigate('TeacherDetail', { teacherId: myProfile.profile_id })}
              activeOpacity={0.7}
            >
              <View style={styles.myProfileHeader}>
                {myProfile.profile?.avatar_url ? (
                  <Image source={{ uri: myProfile.profile.avatar_url }} style={styles.myAvatar} />
                ) : (
                  <View style={[styles.myAvatar, styles.myAvatarPlaceholder]}>
                    <Text style={styles.myAvatarInitials}>
                      {getInitials(myProfile.profile?.full_name ?? '')}
                    </Text>
                  </View>
                )}
                <View style={styles.myProfileInfo}>
                  <View style={styles.myNameRow}>
                    <Text style={styles.myName} numberOfLines={1}>
                      {myProfile.profile?.full_name ?? ''}
                    </Text>
                    {myProfile.is_verified && (
                      <MaterialIcons name="verified" size={18} color={Colors.navy} style={{ marginLeft: 4 }} />
                    )}
                  </View>
                  <Text style={styles.myMajor}>{myProfile.major}</Text>
                  <Text style={styles.myRate}>{formatPrice(myProfile.hourly_rate)} / saat</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={Colors.textTertiary} />
              </View>
            </TouchableOpacity>

            {/* Stats Grid */}
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Ionicons name="eye-outline" size={22} color={Colors.navy} />
                <Text style={styles.statValue}>{myProfile.view_count}</Text>
                <Text style={styles.statLabel}>Görüntülenme</Text>
              </View>
              <View style={styles.statCard}>
                <Ionicons name="chatbubble-outline" size={22} color={Colors.navy} />
                <Text style={styles.statValue}>{myProfile.contact_count}</Text>
                <Text style={styles.statLabel}>İletişim</Text>
              </View>
              <View style={styles.statCard}>
                <Ionicons
                  name={myProfile.is_verified ? 'checkmark-circle' : 'time-outline'}
                  size={22}
                  color={myProfile.is_verified ? Colors.navy : Colors.warning}
                />
                <Text style={styles.statValue}>
                  {myProfile.is_verified ? 'Onaylı' : 'Bekliyor'}
                </Text>
                <Text style={styles.statLabel}>Diploma</Text>
              </View>
            </View>

            {/* Subscription Banner */}
            {!myProfile.subscription_status && (
              <View style={styles.subscriptionBanner}>
                <Ionicons name="alert-circle" size={18} color={Colors.orange} />
                <Text style={styles.subscriptionText}>
                  Profiliniz şu an görünmüyor. Abonelik ile öğrencilere ulaşın.
                </Text>
              </View>
            )}

            {/* Other Teachers Header */}
            <Text style={styles.otherTeachersTitle}>Diğer Öğretmenler</Text>
          </View>
        )}

        {/* Teacher List */}
        <FlatList
          data={filteredTeachers}
          renderItem={renderTeacher}
          keyExtractor={keyExtractor}
          ListHeaderComponent={!loading && !error ? renderHeader : undefined}
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
  // Teacher Dashboard
  dashboardContainer: {
    paddingBottom: 8,
  },
  myProfileCard: {
    backgroundColor: Colors.surface,
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  myProfileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  myAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  myAvatarPlaceholder: {
    backgroundColor: Colors.navyLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  myAvatarInitials: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.navy,
  },
  myProfileInfo: {
    flex: 1,
    marginLeft: 12,
  },
  myNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  myName: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.textPrimary,
    flexShrink: 1,
  },
  myMajor: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  myRate: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.orange,
    marginTop: 2,
  },
  statsGrid: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 12,
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 14,
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  subscriptionBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.orangeLight,
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
  },
  subscriptionText: {
    flex: 1,
    fontSize: 13,
    color: Colors.textPrimary,
    fontWeight: '500',
    lineHeight: 18,
  },
  otherTeachersTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 12,
  },
});
