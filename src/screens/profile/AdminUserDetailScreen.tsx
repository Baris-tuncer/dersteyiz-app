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
  Linking,
  RefreshControl,
} from 'react-native';
import { useRoute, useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { supabase } from '../../config/supabase';
import { getInitials } from '../../utils/formatters';

interface ProfileData {
  id: string;
  full_name: string;
  avatar_url: string | null;
  role: string;
  is_admin: boolean;
  created_at: string;
  last_active_at: string | null;
  phone_number?: string;
}

interface TeacherData {
  profile_id: string;
  major: string;
  bio: string | null;
  university: string | null;
  experience_years: number | null;
  hourly_rate: number | null;
  subscription_status: boolean;
  is_verified: boolean;
  diploma_status: string | null;
  diploma_url: string | null;
  video_url: string | null;
  view_count: number;
  contact_count: number;
  phone_number: string | null;
}

interface LocationData {
  city: string;
  district: string | null;
}

interface ModeData {
  mode: string;
}

interface TagData {
  tag: string;
}

interface CategoryData {
  category_id: string;
  categories: { name: string }[] | { name: string } | null;
}

export default function AdminUserDetailScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { userId } = route.params;

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [teacher, setTeacher] = useState<TeacherData | null>(null);
  const [locations, setLocations] = useState<LocationData[]>([]);
  const [modes, setModes] = useState<ModeData[]>([]);
  const [tags, setTags] = useState<TagData[]>([]);
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [email, setEmail] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [processing, setProcessing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      // Profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, role, is_admin, created_at, last_active_at, phone_number')
        .eq('id', userId)
        .single();

      if (!profileData) return;
      setProfile(profileData);

      // Get email via admin RPC
      const { data: emailData } = await supabase.rpc('get_user_email', { target_user_id: userId });
      if (emailData) setEmail(emailData);

      if (profileData.role === 'teacher') {
        const [teacherRes, locRes, modeRes, tagRes, catRes] = await Promise.all([
          supabase
            .from('teachers')
            .select('*')
            .eq('profile_id', userId)
            .single(),
          supabase
            .from('teacher_locations')
            .select('city, district')
            .eq('teacher_id', userId),
          supabase
            .from('teacher_modes')
            .select('mode')
            .eq('teacher_id', userId),
          supabase
            .from('teacher_tags')
            .select('tag')
            .eq('teacher_id', userId),
          supabase
            .from('teacher_categories')
            .select('category_id, categories(name)')
            .eq('teacher_id', userId),
        ]);

        if (teacherRes.data) setTeacher(teacherRes.data);
        setLocations(locRes.data ?? []);
        setModes(modeRes.data ?? []);
        setTags(tagRes.data ?? []);
        setCategories(catRes.data ?? []);
      }
    } catch {
      Alert.alert('Hata', 'Kullanıcı bilgileri yüklenemedi.');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData]),
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleToggleSubscription = async () => {
    if (!teacher) return;
    const newStatus = !teacher.subscription_status;
    const label = newStatus ? 'aktif' : 'pasif';

    Alert.alert(
      'Abonelik Durumu',
      `Aboneliği ${label} yapmak istediğinize emin misiniz?`,
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Evet',
          onPress: async () => {
            setProcessing(true);
            try {
              await supabase
                .from('teachers')
                .update({ subscription_status: newStatus })
                .eq('profile_id', userId);
              setTeacher({ ...teacher, subscription_status: newStatus });
            } catch {
              Alert.alert('Hata', 'İşlem başarısız.');
            } finally {
              setProcessing(false);
            }
          },
        },
      ],
    );
  };

  const handleToggleAdmin = async () => {
    if (!profile) return;
    const newStatus = !profile.is_admin;
    const label = newStatus ? 'admin yap' : 'admin kaldır';

    Alert.alert(
      'Admin Durumu',
      `Bu kullanıcıyı ${label}mak istediğinize emin misiniz?`,
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Evet',
          onPress: async () => {
            setProcessing(true);
            try {
              await supabase
                .from('profiles')
                .update({ is_admin: newStatus })
                .eq('id', userId);
              setProfile({ ...profile, is_admin: newStatus });
            } catch {
              Alert.alert('Hata', 'İşlem başarısız.');
            } finally {
              setProcessing(false);
            }
          },
        },
      ],
    );
  };

  const handleDeleteUser = () => {
    Alert.alert(
      'Kullanıcıyı Sil',
      `${profile?.full_name} adlı kullanıcıyı silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`,
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            setProcessing(true);
            try {
              // Delete teacher record first if exists
              if (profile?.role === 'teacher') {
                await supabase.from('teacher_locations').delete().eq('teacher_id', userId);
                await supabase.from('teacher_modes').delete().eq('teacher_id', userId);
                await supabase.from('teacher_tags').delete().eq('teacher_id', userId);
                await supabase.from('teacher_categories').delete().eq('teacher_id', userId);
                await supabase.from('teachers').delete().eq('profile_id', userId);
              }
              await supabase.from('push_tokens').delete().eq('user_id', userId);
              await supabase.from('notification_preferences').delete().eq('user_id', userId);
              await supabase.from('notifications').delete().eq('user_id', userId);
              await supabase.from('profiles').delete().eq('id', userId);

              Alert.alert('Başarılı', 'Kullanıcı silindi.');
              navigation.goBack();
            } catch {
              Alert.alert('Hata', 'Kullanıcı silinemedi.');
            } finally {
              setProcessing(false);
            }
          },
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

  if (!profile) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.emptyText}>Kullanıcı bulunamadı.</Text>
      </View>
    );
  }

  const isTeacher = profile.role === 'teacher';

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={Colors.navy} />}
    >
      {/* Profile Header */}
      <View style={styles.headerCard}>
        {profile.avatar_url ? (
          <Image source={{ uri: profile.avatar_url }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.avatarPlaceholder]}>
            <Text style={styles.avatarText}>{getInitials(profile.full_name)}</Text>
          </View>
        )}
        <Text style={styles.name}>{profile.full_name}</Text>
        <View style={styles.badgeRow}>
          <View style={[styles.badge, isTeacher ? styles.badgeTeacher : styles.badgeParent]}>
            <Text style={styles.badgeText}>{isTeacher ? 'Öğretmen' : 'Veli'}</Text>
          </View>
          {profile.is_admin && (
            <View style={[styles.badge, styles.badgeAdmin]}>
              <Text style={styles.badgeText}>Admin</Text>
            </View>
          )}
          {isTeacher && teacher?.is_verified && (
            <View style={[styles.badge, styles.badgeVerified]}>
              <Ionicons name="checkmark-circle" size={12} color={Colors.textOnDark} />
              <Text style={styles.badgeText}>Onaylı</Text>
            </View>
          )}
          {isTeacher && (
            <View style={[styles.badge, teacher?.subscription_status ? styles.badgePremium : styles.badgeFree]}>
              <Text style={styles.badgeText}>
                {teacher?.subscription_status ? 'Premium' : 'Ücretsiz'}
              </Text>
            </View>
          )}
        </View>
        <Text style={styles.dateText}>
          Kayıt: {new Date(profile.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
        </Text>
        {profile.last_active_at && (
          <Text style={styles.dateTextSub}>
            Son aktif: {new Date(profile.last_active_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
          </Text>
        )}
      </View>

      {/* Contact Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>İLETİŞİM</Text>
        <InfoRow icon="mail-outline" label="E-posta" value={email || 'Bilinmiyor'} />
        <InfoRow icon="call-outline" label="Telefon" value={teacher?.phone_number || profile.phone_number || 'Belirtilmemiş'} />
        {(teacher?.phone_number || profile.phone_number) ? (
          <TouchableOpacity
            style={styles.whatsappButton}
            onPress={() => Linking.openURL(`https://wa.me/${(teacher?.phone_number || profile.phone_number || '').replace(/\D/g, '')}`).catch(() => {})}
            activeOpacity={0.7}
          >
            <Ionicons name="logo-whatsapp" size={16} color={Colors.success} />
            <Text style={styles.whatsappText}>WhatsApp'tan Yaz</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Teacher Details */}
      {isTeacher && teacher && (
        <>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>ÖĞRETMEN BİLGİLERİ</Text>
            <InfoRow icon="school-outline" label="Branş" value={teacher.major || 'Belirtilmemiş'} />
            <InfoRow icon="business-outline" label="Üniversite" value={teacher.university || 'Belirtilmemiş'} />
            <InfoRow icon="time-outline" label="Deneyim" value={teacher.experience_years ? `${teacher.experience_years} yıl` : 'Belirtilmemiş'} />
            <InfoRow icon="cash-outline" label="Saatlik Ücret" value={teacher.hourly_rate ? `₺${teacher.hourly_rate}` : 'Belirtilmemiş'} />
            {teacher.bio && <InfoRow icon="document-text-outline" label="Biyografi" value={teacher.bio} />}
          </View>

          {/* Locations */}
          {locations.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>LOKASYONLAR</Text>
              {locations.map((loc, i) => (
                <InfoRow
                  key={i}
                  icon="location-outline"
                  label={loc.city}
                  value={loc.district || 'Tüm ilçeler'}
                />
              ))}
            </View>
          )}

          {/* Modes */}
          {modes.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>DERS ŞEKLİ</Text>
              <View style={styles.chipRow}>
                {modes.map((m, i) => (
                  <View key={i} style={styles.chip}>
                    <Text style={styles.chipText}>{m.mode}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Tags */}
          {tags.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>ETİKETLER</Text>
              <View style={styles.chipRow}>
                {tags.map((t, i) => (
                  <View key={i} style={styles.chip}>
                    <Text style={styles.chipText}>{t.tag}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Categories */}
          {categories.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>KATEGORİLER</Text>
              <View style={styles.chipRow}>
                {categories.map((c, i) => (
                  <View key={i} style={styles.chip}>
                    <Text style={styles.chipText}>
                      {Array.isArray(c.categories) ? c.categories[0]?.name : c.categories?.name ?? 'Bilinmiyor'}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Video */}
          {teacher.video_url && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>TANITIM VİDEOSU</Text>
              <TouchableOpacity
                style={styles.videoButton}
                onPress={() => Linking.openURL(teacher.video_url!).catch(() => {})}
                activeOpacity={0.7}
              >
                <Ionicons name="play-circle" size={24} color={Colors.navy} />
                <Text style={styles.videoButtonText}>Videoyu Aç</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Stats */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>İSTATİSTİKLER</Text>
            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <Ionicons name="eye" size={20} color={Colors.navy} />
                <Text style={styles.statValue}>{teacher.view_count}</Text>
                <Text style={styles.statLabel}>Görüntülenme</Text>
              </View>
              <View style={styles.statCard}>
                <Ionicons name="chatbubbles" size={20} color={Colors.navy} />
                <Text style={styles.statValue}>{teacher.contact_count}</Text>
                <Text style={styles.statLabel}>İletişim</Text>
              </View>
            </View>
          </View>

          {/* Diploma */}
          {teacher.diploma_url && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                BELGE ({teacher.diploma_status === 'approved' ? 'Onaylı' : teacher.diploma_status === 'rejected' ? 'Reddedildi' : 'Bekliyor'})
              </Text>
              <TouchableOpacity onPress={() => Linking.openURL(teacher.diploma_url!).catch(() => {})} activeOpacity={0.8}>
                <Image source={{ uri: teacher.diploma_url }} style={styles.diplomaImage} resizeMode="contain" />
                <Text style={styles.viewHint}>Tam boyut için dokunun</Text>
              </TouchableOpacity>
            </View>
          )}
        </>
      )}

      {/* Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>AKSIYONLAR</Text>

        {isTeacher && (
          <TouchableOpacity
            style={[styles.actionButton, teacher?.subscription_status ? styles.actionWarning : styles.actionSuccess]}
            onPress={handleToggleSubscription}
            disabled={processing}
            activeOpacity={0.7}
          >
            <Ionicons
              name={teacher?.subscription_status ? 'close-circle' : 'checkmark-circle'}
              size={18}
              color={teacher?.subscription_status ? Colors.orange : Colors.success}
            />
            <Text style={[styles.actionText, { color: teacher?.subscription_status ? Colors.orange : Colors.success }]}>
              {teacher?.subscription_status ? 'Aboneliği Pasife Al' : 'Aboneliği Aktif Et'}
            </Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.actionButton, profile.is_admin ? styles.actionWarning : styles.actionDefault]}
          onPress={handleToggleAdmin}
          disabled={processing}
          activeOpacity={0.7}
        >
          <Ionicons
            name={profile.is_admin ? 'shield-outline' : 'shield-checkmark-outline'}
            size={18}
            color={profile.is_admin ? Colors.orange : Colors.navy}
          />
          <Text style={[styles.actionText, { color: profile.is_admin ? Colors.orange : Colors.navy }]}>
            {profile.is_admin ? 'Admin Yetkisini Kaldır' : 'Admin Yap'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.actionDanger]}
          onPress={handleDeleteUser}
          disabled={processing}
          activeOpacity={0.7}
        >
          <Ionicons name="trash-outline" size={18} color={Colors.error} />
          <Text style={[styles.actionText, { color: Colors.error }]}>Kullanıcıyı Sil</Text>
        </TouchableOpacity>
      </View>

      {processing && (
        <View style={styles.processingOverlay}>
          <ActivityIndicator size="large" color={Colors.navy} />
        </View>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

function InfoRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Ionicons name={icon as any} size={16} color={Colors.textTertiary} style={styles.infoIcon} />
      <View style={styles.infoContent}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },
  content: { paddingBottom: 40 },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.background },
  emptyText: { fontSize: 16, color: Colors.textSecondary },

  // Header
  headerCard: {
    backgroundColor: Colors.surface,
    alignItems: 'center',
    paddingVertical: 28,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  avatar: { width: 80, height: 80, borderRadius: 40, marginBottom: 12 },
  avatarPlaceholder: { backgroundColor: Colors.navyLight, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 28, fontWeight: '700', color: Colors.navy },
  name: { fontSize: 22, fontWeight: '800', color: Colors.textPrimary, marginBottom: 8 },
  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, justifyContent: 'center', marginBottom: 10 },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeTeacher: { backgroundColor: Colors.navy },
  badgeParent: { backgroundColor: Colors.textSecondary },
  badgeAdmin: { backgroundColor: Colors.error },
  badgeVerified: { backgroundColor: Colors.success },
  badgePremium: { backgroundColor: Colors.orange },
  badgeFree: { backgroundColor: Colors.textTertiary },
  badgeText: { fontSize: 11, fontWeight: '700', color: Colors.textOnDark },
  dateText: { fontSize: 13, color: Colors.textSecondary },
  dateTextSub: { fontSize: 12, color: Colors.textTertiary, marginTop: 2 },

  // Section
  section: {
    backgroundColor: Colors.surface,
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.border,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textTertiary,
    letterSpacing: 0.5,
    marginBottom: 12,
  },

  // Info Row
  infoRow: { flexDirection: 'row', paddingVertical: 8, alignItems: 'flex-start' },
  infoIcon: { marginRight: 10, marginTop: 2, width: 20 },
  infoContent: { flex: 1 },
  infoLabel: { fontSize: 12, color: Colors.textTertiary, marginBottom: 2 },
  infoValue: { fontSize: 15, color: Colors.textPrimary, fontWeight: '500' },

  // Chips
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { backgroundColor: Colors.navyLight, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  chipText: { fontSize: 13, color: Colors.navy, fontWeight: '600' },

  // Stats
  statsRow: { flexDirection: 'row', gap: 12 },
  statCard: {
    flex: 1,
    backgroundColor: Colors.navyLight,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    gap: 4,
  },
  statValue: { fontSize: 20, fontWeight: '800', color: Colors.textPrimary },
  statLabel: { fontSize: 11, fontWeight: '600', color: Colors.textSecondary },

  // WhatsApp button
  whatsappButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: `${Colors.success}15`,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  whatsappText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.success,
  },

  // Video
  videoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.navyLight,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  videoButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.navy,
  },

  // Diploma
  diplomaImage: { width: '100%', height: 200, backgroundColor: Colors.border, borderRadius: 8, marginBottom: 4 },
  viewHint: { fontSize: 12, color: Colors.textTertiary, textAlign: 'center' },

  // Actions
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  actionDefault: { borderColor: Colors.border, backgroundColor: Colors.surface },
  actionSuccess: { borderColor: Colors.success, backgroundColor: `${Colors.success}10` },
  actionWarning: { borderColor: Colors.orange, backgroundColor: Colors.orangeLight },
  actionDanger: { borderColor: Colors.error, backgroundColor: `${Colors.error}10` },
  actionText: { fontSize: 15, fontWeight: '600' },

  processingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
