import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Linking,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { supabase } from '../../config/supabase';
import { MONTHLY_PRICE } from '../../constants/subscription';

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

interface SubscriberInfo {
  profile_id: string;
  major: string;
  full_name: string;
}

interface PaywallFunnel {
  viewed: number;
  tapped: number;
  started: number;
  completed: number;
  failed: number;
  cancelled: number;
  restored: number;
}

interface PaywallEventRow {
  id: string;
  event: string;
  created_at: string;
  full_name: string;
}

type Tab = 'stats' | 'users' | 'diplomas' | 'notifications' | 'paywall';

export default function AdminPanelScreen() {
  const navigation = useNavigation<any>();
  const [activeTab, setActiveTab] = useState<Tab>('stats');
  const [pendingDiplomas, setPendingDiplomas] = useState<PendingDiploma[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [subscribers, setSubscribers] = useState<SubscriberInfo[]>([]);
  const [teachers, setTeachers] = useState<TeacherUser[]>([]);
  const [parents, setParents] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);
  // Notification state
  const [notifTarget, setNotifTarget] = useState<'all' | 'teacher' | 'parent'>('all');
  const [notifTitle, setNotifTitle] = useState('');
  const [notifBody, setNotifBody] = useState('');
  const [sendingNotif, setSendingNotif] = useState(false);
  // Paywall analytics state
  const [paywallFunnel, setPaywallFunnel] = useState<PaywallFunnel | null>(null);
  const [paywallEvents, setPaywallEvents] = useState<PaywallEventRow[]>([]);

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

      // Load subscriber list
      const { data: subTeachers } = await supabase
        .from('teachers')
        .select('profile_id, major')
        .eq('subscription_status', true);

      if (subTeachers && subTeachers.length > 0) {
        const subIds = subTeachers.map((s) => s.profile_id);
        const { data: subProfiles } = await supabase
          .from('profiles')
          .select('id, full_name')
          .in('id', subIds);

        const profileMap = new Map((subProfiles ?? []).map((p) => [p.id, p.full_name]));
        setSubscribers(
          subTeachers.map((s) => ({
            profile_id: s.profile_id,
            major: s.major,
            full_name: profileMap.get(s.profile_id) ?? 'İsimsiz',
          })),
        );
      } else {
        setSubscribers([]);
      }
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
      Alert.alert('Hata', err?.message || 'Belgeler yüklenemedi.');
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

  const loadPaywallAnalytics = useCallback(async () => {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const since = thirtyDaysAgo.toISOString();

      // Get event counts
      const events = ['paywall_viewed', 'subscribe_tapped', 'purchase_started', 'purchase_completed', 'purchase_failed', 'purchase_cancelled', 'restore_tapped'];
      const counts = await Promise.all(
        events.map((e) =>
          supabase.from('paywall_events').select('id', { count: 'exact', head: true }).eq('event', e).gte('created_at', since),
        ),
      );

      setPaywallFunnel({
        viewed: counts[0].count ?? 0,
        tapped: counts[1].count ?? 0,
        started: counts[2].count ?? 0,
        completed: counts[3].count ?? 0,
        failed: counts[4].count ?? 0,
        cancelled: counts[5].count ?? 0,
        restored: counts[6].count ?? 0,
      });

      // Get recent events with user names
      const { data: recentEvents } = await supabase
        .from('paywall_events')
        .select('id, event, created_at, user_id')
        .order('created_at', { ascending: false })
        .limit(20);

      if (recentEvents && recentEvents.length > 0) {
        const userIds = [...new Set(recentEvents.map((e) => e.user_id))];
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name')
          .in('id', userIds);

        const nameMap = new Map((profiles ?? []).map((p) => [p.id, p.full_name]));
        setPaywallEvents(
          recentEvents.map((e) => ({
            id: e.id,
            event: e.event,
            created_at: e.created_at,
            full_name: nameMap.get(e.user_id) ?? 'Bilinmeyen',
          })),
        );
      } else {
        setPaywallEvents([]);
      }
    } catch {
      // Non-critical
    }
  }, []);

  const loadAll = useCallback(async () => {
    setLoading(true);
    await Promise.all([loadStats(), loadPending(), loadUsers(), loadPaywallAnalytics()]);
    setLoading(false);
  }, [loadStats, loadPending, loadUsers, loadPaywallAnalytics]);

  useFocusEffect(
    useCallback(() => {
      loadAll();
    }, [loadAll]),
  );

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([loadStats(), loadPending(), loadUsers(), loadPaywallAnalytics()]);
    setRefreshing(false);
  }, [loadStats, loadPending, loadUsers, loadPaywallAnalytics]);

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
        action === 'approved' ? 'Belge onaylandı.' : 'Belge reddedildi.',
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
      `${teacherName} adlı öğretmenin belgesini ${label} istediğinize emin misiniz?`,
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
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabScroll} contentContainerStyle={styles.tabRow}>
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
            Belgeler{pendingDiplomas.length > 0 ? ` (${pendingDiplomas.length})` : ''}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'paywall' && styles.tabActive]}
          onPress={() => setActiveTab('paywall')}
          activeOpacity={0.7}
        >
          <Ionicons name="funnel" size={16} color={activeTab === 'paywall' ? Colors.textOnDark : Colors.navy} />
          <Text style={[styles.tabText, activeTab === 'paywall' && styles.tabTextActive]}>Paywall</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'notifications' && styles.tabActive]}
          onPress={() => setActiveTab('notifications')}
          activeOpacity={0.7}
        >
          <Ionicons name="megaphone" size={16} color={activeTab === 'notifications' ? Colors.textOnDark : Colors.navy} />
          <Text style={[styles.tabText, activeTab === 'notifications' && styles.tabTextActive]}>Bildirim</Text>
        </TouchableOpacity>
      </ScrollView>

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
              <Text style={styles.statLabel}>Onaylı Belge</Text>
            </View>
            <View style={[styles.statCard, stats.pendingDiplomas > 0 && styles.statCardWarning]}>
              <Ionicons name="time" size={24} color={stats.pendingDiplomas > 0 ? Colors.orange : Colors.textTertiary} />
              <Text style={styles.statValue}>{stats.pendingDiplomas}</Text>
              <Text style={styles.statLabel}>Bekleyen Belge</Text>
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

          {/* Revenue */}
          <Text style={styles.sectionLabel}>GELİR</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Ionicons name="card" size={24} color={Colors.orange} />
              <Text style={styles.statValue}>{stats.activeSubscriptions}</Text>
              <Text style={styles.statLabel}>Aktif Abone</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="wallet" size={24} color={Colors.success} />
              <Text style={styles.statValue}>₺{stats.activeSubscriptions * 299}</Text>
              <Text style={styles.statLabel}>Tahmini Aylık</Text>
            </View>
          </View>

          {/* Subscriber List */}
          {subscribers.length > 0 && (
            <>
              <Text style={styles.sectionLabel}>AKTİF ABONELER</Text>
              {subscribers.map((s) => (
                <TouchableOpacity
                  key={s.profile_id}
                  style={styles.subscriberRow}
                  onPress={() => navigation.navigate('AdminUserDetail', { userId: s.profile_id })}
                  activeOpacity={0.7}
                >
                  <Ionicons name="star" size={16} color={Colors.orange} />
                  <View style={styles.subscriberInfo}>
                    <Text style={styles.subscriberName}>{s.full_name}</Text>
                    <Text style={styles.subscriberMajor}>{s.major}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={Colors.textTertiary} />
                </TouchableOpacity>
              ))}
            </>
          )}
        </View>
      )}

      {activeTab === 'users' && (
        <View style={styles.usersContainer}>
          {/* Teachers */}
          <Text style={styles.sectionLabel}>ÖĞRETMENLER ({teachers.length})</Text>
          {teachers.map((t) => (
            <TouchableOpacity key={t.id} style={styles.userRow} onPress={() => navigation.navigate('AdminUserDetail', { userId: t.id })} activeOpacity={0.7}>
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
            </TouchableOpacity>
          ))}

          {/* Parents */}
          <Text style={[styles.sectionLabel, { marginTop: 24 }]}>VELİLER ({parents.length})</Text>
          {parents.map((p) => (
            <TouchableOpacity key={p.id} style={styles.userRow} onPress={() => navigation.navigate('AdminUserDetail', { userId: p.id })} activeOpacity={0.7}>
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
            </TouchableOpacity>
          ))}
        </View>
      )}

      {activeTab === 'diplomas' && (
        <View>
          <View style={styles.headerSection}>
            <Text style={styles.title}>Belge Onay Paneli</Text>
            <Text style={styles.subtitle}>
              Öğretmenlerin yüklediği mezun belgesi ve sertifikaları inceleyip onaylayın veya reddedin.
            </Text>
          </View>

          {pendingDiplomas.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="checkmark-circle" size={56} color={Colors.success} />
              <Text style={styles.emptyTitle}>
                Onay bekleyen belge yok.
              </Text>
              <Text style={styles.emptySubtitle}>
                Yeni belge yüklendiğinde burada görüntülenecektir.
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

      {activeTab === 'paywall' && (
        <View style={styles.statsContainer}>
          {paywallFunnel && (
            <>
              <Text style={styles.sectionLabel}>PAYWALL DÖNÜŞÜM HUNİSİ (Son 30 Gün)</Text>
              <View style={styles.statsGrid}>
                <View style={styles.statCard}>
                  <Ionicons name="eye" size={24} color={Colors.navy} />
                  <Text style={styles.statValue}>{paywallFunnel.viewed}</Text>
                  <Text style={styles.statLabel}>Görüntüleme</Text>
                </View>
                <View style={styles.statCard}>
                  <Ionicons name="finger-print" size={24} color={Colors.orange} />
                  <Text style={styles.statValue}>{paywallFunnel.tapped}</Text>
                  <Text style={styles.statLabel}>Butona Bastı</Text>
                </View>
                <View style={styles.statCard}>
                  <Ionicons name="checkmark-circle" size={24} color={Colors.success} />
                  <Text style={styles.statValue}>{paywallFunnel.completed}</Text>
                  <Text style={styles.statLabel}>Abone Oldu</Text>
                </View>
              </View>

              <View style={styles.statsGrid}>
                <View style={styles.statCard}>
                  <Ionicons name="close-circle" size={24} color={Colors.error} />
                  <Text style={styles.statValue}>{paywallFunnel.cancelled}</Text>
                  <Text style={styles.statLabel}>Vazgeçti</Text>
                </View>
                <View style={styles.statCard}>
                  <Ionicons name="alert-circle" size={24} color={Colors.error} />
                  <Text style={styles.statValue}>{paywallFunnel.failed}</Text>
                  <Text style={styles.statLabel}>Hata Aldı</Text>
                </View>
                <View style={styles.statCard}>
                  <Ionicons name="refresh" size={24} color={Colors.navy} />
                  <Text style={styles.statValue}>{paywallFunnel.restored}</Text>
                  <Text style={styles.statLabel}>Geri Yükledi</Text>
                </View>
              </View>

              {paywallFunnel.viewed > 0 && (
                <>
                  <Text style={styles.sectionLabel}>DÖNÜŞÜM ORANLARI</Text>
                  <View style={styles.conversionCard}>
                    <View style={styles.conversionRow}>
                      <Text style={styles.conversionLabel}>Görüntüleme → Butona Bastı</Text>
                      <Text style={styles.conversionValue}>
                        {Math.round((paywallFunnel.tapped / paywallFunnel.viewed) * 100)}%
                      </Text>
                    </View>
                    <View style={styles.conversionRow}>
                      <Text style={styles.conversionLabel}>Görüntüleme → Abone Oldu</Text>
                      <Text style={[styles.conversionValue, { color: Colors.success }]}>
                        {Math.round((paywallFunnel.completed / paywallFunnel.viewed) * 100)}%
                      </Text>
                    </View>
                    {paywallFunnel.tapped > 0 && (
                      <View style={styles.conversionRow}>
                        <Text style={styles.conversionLabel}>Butona Bastı → Abone Oldu</Text>
                        <Text style={[styles.conversionValue, { color: Colors.success }]}>
                          {Math.round((paywallFunnel.completed / paywallFunnel.tapped) * 100)}%
                        </Text>
                      </View>
                    )}
                  </View>
                </>
              )}
            </>
          )}

          <Text style={styles.sectionLabel}>SON OLAYLAR</Text>
          {paywallEvents.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="analytics" size={56} color={Colors.textTertiary} />
              <Text style={styles.emptyTitle}>Henüz paywall verisi yok</Text>
              <Text style={styles.emptySubtitle}>Kullanıcılar Paywall ekranını görüntülediğinde veriler burada görünecek.</Text>
            </View>
          ) : (
            paywallEvents.map((e) => {
              const eventLabels: Record<string, { label: string; icon: string; color: string }> = {
                paywall_viewed: { label: 'Görüntüledi', icon: 'eye', color: Colors.navy },
                subscribe_tapped: { label: 'Butona Bastı', icon: 'finger-print', color: Colors.orange },
                purchase_started: { label: 'Satın Alma Başladı', icon: 'cart', color: Colors.navy },
                purchase_completed: { label: 'Abone Oldu', icon: 'checkmark-circle', color: Colors.success },
                purchase_failed: { label: 'Hata Aldı', icon: 'alert-circle', color: Colors.error },
                purchase_cancelled: { label: 'Vazgeçti', icon: 'close-circle', color: Colors.error },
                restore_tapped: { label: 'Geri Yükledi', icon: 'refresh', color: Colors.navy },
              };
              const info = eventLabels[e.event] ?? { label: e.event, icon: 'ellipse', color: Colors.textTertiary };
              return (
                <View key={e.id} style={styles.paywallEventRow}>
                  <Ionicons name={info.icon as any} size={20} color={info.color} />
                  <View style={styles.paywallEventInfo}>
                    <Text style={styles.paywallEventName}>{e.full_name}</Text>
                    <Text style={[styles.paywallEventLabel, { color: info.color }]}>{info.label}</Text>
                  </View>
                  <Text style={styles.paywallEventTime}>
                    {new Date(e.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}{' '}
                    {new Date(e.created_at).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>
              );
            })
          )}
        </View>
      )}

      {activeTab === 'notifications' && (
        <View style={styles.notifContainer}>
          <Text style={styles.sectionLabel}>HEDEF KİTLE</Text>
          <View style={styles.notifTargetRow}>
            {(['all', 'teacher', 'parent'] as const).map((target) => (
              <TouchableOpacity
                key={target}
                style={[styles.notifTargetBtn, notifTarget === target && styles.notifTargetBtnActive]}
                onPress={() => setNotifTarget(target)}
                activeOpacity={0.7}
              >
                <Text style={[styles.notifTargetText, notifTarget === target && styles.notifTargetTextActive]}>
                  {target === 'all' ? 'Herkese' : target === 'teacher' ? 'Öğretmenlere' : 'Velilere'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={[styles.sectionLabel, { marginTop: 20 }]}>BİLDİRİM İÇERİĞİ</Text>
          <TextInput
            style={styles.notifInput}
            placeholder="Başlık"
            placeholderTextColor={Colors.textTertiary}
            value={notifTitle}
            onChangeText={setNotifTitle}
          />
          <TextInput
            style={[styles.notifInput, styles.notifInputMulti]}
            placeholder="Mesaj"
            placeholderTextColor={Colors.textTertiary}
            value={notifBody}
            onChangeText={setNotifBody}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />

          <TouchableOpacity
            style={[styles.notifSendBtn, (!notifTitle.trim() || !notifBody.trim() || sendingNotif) && styles.notifSendBtnDisabled]}
            onPress={handleSendNotification}
            disabled={!notifTitle.trim() || !notifBody.trim() || sendingNotif}
            activeOpacity={0.7}
          >
            {sendingNotif ? (
              <ActivityIndicator color={Colors.textOnDark} />
            ) : (
              <>
                <Ionicons name="send" size={18} color={Colors.textOnDark} />
                <Text style={styles.notifSendText}>Bildirim Gönder</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );

  async function handleSendNotification() {
    const targetLabel = notifTarget === 'all' ? 'herkese' : notifTarget === 'teacher' ? 'öğretmenlere' : 'velilere';

    Alert.alert(
      'Bildirim Gönder',
      `"${notifTitle}" başlıklı bildirimi ${targetLabel} göndermek istediğinize emin misiniz?`,
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Gönder',
          onPress: async () => {
            setSendingNotif(true);
            try {
              // Get target user IDs
              let userIds: string[] = [];
              if (notifTarget === 'all') {
                const { data } = await supabase.from('profiles').select('id');
                userIds = (data ?? []).map((u) => u.id);
              } else {
                const { data } = await supabase.from('profiles').select('id').eq('role', notifTarget);
                userIds = (data ?? []).map((u) => u.id);
              }

              if (userIds.length === 0) {
                Alert.alert('Bilgi', 'Hedef kitlede kullanıcı bulunamadı.');
                return;
              }

              // Get push tokens
              const { data: tokens } = await supabase
                .from('push_tokens')
                .select('token')
                .in('user_id', userIds);

              const pushTokens = (tokens ?? []).map((t) => t.token);

              if (pushTokens.length === 0) {
                Alert.alert('Bilgi', 'Hedef kitlenin push token\'ı bulunamadı. Kimse bildirim almıyor olabilir.');
                return;
              }

              // Send via Expo Push API
              const messages = pushTokens.map((token) => ({
                to: token,
                sound: 'default',
                title: notifTitle,
                body: notifBody,
              }));

              // Send in batches of 100
              for (let i = 0; i < messages.length; i += 100) {
                const batch = messages.slice(i, i + 100);
                await fetch('https://exp.host/--/api/v2/push/send', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify(batch),
                });
              }

              // Also save to notifications table
              const notifRecords = userIds.map((uid) => ({
                user_id: uid,
                title: notifTitle,
                body: notifBody,
                type: 'admin_broadcast',
                read: false,
              }));

              await supabase.from('notifications').insert(notifRecords);

              Alert.alert('Başarılı', `${pushTokens.length} cihaza bildirim gönderildi.`);
              setNotifTitle('');
              setNotifBody('');
            } catch (err: any) {
              Alert.alert('Hata', err?.message || 'Bildirim gönderilemedi.');
            } finally {
              setSendingNotif(false);
            }
          },
        },
      ],
    );
  }
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
  tabScroll: {
    marginBottom: 20,
  },
  tabRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: Colors.navyLight,
    gap: 5,
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
  // Subscriber list
  subscriberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 12,
    marginBottom: 8,
    gap: 10,
  },
  subscriberInfo: {
    flex: 1,
  },
  subscriberName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  subscriberMajor: {
    fontSize: 12,
    color: Colors.textSecondary,
  },

  // Notifications tab
  notifContainer: {
    paddingHorizontal: 16,
  },
  notifTargetRow: {
    flexDirection: 'row',
    gap: 8,
  },
  notifTargetBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: Colors.navyLight,
    alignItems: 'center',
  },
  notifTargetBtnActive: {
    backgroundColor: Colors.navy,
  },
  notifTargetText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.navy,
  },
  notifTargetTextActive: {
    color: Colors.textOnDark,
  },
  notifInput: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: Colors.textPrimary,
    marginBottom: 10,
  },
  notifInputMulti: {
    minHeight: 100,
    paddingTop: 12,
  },
  notifSendBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.navy,
    borderRadius: 12,
    paddingVertical: 14,
    marginTop: 8,
  },
  notifSendBtnDisabled: {
    opacity: 0.5,
  },
  notifSendText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textOnDark,
  },
  // Paywall analytics
  conversionCard: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    marginBottom: 20,
  },
  conversionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  conversionLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  conversionValue: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.navy,
  },
  paywallEventRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 12,
    marginBottom: 8,
    gap: 10,
  },
  paywallEventInfo: {
    flex: 1,
  },
  paywallEventName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  paywallEventLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  paywallEventTime: {
    fontSize: 11,
    color: Colors.textTertiary,
  },
  bottomSpacer: {
    height: 20,
  },
});
