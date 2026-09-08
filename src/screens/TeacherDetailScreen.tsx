import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  Linking,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons, MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import { fetchTeacher, logView, logContact } from '../services/teacherService';
import { formatPrice, getInitials, formatWhatsAppUrl } from '../utils/formatters';
import { useAuth } from '../contexts/AuthContext';
import type { TeacherWithDetails } from '../types/teacher';
import type { RootStackParamList } from '../types/navigation';
import VideoPlayerModal from '../components/VideoPlayerModal';

type RouteProps = NativeStackScreenProps<RootStackParamList, 'TeacherDetail'>['route'];

export default function TeacherDetailScreen() {
  const route = useRoute<RouteProps>();
  const navigation = useNavigation<any>();
  const { state } = useAuth();
  const { teacherId } = route.params;

  const [teacher, setTeacher] = useState<TeacherWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [videoModalVisible, setVideoModalVisible] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const data = await fetchTeacher(teacherId);
        if (!cancelled) {
          setTeacher(data);
          if (data) {
            logView(teacherId, state.user?.id);
          }
        }
      } catch {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [teacherId]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.navy} />
      </View>
    );
  }

  if (error || !teacher) {
    return (
      <View style={styles.centered}>
        <Ionicons name="alert-circle-outline" size={48} color={Colors.error} />
        <Text style={styles.errorTitle}>Öğretmen bulunamadı</Text>
        <Text style={styles.errorSubtitle}>
          Bu profil kaldırılmış veya mevcut olmayabilir.
        </Text>
      </View>
    );
  }

  const { profile, categories, tags, modes, locations } = teacher;

  const hasOnline = modes.some((m) => m.mode === 'online');
  const hasFaceToFace = modes.some((m) => m.mode === 'face_to_face');

  const handleWhatsApp = () => {
    const message = `Merhaba, Dersteyiz üzerinden ${teacher.major} dersi için iletişime geçiyorum.`;
    const url = formatWhatsAppUrl(teacher.phone_number, message);
    Linking.openURL(url).catch(() => {});
    if (state.user) {
      logContact(teacherId, state.user.id);
    }
  };

  const handleReport = () => {
    navigation.navigate('Report', { teacherId: teacher.profile_id });
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Avatar + Name */}
      <View style={styles.profileHeader}>
        {profile?.avatar_url ? (
          <Image source={{ uri: profile.avatar_url }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.avatarPlaceholder]}>
            <Text style={styles.avatarInitials}>
              {getInitials(profile?.full_name ?? '')}
            </Text>
          </View>
        )}

        <View style={styles.nameRow}>
          <Text style={styles.name}>{profile?.full_name ?? ''}</Text>
          {teacher.is_verified && (
            <MaterialIcons
              name="verified"
              size={22}
              color={Colors.navy}
              style={styles.verifiedIcon}
            />
          )}
        </View>

        <View style={styles.majorRateRow}>
          <Text style={styles.major}>{teacher.major}</Text>
          <Text style={styles.dot}>{'\u00B7'}</Text>
          <Text style={styles.rate}>
            {formatPrice(teacher.hourly_rate)} / saat
          </Text>
        </View>

        {teacher.university ? (
          <View style={styles.universityRow}>
            <Ionicons name="school-outline" size={14} color={Colors.textTertiary} />
            <Text style={styles.universityText}>{teacher.university}</Text>
          </View>
        ) : null}
      </View>

      {/* Video Button */}
      {teacher.video_url && (
        <TouchableOpacity
          style={styles.videoButton}
          onPress={() => setVideoModalVisible(true)}
          activeOpacity={0.7}
        >
          <Ionicons name="play-circle" size={20} color={Colors.navy} />
          <Text style={styles.videoButtonText}>Kendini Tanıtıyor</Text>
          <Ionicons name="chevron-forward" size={16} color={Colors.textSecondary} />
        </TouchableOpacity>
      )}

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{teacher.view_count}</Text>
          <Text style={styles.statLabel}>Görüntülenme</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{teacher.contact_count}</Text>
          <Text style={styles.statLabel}>İletişim</Text>
        </View>
      </View>

      {/* Bio */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Hakkında</Text>
        <Text style={styles.bioText}>{teacher.bio}</Text>
      </View>

      {/* Categories */}
      {categories.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Kategoriler</Text>
          <View style={styles.badgesContainer}>
            {categories.map((c) => (
              <View key={`cat-${c.category.id}`} style={styles.badgeNavy}>
                <Text style={styles.badgeNavyText}>{c.category.name}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Tags */}
      {tags.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Etiketler</Text>
          <View style={styles.badgesContainer}>
            {tags.map((t) => (
              <View key={`tag-${t.tag.id}`} style={styles.badgeGray}>
                <Text style={styles.badgeGrayText}>{t.tag.name}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Teaching Modes */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Ders Verme Şekli</Text>
        <View style={styles.modesContainer}>
          {hasOnline && (
            <View style={styles.modeItem}>
              <Ionicons name="videocam-outline" size={18} color={Colors.navy} />
              <Text style={styles.modeText}>Online</Text>
            </View>
          )}
          {hasFaceToFace && (
            <View style={styles.modeItem}>
              <Ionicons name="people-outline" size={18} color={Colors.navy} />
              <Text style={styles.modeText}>Yüz Yüze</Text>
            </View>
          )}
        </View>
      </View>

      {/* Locations */}
      {locations.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Konum</Text>
          {locations.map((loc) => (
            <View key={loc.id} style={styles.locationItem}>
              <Ionicons name="location-sharp" size={16} color={Colors.textSecondary} />
              <Text style={styles.locationText}>
                {loc.district}, {loc.city}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* WhatsApp Button */}
      {state.user ? (
        <TouchableOpacity
          style={styles.whatsappButton}
          onPress={handleWhatsApp}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons name="whatsapp" size={22} color={Colors.textOnDark} />
          <Text style={styles.whatsappButtonText}>
            WhatsApp ile İletişime Geç
          </Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.loginPrompt}>
          <Ionicons name="lock-closed" size={18} color={Colors.textSecondary} />
          <Text style={styles.loginText}>
            Bu öğretmenle iletişime geçmek için giriş yapın.
          </Text>
        </View>
      )}

      {/* Report Link */}
      <TouchableOpacity
        style={styles.reportButton}
        onPress={handleReport}
        activeOpacity={0.7}
      >
        <Ionicons name="flag-outline" size={16} color={Colors.textTertiary} />
        <Text style={styles.reportText}>Şikâyet Et</Text>
      </TouchableOpacity>

      {/* Video Player Modal */}
      {teacher.video_url && videoModalVisible && (
        <VideoPlayerModal
          visible
          videoUrl={teacher.video_url}
          onClose={() => setVideoModalVisible(false)}
        />
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
    paddingBottom: 40,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
    paddingHorizontal: 32,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: 16,
    marginBottom: 8,
  },
  errorSubtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  profileHeader: {
    alignItems: 'center',
    paddingTop: 24,
    paddingBottom: 20,
    paddingHorizontal: 16,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    marginBottom: 16,
  },
  avatarPlaceholder: {
    backgroundColor: Colors.navyLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitials: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.navy,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  name: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  verifiedIcon: {
    marginLeft: 6,
  },
  majorRateRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  major: {
    fontSize: 15,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  dot: {
    fontSize: 15,
    color: Colors.textTertiary,
    marginHorizontal: 8,
  },
  rate: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.orange,
  },
  universityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 6,
  },
  universityText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  videoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.navyLight,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  videoButtonText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: Colors.navy,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    paddingVertical: 16,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statItem: {
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.navy,
  },
  statLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: Colors.border,
  },
  section: {
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 10,
  },
  bioText: {
    fontSize: 15,
    color: Colors.textSecondary,
    lineHeight: 24,
  },
  badgesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  badgeNavy: {
    backgroundColor: Colors.navyLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  badgeNavyText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.navy,
  },
  badgeGray: {
    backgroundColor: Colors.border,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  badgeGrayText: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  modesContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  modeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 8,
  },
  modeText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  locationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 6,
  },
  locationText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  whatsappButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.whatsapp,
    borderRadius: 14,
    paddingVertical: 16,
    marginHorizontal: 16,
    marginTop: 28,
    gap: 10,
  },
  whatsappButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textOnDark,
  },
  loginPrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.border,
    borderRadius: 14,
    paddingVertical: 16,
    marginHorizontal: 16,
    marginTop: 28,
    gap: 10,
  },
  loginText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  reportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    marginTop: 20,
    gap: 6,
  },
  reportText: {
    fontSize: 14,
    color: Colors.textTertiary,
  },
  bottomSpacer: {
    height: 20,
  },
});
