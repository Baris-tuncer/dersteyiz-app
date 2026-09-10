import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../constants/colors';
import { useAuth } from '../contexts/AuthContext';
import { useSubscription } from '../contexts/SubscriptionContext';
import { fetchTeacher } from '../services/teacherService';
import {
  fetchViewers,
  fetchHourlyViews,
  fetchCityViews,
  fetchContacts,
} from '../services/analyticsService';
import { getInitials } from '../utils/formatters';
import type {
  ViewerProfile,
  HourlyViewCount,
  CityViewCount,
  ContactProfile,
} from '../types/super';

type Period = '7d' | '30d' | 'all';

function getSinceDate(period: Period): string {
  if (period === 'all') return '2020-01-01T00:00:00Z';
  const d = new Date();
  d.setDate(d.getDate() - (period === '7d' ? 7 : 30));
  return d.toISOString();
}

export default function AnalyticsDashboardScreen() {
  const { state } = useAuth();
  const { state: subState } = useSubscription();
  const navigation = useNavigation<any>();
  const isPremium = subState.isPremium;
  const userId = state.user?.id;

  const [period, setPeriod] = useState<Period>('7d');
  const [loading, setLoading] = useState(true);
  const [totalViews, setTotalViews] = useState(0);
  const [totalContacts, setTotalContacts] = useState(0);
  const [viewers, setViewers] = useState<ViewerProfile[]>([]);
  const [hourlyViews, setHourlyViews] = useState<HourlyViewCount[]>([]);
  const [cityViews, setCityViews] = useState<CityViewCount[]>([]);
  const [contacts, setContacts] = useState<ContactProfile[]>([]);

  const loadData = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    const since = getSinceDate(period);
    try {
      const [v, h, c, ct, teacher] = await Promise.all([
        fetchViewers(userId, since),
        fetchHourlyViews(userId, since),
        fetchCityViews(userId, since),
        fetchContacts(userId, since),
        fetchTeacher(userId),
      ]);
      setViewers(v);
      setHourlyViews(h);
      setCityViews(c);
      setContacts(ct);
      setTotalViews(teacher?.view_count ?? 0);
      setTotalContacts(teacher?.contact_count ?? 0);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [userId, period]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const maxHourly = Math.max(...hourlyViews.map((h) => Number(h.count)), 1);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.screen} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Period Selector */}
        <View style={styles.periodRow}>
          {(['7d', '30d', 'all'] as Period[]).map((p) => (
            <TouchableOpacity
              key={p}
              style={[styles.periodChip, period === p && styles.periodChipActive]}
              onPress={() => setPeriod(p)}
              activeOpacity={0.7}
            >
              <Text style={[styles.periodText, period === p && styles.periodTextActive]}>
                {p === '7d' ? '7 Gün' : p === '30d' ? '30 Gün' : 'Tümü'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.navy} />
          </View>
        ) : (
          <>
            {/* Summary Cards */}
            <View style={styles.summaryRow}>
              <View style={styles.summaryCard}>
                <Ionicons name="eye-outline" size={22} color={Colors.navy} />
                <Text style={styles.summaryValue}>{totalViews}</Text>
                <Text style={styles.summaryLabel}>Toplam Görüntülenme</Text>
              </View>
              <View style={styles.summaryCard}>
                <Ionicons name="chatbubble-outline" size={22} color={Colors.navy} />
                <Text style={styles.summaryValue}>{totalContacts}</Text>
                <Text style={styles.summaryLabel}>Toplam İletişim</Text>
              </View>
            </View>

            {/* Viewers List */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                <Ionicons name="people-outline" size={16} color={Colors.navy} /> Son Görüntüleyenler ({viewers.length})
              </Text>
              {viewers.length === 0 ? (
                <Text style={styles.emptyText}>Bu dönemde görüntüleyen yok.</Text>
              ) : (
                viewers.slice(0, 10).map((v) => (
                  <View key={`${v.id}-${v.viewed_at}`} style={styles.personRow}>
                    {v.avatar_url ? (
                      <Image source={{ uri: v.avatar_url }} style={styles.personAvatar} />
                    ) : (
                      <View style={[styles.personAvatar, styles.personAvatarPlaceholder]}>
                        <Text style={styles.personInitials}>
                          {isPremium ? getInitials(v.full_name) : '?'}
                        </Text>
                      </View>
                    )}
                    <View style={styles.personInfo}>
                      {isPremium ? (
                        <Text style={styles.personName}>{v.full_name}</Text>
                      ) : (
                        <TouchableOpacity onPress={() => navigation.navigate('Paywall')} activeOpacity={0.7}>
                          <Text style={styles.personNameLocked}>
                            <Ionicons name="lock-closed" size={12} color={Colors.orange} /> Premium ile görün
                          </Text>
                        </TouchableOpacity>
                      )}
                      {v.city && <Text style={styles.personCity}>{v.city}</Text>}
                    </View>
                    <Text style={styles.personDate}>
                      {new Date(v.viewed_at).toLocaleDateString('tr-TR')}
                    </Text>
                  </View>
                ))
              )}
            </View>

            {/* City Distribution */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                <Ionicons name="location-outline" size={16} color={Colors.navy} /> Şehir Dağılımı
              </Text>
              {cityViews.length === 0 ? (
                <Text style={styles.emptyText}>Veri yok.</Text>
              ) : (
                cityViews.slice(0, 8).map((c) => (
                  <View key={c.city} style={styles.barRow}>
                    <Text style={styles.barLabel}>{c.city}</Text>
                    <View style={styles.barTrack}>
                      <View
                        style={[
                          styles.barFill,
                          { width: `${(Number(c.count) / Math.max(...cityViews.map((cv) => Number(cv.count)), 1)) * 100}%` },
                        ]}
                      />
                    </View>
                    <Text style={styles.barCount}>{c.count}</Text>
                  </View>
                ))
              )}
            </View>

            {/* Hourly Distribution */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                <Ionicons name="time-outline" size={16} color={Colors.navy} /> Saatlik Dağılım
              </Text>
              {hourlyViews.length === 0 ? (
                <Text style={styles.emptyText}>Veri yok.</Text>
              ) : (
                <View style={styles.chartContainer}>
                  {hourlyViews.map((h) => (
                    <View key={h.hour} style={styles.chartBar}>
                      <View
                        style={[
                          styles.chartBarFill,
                          { height: `${(Number(h.count) / maxHourly) * 100}%` },
                        ]}
                      />
                      <Text style={styles.chartLabel}>{h.hour}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>

            {/* Contacts List */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                <Ionicons name="call-outline" size={16} color={Colors.navy} /> İletişime Geçenler ({contacts.length})
              </Text>
              {contacts.length === 0 ? (
                <Text style={styles.emptyText}>Bu dönemde iletişime geçen yok.</Text>
              ) : (
                contacts.slice(0, 10).map((c) => (
                  <View key={`${c.id}-${c.contacted_at}`} style={styles.personRow}>
                    {c.avatar_url ? (
                      <Image source={{ uri: c.avatar_url }} style={styles.personAvatar} />
                    ) : (
                      <View style={[styles.personAvatar, styles.personAvatarPlaceholder]}>
                        <Text style={styles.personInitials}>
                          {isPremium ? getInitials(c.full_name) : '?'}
                        </Text>
                      </View>
                    )}
                    <View style={styles.personInfo}>
                      {isPremium ? (
                        <Text style={styles.personName}>{c.full_name}</Text>
                      ) : (
                        <TouchableOpacity onPress={() => navigation.navigate('Paywall')} activeOpacity={0.7}>
                          <Text style={styles.personNameLocked}>
                            <Ionicons name="lock-closed" size={12} color={Colors.orange} /> Premium ile görün
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                    <Text style={styles.personDate}>
                      {new Date(c.contacted_at).toLocaleDateString('tr-TR')}
                    </Text>
                  </View>
                ))
              )}
            </View>
          </>
        )}
      </ScrollView>
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
  },
  content: {
    paddingBottom: 40,
  },
  loadingContainer: {
    paddingTop: 60,
    alignItems: 'center',
  },
  periodRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  periodChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 100,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.borderDark,
  },
  periodChipActive: {
    backgroundColor: Colors.navy,
    borderColor: Colors.navy,
  },
  periodText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  periodTextActive: {
    color: Colors.textOnDark,
  },
  summaryRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 10,
    marginBottom: 8,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 16,
    alignItems: 'center',
    gap: 6,
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.navy,
  },
  summaryLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  section: {
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 13,
    color: Colors.textTertiary,
  },
  personRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  personAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  personAvatarPlaceholder: {
    backgroundColor: Colors.navyLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  personInitials: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.navy,
  },
  personInfo: {
    flex: 1,
    marginLeft: 10,
  },
  personName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  personNameLocked: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.orange,
  },
  personCity: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  personDate: {
    fontSize: 12,
    color: Colors.textTertiary,
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  barLabel: {
    width: 80,
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  barTrack: {
    flex: 1,
    height: 16,
    backgroundColor: Colors.border,
    borderRadius: 8,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: Colors.navy,
    borderRadius: 8,
  },
  barCount: {
    width: 30,
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'right',
  },
  chartContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 100,
    gap: 2,
  },
  chartBar: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: '100%',
  },
  chartBarFill: {
    width: '80%',
    backgroundColor: Colors.navy,
    borderRadius: 3,
    minHeight: 4,
  },
  chartLabel: {
    fontSize: 9,
    color: Colors.textTertiary,
    marginTop: 4,
  },
});
