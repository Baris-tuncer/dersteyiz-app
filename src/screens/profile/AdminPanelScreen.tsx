import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Linking,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { supabase } from '../../config/supabase';

interface PendingDiploma {
  profile_id: string;
  diploma_url: string;
  major: string;
  created_at: string;
  profile: {
    full_name: string;
    avatar_url: string | null;
  };
}

interface AdminStats {
  totalTeachers: number;
  totalParents: number;
  activeSubscriptions: number;
  pendingDiplomas: number;
  verifiedTeachers: number;
  totalViews: number;
  totalContacts: number;
  recentTeachers: number;
  recentParents: number;
}

interface UserProfile {
  id: string;
  full_name: string;
  avatar_url: string | null;
  role: string;
  created_at: string;
}

interface TeacherUser extends UserProfile {
  teacher?: {
    major: string;
    subscription_status: boolean;
    is_verified: boolean;
    view_count: number;
    contact_count: number;
  };
}

type Tab = 'stats' | 'users' | 'diplomas';

export default function AdminPanelScreen() {
  const [activeTab, setActiveTab] = useState<Tab>('stats');
  const [pendingDiplomas, setPendingDiplomas] = useState<PendingDiploma[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [teachers, setTeachers] = useState<TeacherUser[]>([]);
  const [parents, setParents] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const loadStats = useCallback(async () => {
    try {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const sevenDaysAgoStr = sevenDaysAgo.toISOString();

      const [
        teachersRes,
        parentsRes,
        activeSubRes,
        pendingDipRes,
        verifiedRes,
        viewsRes,
        contactsRes,
        recentTeachersRes,
        recentParentsRes,
      ] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'teacher'),
        supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'parent'),
        supabase.from('teachers').select('profile_id', { count: 'exact', head: true }).eq('subscription_status', true),
        supabase.from('teachers').select('profile_id', { count: 'exact', head: true }).eq('diploma_status', 'pending').not('diploma_url', 'is', null),
        supabase.from('teachers').select('profile_id', { count: 'exact', head: true }).eq('is_verified', true),
        supabase.from('view_logs').select('id', { count: 'exact', head: true }),
        supabase.from('contact_logs').select('id', { count: 'exact', head: true }),
        supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'teacher').gte('created_at', sevenDaysAgoStr),
        supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'parent').gte('created_at', sevenDaysAgoStr),
      ]);

      setStats({
        totalTeachers: teachersRes.count ?? 0,
        totalParents: parentsRes.count ?? 0,
        activeSubscriptions: activeSubRes.count ?? 0,
        pendingDiplomas: pendingDipRes.count ?? 0,
        verifiedTeachers: verifiedRes.count ?? 0,
        totalViews: viewsRes.count ?? 0,
        totalContacts: contactsRes.count ?? 0,
        recentTeachers: recentTeachersRes.count ?? 0,
        recentParents: recentParentsRes.count ?? 0,
      });
    } catch {
      // Stats loading failure is not critical
    }
  }, []);

  const loadPending = useCallback(async () => {
    try {
      const { data: teacherData, error } = await supabase
        .from('teachers')
        .select('profile_id, diploma_url, major, created_at')
        .eq('diploma_status', 'pending')
        .not('diploma_url', 'is', null)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Fetch profiles separately to avoid FK ambiguity
      const ids = (teacherData ?? []).map((t) => t.profile_id);
      let profileMap = new Map<string, { full_name: string; avatar_url: string | null }>();
      if (ids.length > 0) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url')
          .in('id', ids);
        profileMap = new Map((profileData ?? []).map((p) => [p.id, p]));
      }

      const result = (teacherData ?? []).map((t) => ({
        ...t,
        profile: profileMap.get(t.profile_id) ?? { full_name: 'İsimsiz', avatar_url: null },
      }));

      setPendingDiplomas(result as PendingDiploma[]);
    } catch (err: any) {
      Alert.alert('Hata', err?.message || 'Diplomalar yüklenemedi.');
    }
  }, []);

  const loadUsers = useCallback(async () => {
    try {
      // Load teachers with their teacher details
      const { data: teacherProfiles } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, role, created_at')
        .eq('role', 'teacher')
        .order('created_at', { ascending: false });

      const teacherList: TeacherUser[] = [];
      if (teacherProfiles) {
        const { data: teacherDetails } = await supabase
          .from('teachers')
          .select('profile_id, major, subscription_status, is_verified, view_count, contact_count');

        const detailMap = new Map(
          (teacherDetails ?? []).map((t) => [t.profile_id, t]),
        );

        for (const p of teacherProfiles) {
          teacherList.push({ ...p, teacher: detailMap.get(p.id) as any });
        }
      }
      setTeachers(teacherList);

      // Load parents
      const { data: parentProfiles } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, role, created_at')
        .eq('role', 'parent')
        .order('created_at', { ascending: false });

      setParents((parentProfiles ?? []) as UserProfile[]);
    } catch {
      // Non-critical
    }
  }, []);

  const loadAll = useCallback(async () => {
    setLoading(true);
    await Promise.all([loadStats(), loadPending(), loadUsers()]);
    setLoading(false);
  }, [loadStats, loadPending, loadUsers]);

  useFocusEffect(
    useCallback(() => {
      loadAll();
    }, [loadAll]),
  );

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([loadStats(), loadPending(), loadUsers()]);
    setRefreshing(false);
  }, [loadStats, loadPending, loadUsers]);

  const handleAction = async (teacherId: string, action: 'approved' | 'rejected') => {
    setProcessingId(teacherId);
    try {
      const { error } = await supabase
        .from('teachers')
        .update({
          diploma_status: action,
          is_verified: action === 'approved',
        })
        .eq('profile_id', teacherId);

      if (error) throw error;

      setPendingDiplomas((prev) => prev.filter((d) => d.profile_id !== teacherId));
      if (stats) {
        setStats({
          ...stats,
          pendingDiplomas: stats.pendingDiplomas - 1,
          verifiedTeachers: action === 'approved' ? stats.verifiedTeachers + 1 : stats.verifiedTeachers,
        });
      }
      // Send push notification to teacher
      supabase.functions.invoke('send-diploma-notification', {
        body: { teacher_id: teacherId, status: action },
      }).catch(() => {}); // Non-blocking

      Alert.alert(
        'Başarılı',
        action === 'approved' ? 'Diploma onaylandı.' : 'Diploma reddedildi.',
      );
    } catch (err: any) {
      Alert.alert('Hata', err?.message || 'İşlem gerçekleştirilemedi.');
    } finally {
      setProcessingId(null);
    }
  };

  const confirmAction = (teacherId: string, action: 'approved' | 'rejected', teacherName: string) => {
    const label = action === 'approved' ? 'onaylamak' : 'reddetmek';
    Alert.alert(
      'Emin misiniz?',
      `${teacherName} adlı öğretmenin diplomasını ${label} istediğinize emin misiniz?`,
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: action === 'approved' ? 'Onayla' : 'Reddet',
          style: action === 'rejected' ? 'destructive' : 'default',
          onPress: () => handleAction(teacherId, action),
        },
      ],
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.navy} />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          tintColor={Colors.navy}
          colors={[Colors.navy]}
        />
      }
    >
      {/* Tabs */}
      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'stats' && styles.tabActive]}
          onPress={() => setActiveTab('stats')}
          activeOpacity={0.7}
        >
          <Ionicons name="stats-chart" size={16} color={activeTab === 'stats' ? Colors.textOnDark : Colors.navy} />
          <Text style={[styles.tabText, activeTab === 'stats' && styles.tabTextActive]}>İstatistikler</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'users' && styles.tabActive]}
          onPress={() => setActiveTab('users')}
          activeOpacity={0.7}
        >
          <Ionicons name="people" size={16} color={activeTab === 'users' ? Colors.textOnDark : Colors.navy} />
          <Text style={[styles.tabText, activeTab === 'users' && styles.tabTextActive]}>Kullanıcılar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'diplomas' && styles.tabActive]}
          onPress={() => setActiveTab('diplomas')}
          activeOpacity={0.7}
        >
          <Ionicons name="document-text" size={16} color={activeTab === 'diplomas' ? Colors.textOnDark : Colors.navy} />
          <Text style={[styles.tabText, activeTab === 'diplomas' && styles.tabTextActive]}>
            Diplomalar{pendingDiplomas.length > 0 ? ` (${pendingDiplomas.length})` : ''}
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'stats' && stats && (
        <View style={styles.statsContainer}>
          {/* Overview Cards */}
          <Text style={styles.sectionLabel}>GENEL BAKIŞ</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Ionicons name="people" size={24} color={Colors.navy} />
              <Text style={styles.statValue}>{stats.totalTeachers + stats.totalParents}</Text>
              <Text style={styles.statLabel}>Toplam Kullanıcı</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="school" size={24} color={Colors.navy} />
              <Text style={styles.statValue}>{stats.totalTeachers}</Text>
              <Text style={styles.statLabel}>Öğretmen</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="person" size={24} color={Colors.navy} />
              <Text style={styles.statValue}>{stats.totalParents}</Text>
              <Text style={styles.statLabel}>Veli</Text>
            </View>
          </View>

          {/* Subscription & Verification */}
          <Text style={styles.sectionLabel}>ABONELİK & DOĞRULAMA</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Ionicons name="card" size={24} color={Colors.success} />
              <Text style={styles.statValue}>{stats.activeSubscriptions}</Text>
              <Text style={styles.statLabel}>Aktif Abonelik</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="checkmark-circle" size={24} color={Colors.success} />
              <Text style={styles.statValue}>{stats.verifiedTeachers}</Text>
              <Text style={styles.statLabel}>Onaylı Diploma</Text>
            </View>
            <View style={[styles.statCard, stats.pendingDiplomas > 0 && styles.statCardWarning]}>
              <Ionicons name="time" size={24} color={stats.pendingDiplomas > 0 ? Colors.orange : Colors.textTertiary} />
              <Text style={styles.statValue}>{stats.pendingDiplomas}</Text>
              <Text style={styles.statLabel}>Bekleyen Diploma</Text>
            </View>
          </View>

          {/* Engagement */}
          <Text style={styles.sectionLabel}>ETKİLEŞİM</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Ionicons name="eye" size={24} color={Colors.navy} />
              <Text style={styles.statValue}>{stats.totalViews}</Text>
              <Text style={styles.statLabel}>Toplam Görüntülenme</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="chatbubbles" size={24} color={Colors.navy} />
              <Text style={styles.statValue}>{stats.totalContacts}</Text>
              <Text style={styles.statLabel}>Toplam İletişim</Text>
            </View>
          </View>

          {/* Recent Activity */}
          <Text style={styles.sectionLabel}>SON 7 GÜN</Text>
          <View style={styles.recentRow}>
            <View style={styles.recentCard}>
              <Text style={styles.recentValue}>+{stats.recentTeachers}</Text>
              <Text style={styles.recentLabel}>Yeni Öğretmen</Text>
            </View>
            <View style={styles.recentCard}>
              <Text style={styles.recentValue}>+{stats.recentParents}</Text>
              <Text style={styles.recentLabel}>Yeni Veli</Text>
            </View>
          </View>
        </View>
      )}

      {activeTab === 'users' && (
        <View style={styles.usersContainer}>
          {/* Teachers */}
          <Text style={styles.sectionLabel}>ÖĞRETMENLER ({teachers.length})</Text>
          {teachers.map((t) => (
            <View key={t.id} style={styles.userRow}>
              <View style={styles.userAvatarContainer}>
                {t.avatar_url ? (
                  <Image source={{ uri: t.avatar_url }} style={styles.userAvatar} />
                ) : (
                  <View style={[styles.userAvatar, styles.userAvatarPlaceholder]}>
                    <Text style={styles.userAvatarText}>
                      {(t.full_name || '?').charAt(0).toUpperCase()}
                    </Text>
                  </View>
                )}
              </View>
              <View style={styles.userInfo}>
                <View style={styles.userNameRow}>
                  <Text style={styles.userNameText} numberOfLines={1}>{t.full_name}</Text>
                  {t.teacher?.is_verified && (
                    <Ionicons name="checkmark-circle" size={14} color={Colors.success} style={{ marginLeft: 4 }} />
                  )}
                </View>
                <Text style={styles.userDetail}>
                  {t.teacher?.major ?? 'Branş yok'}
                  {t.teacher?.subscription_status ? '  •  Aktif' : '  •  Pasif'}
                </Text>
                <Text style={styles.userMeta}>
                  {t.teacher ? `${t.teacher.view_count} görüntülenme  •  ${t.teacher.contact_count} iletişim` : ''}
                </Text>
              </View>
              <Text style={styles.userDate}>
                {new Date(t.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}
              </Text>
            </View>
          ))}

          {/* Parents */}
          <Text style={[styles.sectionLabel, { marginTop: 24 }]}>VELİLER ({parents.length})</Text>
          {parents.map((p) => (
            <View key={p.id} style={styles.userRow}>
              <View style={styles.userAvatarContainer}>
                {p.avatar_url ? (
                  <Image source={{ uri: p.avatar_url }} style={styles.userAvatar} />
                ) : (
                  <View style={[styles.userAvatar, styles.userAvatarPlaceholder]}>
                    <Text style={styles.userAvatarText}>
                      {(p.full_name || '?').charAt(0).toUpperCase()}
                    </Text>
                  </View>
                )}
              </View>
              <View style={styles.userInfo}>
                <Text style={styles.userNameText} numberOfLines={1}>{p.full_name}</Text>
                <Text style={styles.userDetail}>Veli</Text>
              </View>
              <Text style={styles.userDate}>
                {new Date(p.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}
              </Text>
            </View>
          ))}
        </View>
      )}

      {activeTab === 'diplomas' && (
        <View>
          <View style={styles.headerSection}>
            <Text style={styles.title}>Diploma Onay Paneli</Text>
            <Text style={styles.subtitle}>
              Öğretmenlerin yüklediği diplomaları inceleyip onaylayın veya reddedin.
            </Text>
          </View>

          {pendingDiplomas.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="checkmark-circle" size={56} color={Colors.success} />
              <Text style={styles.emptyTitle}>
                Onay bekleyen diploma yok.
              </Text>
              <Text style={styles.emptySubtitle}>
                Yeni diploma yüklendiğinde burada görüntülenecektir.
              </Text>
            </View>
          ) : (
            pendingDiplomas.map((item) => {
              const profile = item.profile as any;
              const name = profile?.full_name ?? 'İsimsiz';
              const isProcessing = processingId === item.profile_id;

              return (
                <View key={item.profile_id} style={styles.card}>
                  <View style={styles.cardHeader}>
                    <View style={styles.teacherInfo}>
                      <Text style={styles.teacherName}>{name}</Text>
                      <Text style={styles.teacherMajor}>{item.major}</Text>
                    </View>
                    <Text style={styles.date}>
                      {new Date(item.created_at).toLocaleDateString('tr-TR')}
                    </Text>
                  </View>

                  {item.diploma_url && (
                    <TouchableOpacity
                      onPress={() => Linking.openURL(item.diploma_url).catch(() => {})}
                      activeOpacity={0.8}
                    >
                      <Image
                        source={{ uri: item.diploma_url }}
                        style={styles.diplomaImage}
                        resizeMode="contain"
                      />
                      <Text style={styles.viewHint}>Tam boyut için dokunun</Text>
                    </TouchableOpacity>
                  )}

                  <View style={styles.actionRow}>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.rejectButton]}
                      onPress={() => confirmAction(item.profile_id, 'rejected', name)}
                      activeOpacity={0.7}
                      disabled={isProcessing}
                    >
                      {isProcessing ? (
                        <ActivityIndicator size="small" color={Colors.error} />
                      ) : (
                        <>
                          <Ionicons name="close-circle" size={18} color={Colors.error} />
                          <Text style={styles.rejectText}>Reddet</Text>
                        </>
                      )}
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.actionButton, styles.approveButton]}
                      onPress={() => confirmAction(item.profile_id, 'approved', name)}
                      activeOpacity={0.7}
                      disabled={isProcessing}
                    >
                      {isProcessing ? (
                        <ActivityIndicator size="small" color={Colors.textOnDark} />
                      ) : (
                        <>
                          <Ionicons name="checkmark-circle" size={18} color={Colors.textOnDark} />
                          <Text style={styles.approveText}>Onayla</Text>
                        </>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })
          )}
        </View>
      )}

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    paddingTop: 16,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
  },

  // Tabs
  tabRow: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 20,
    gap: 10,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: Colors.navyLight,
    gap: 6,
  },
  tabActive: {
    backgroundColor: Colors.navy,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.navy,
  },
  tabTextActive: {
    color: Colors.textOnDark,
  },

  // Stats
  statsContainer: {
    paddingHorizontal: 16,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textTertiary,
    letterSpacing: 0.5,
    marginBottom: 10,
    marginTop: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 16,
    alignItems: 'center',
    gap: 6,
  },
  statCardWarning: {
    borderColor: Colors.orange,
    backgroundColor: Colors.orangeLight,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textTertiary,
    textAlign: 'center',
  },
  recentRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  recentCard: {
    flex: 1,
    backgroundColor: Colors.successLight,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    gap: 4,
  },
  recentValue: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.success,
  },
  recentLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },

  // Diploma section
  headerSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 10,
  },
  emptySubtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  card: {
    backgroundColor: Colors.surface,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 16,
  },
  teacherInfo: {
    flex: 1,
  },
  teacherName: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  teacherMajor: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  date: {
    fontSize: 13,
    color: Colors.textTertiary,
  },
  diplomaImage: {
    width: '100%',
    height: 220,
    backgroundColor: Colors.border,
  },
  viewHint: {
    fontSize: 12,
    color: Colors.textTertiary,
    textAlign: 'center',
    paddingVertical: 6,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    gap: 6,
  },
  rejectButton: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.error,
  },
  approveButton: {
    backgroundColor: Colors.success,
  },
  rejectText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.error,
  },
  approveText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textOnDark,
  },
  // Users tab
  usersContainer: {
    paddingHorizontal: 16,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 12,
    marginBottom: 8,
  },
  userAvatarContainer: {
    marginRight: 12,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  userAvatarPlaceholder: {
    backgroundColor: Colors.navyLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userAvatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.navy,
  },
  userInfo: {
    flex: 1,
  },
  userNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userNameText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
    flexShrink: 1,
  },
  userDetail: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  userMeta: {
    fontSize: 12,
    color: Colors.textTertiary,
    marginTop: 2,
  },
  userDate: {
    fontSize: 12,
    color: Colors.textTertiary,
    marginLeft: 8,
  },
  bottomSpacer: {
    height: 20,
  },
});
