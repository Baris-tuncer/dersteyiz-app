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
  Alert,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import { fetchTeachers, fetchTeacher } from '../services/teacherService';
import { fetchBoostedTeacherIds } from '../services/boostService';
import { canBoost, createBoost } from '../services/boostService';
import { getPendingTrialCount } from '../services/trialService';
import { formatPrice, getInitials } from '../utils/formatters';
import { useAuth } from '../contexts/AuthContext';
import { useCompare } from '../contexts/CompareContext';
import type { TeacherWithDetails, TeacherFilters } from '../types/teacher';
import type { RootStackParamList } from '../types/navigation';
import TeacherCard from '../components/TeacherCard';
import FilterBar from '../components/FilterBar';
import RecommendationSection from '../components/RecommendationSection';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const INITIAL_FILTERS: TeacherFilters = {
  search: '',
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

    if (filters.priceMin !== null && teacher.hourly_rate < filters.priceMin) return false;
    if (filters.priceMax !== null && teacher.hourly_rate > filters.priceMax) return false;
    if (filters.isVerified && !teacher.is_verified) return false;
    if (filters.hasVideo && !teacher.video_url) return false;
    if (filters.minExperience !== null && teacher.experience_years < filters.minExperience) return false;

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
  const { compareList } = useCompare();
  const isLoggedIn = !!authState.session;
  const isTeacher = authState.user?.user_metadata?.role === 'teacher';
  const isParent = authState.user?.user_metadata?.role === 'parent';
  const userId = authState.user?.id;

  const [teachers, setTeachers] = useState<TeacherWithDetails[]>([]);
  const [myProfile, setMyProfile] = useState<TeacherWithDetails | null>(null);
  const [filters, setFilters] = useState<TeacherFilters>(INITIAL_FILTERS);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [boostedIds, setBoostedIds] = useState<string[]>([]);
  const [boostAvailable, setBoostAvailable] = useState(false);
  const [pendingTrials, setPendingTrials] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        const [data, boosted] = await Promise.all([
          fetchTeachers(),
          fetchBoostedTeacherIds(),
        ]);
        if (!cancelled) {
          setTeachers(data);
          setBoostedIds(boosted);
          setError(false);
        }
        // Fetch own profile for teacher users
        if (isTeacher && userId) {
          const [me, canB, trials] = await Promise.all([
            fetchTeacher(userId),
            canBoost(userId),
            getPendingTrialCount(userId),
          ]);
          if (!cancelled) {
            if (me) setMyProfile(me);
            setBoostAvailable(canB);
            setPendingTrials(trials);
          }
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

  // Refresh pending trial count when screen gains focus
  useFocusEffect(
    useCallback(() => {
      if (isTeacher && userId) {
        getPendingTrialCount(userId).then(setPendingTrials).catch(() => {});
      }
    }, [isTeacher, userId]),
  );

  const filteredTeachers = useMemo(() => {
    const filtered = applyFilters(teachers, filters);
    // Exclude own card for teacher users
    let result = isTeacher && userId
      ? filtered.filter((t) => t.profile_id !== userId)
      : filtered;

    // Sort: boosted first, then premium, then free (only if no price sort active)
    if (!filters.priceSort) {
      result = [...result].sort((a, b) => {
        const aBoost = boostedIds.includes(a.profile_id) ? 2 : 0;
        const bBoost = boostedIds.includes(b.profile_id) ? 2 : 0;
        const aPremium = a.subscription_status ? 1 : 0;
        const bPremium = b.subscription_status ? 1 : 0;
        return (bBoost + bPremium) - (aBoost + aPremium);
      });
    }

    return result;
  }, [teachers, filters, isTeacher, userId, boostedIds]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const [data, boosted] = await Promise.all([
        fetchTeachers(),
        fetchBoostedTeacherIds(),
      ]);
      setTeachers(data);
      setBoostedIds(boosted);
      setError(false);
      if (isTeacher && userId) {
        const [me, canB, trials] = await Promise.all([
          fetchTeacher(userId),
          canBoost(userId),
          getPendingTrialCount(userId),
        ]);
        if (me) setMyProfile(me);
        setBoostAvailable(canB);
        setPendingTrials(trials);
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
        isBoosted={boostedIds.includes(item.profile_id)}
        showCompare={isParent && filteredTeachers.length >= 2}
      />
    ),
    [isLoggedIn, handleTeacherPress, boostedIds, isParent, filteredTeachers.length],
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
        <>
          {isLoggedIn && userId && (
            <RecommendationSection
              userId={userId}
              onTeacherPress={(id) => navigation.navigate('TeacherDetail', { teacherId: id })}
            />
          )}
          <View style={styles.resultCountContainer}>
            <Text style={styles.resultCount}>
              {filteredTeachers.length} sonuç
            </Text>
          </View>
        </>
      );
    },
    [isTeacher, filteredTeachers.length, isLoggedIn, userId, navigation],
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
                <Text style={styles.statLabel}>Belge</Text>
              </View>
            </View>

            {/* Action Buttons */}
            {myProfile.subscription_status && (
              <View style={styles.dashboardActions}>
                {boostAvailable && (
                  <TouchableOpacity
                    style={styles.boostButton}
                    onPress={async () => {
                      try {
                        await createBoost(userId!);
                        setBoostAvailable(false);
                        Alert.alert('Profiliniz öne çıkarıldı!', '3 gün boyunca listenin üstünde görüneceksiniz. Ayda 2 kez kullanabilirsiniz.');
                      } catch {
                        Alert.alert('Hata', 'Profil öne çıkarılamadı.');
                      }
                    }}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="rocket-outline" size={16} color={Colors.textOnDark} />
                    <Text style={styles.boostButtonText}>Öne Çıkar</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={styles.analyticsButton}
                  onPress={() => navigation.navigate('AnalyticsDashboard')}
                  activeOpacity={0.7}
                >
                  <Ionicons name="analytics-outline" size={16} color={Colors.navy} />
                  <Text style={styles.analyticsButtonText}>Detaylı Analiz</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Pending Trials */}
            {pendingTrials > 0 && myProfile?.subscription_status && (
              <TouchableOpacity
                style={styles.trialBanner}
                onPress={() => navigation.navigate('TrialRequests')}
                activeOpacity={0.7}
              >
                <Ionicons name="calendar-outline" size={18} color={Colors.navy} />
                <Text style={styles.trialBannerText}>
                  {pendingTrials} bekleyen tanışma dersi talebi
                </Text>
                <Ionicons name="chevron-forward" size={16} color={Colors.textSecondary} />
              </TouchableOpacity>
            )}

            {/* Pending Trials — free teacher → premium upsell */}
            {pendingTrials > 0 && !myProfile?.subscription_status && (
              <TouchableOpacity
                style={styles.trialBannerPremium}
                onPress={() => navigation.navigate('Paywall')}
                activeOpacity={0.7}
              >
                <Ionicons name="people" size={18} color={Colors.orange} />
                <Text style={styles.trialBannerPremiumText}>
                  {pendingTrials} veli tanışma dersi talep etti!{'\n'}
                  <Text style={styles.trialBannerPremiumCta}>Yanıtlamak için Premium'a geçin</Text>
                </Text>
                <Ionicons name="chevron-forward" size={16} color={Colors.orange} />
              </TouchableOpacity>
            )}

            {/* Subscription Banner */}
            {!myProfile.subscription_status && (
              <TouchableOpacity
                style={styles.subscriptionBanner}
                onPress={() => navigation.navigate('Paywall')}
                activeOpacity={0.7}
              >
                <Ionicons name="alert-circle" size={18} color={Colors.orange} />
                <Text style={styles.subscriptionText}>
                  Veliler size ulaşamıyor. Premium ile iletişime açılın.
                </Text>
                <Ionicons name="chevron-forward" size={16} color={Colors.orange} />
              </TouchableOpacity>
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

        {/* Compare FAB */}
        {compareList.length >= 2 && (
          <TouchableOpacity
            style={styles.compareFab}
            onPress={() => navigation.navigate('Compare')}
            activeOpacity={0.8}
          >
            <Ionicons name="git-compare-outline" size={18} color={Colors.textOnDark} />
            <Text style={styles.compareFabText}>
              Karşılaştır ({compareList.length})
            </Text>
          </TouchableOpacity>
        )}
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
  dashboardActions: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 12,
    gap: 10,
  },
  boostButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.orange,
    borderRadius: 12,
    paddingVertical: 12,
    gap: 6,
  },
  boostButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textOnDark,
  },
  analyticsButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.navyLight,
    borderRadius: 12,
    paddingVertical: 12,
    gap: 6,
  },
  analyticsButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.navy,
  },
  trialBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.navyLight,
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 8,
  },
  trialBannerText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: Colors.navy,
  },
  trialBannerPremium: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.orangeLight,
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.orange,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 8,
  },
  trialBannerPremiumText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    lineHeight: 20,
  },
  trialBannerPremiumCta: {
    fontWeight: '700',
    color: Colors.orange,
  },
  compareFab: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.navy,
    borderRadius: 100,
    paddingHorizontal: 20,
    paddingVertical: 14,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  compareFabText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textOnDark,
  },
});
