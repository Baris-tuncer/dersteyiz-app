import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Pressable,
  Linking,
  StyleSheet,
} from 'react-native';
import { Ionicons, MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import { formatPrice, getInitials, formatWhatsAppUrl } from '../utils/formatters';
import type { TeacherWithDetails } from '../types/teacher';
import Badge from './Badge';
import VideoPlayerModal from './VideoPlayerModal';
import StarRating from './StarRating';
import { useCompare } from '../contexts/CompareContext';

interface TeacherCardProps {
  teacher: TeacherWithDetails;
  onPress: () => void;
  isLoggedIn: boolean;
  isBoosted?: boolean;
  showCompare?: boolean;
}

export default function TeacherCard({ teacher, onPress, isLoggedIn, isBoosted, showCompare }: TeacherCardProps) {
  const [videoModalVisible, setVideoModalVisible] = useState(false);
  const { addToCompare, removeFromCompare, isInCompare } = useCompare();
  const { profile, categories, tags, modes, locations } = teacher;
  const inCompare = isInCompare(teacher.profile_id);

  const hasOnline = modes.some((m) => m.mode === 'online');
  const hasFaceToFace = modes.some((m) => m.mode === 'face_to_face');

  const locationText = locations.length > 0
    ? locations.map((l) => `${l.district}, ${l.city}`).join(' \u00B7 ')
    : null;

  const handleWhatsApp = () => {
    const message = `Merhaba, Dersteyiz üzerinden ${teacher.major} dersi için iletişime geçiyorum.`;
    const url = formatWhatsAppUrl(teacher.phone_number, message);
    Linking.openURL(url).catch(() => {});
  };

  return (
    <TouchableOpacity
      style={[styles.card, isBoosted && styles.cardBoosted]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Boost Badge */}
      {isBoosted && (
        <View style={styles.boostBadge}>
          <Ionicons name="rocket" size={12} color={Colors.textOnDark} />
          <Text style={styles.boostBadgeText}>Öne Çıkan</Text>
        </View>
      )}

      {/* Compare Checkbox */}
      {showCompare && (
        <TouchableOpacity
          style={styles.compareCheck}
          onPress={(e) => {
            e.stopPropagation?.();
            if (inCompare) {
              removeFromCompare(teacher.profile_id);
            } else {
              addToCompare(teacher);
            }
          }}
          hitSlop={8}
          activeOpacity={0.6}
        >
          <Ionicons
            name={inCompare ? 'checkbox' : 'square-outline'}
            size={22}
            color={inCompare ? Colors.navy : Colors.textTertiary}
          />
        </TouchableOpacity>
      )}

      {/* Header Row */}
      <View style={styles.header}>
        {profile?.avatar_url ? (
          <Image source={{ uri: profile.avatar_url }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.avatarPlaceholder]}>
            <Text style={styles.avatarInitials}>
              {getInitials(profile?.full_name ?? '')}
            </Text>
          </View>
        )}

        <View style={styles.headerInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.name} numberOfLines={1}>
              {profile?.full_name ?? ''}
            </Text>
            {teacher.is_verified && (
              <MaterialIcons
                name="verified"
                size={18}
                color={Colors.navy}
                style={styles.verifiedIcon}
              />
            )}
          </View>
          <Text style={styles.major}>{teacher.major}</Text>
          {teacher.university ? (
            <Text style={styles.university}>{teacher.university}</Text>
          ) : null}
          <Text style={styles.rate}>
            {formatPrice(teacher.hourly_rate)} / saat
          </Text>
          {teacher.avg_rating > 0 && (
            <View style={styles.ratingRow}>
              <StarRating rating={teacher.avg_rating} size={13} />
              <Text style={styles.ratingText}>
                {teacher.avg_rating.toFixed(1)} ({teacher.review_count})
              </Text>
            </View>
          )}
        </View>

      </View>

      {/* Bio */}
      <Text style={styles.bio} numberOfLines={2}>
        {teacher.bio}
      </Text>

      {/* Video Button */}
      {teacher.video_url && (
        <Pressable
          style={styles.videoButton}
          onPress={() => setVideoModalVisible(true)}
          onStartShouldSetResponder={() => true}
        >
          <Ionicons name="play-circle" size={20} color={Colors.navy} />
          <Text style={styles.videoButtonText}>Tanıtım Videosu</Text>
          <Ionicons name="chevron-forward" size={16} color={Colors.navy} />
        </Pressable>
      )}

      {/* Categories & Tags */}
      {(categories.length > 0 || tags.length > 0) && (
        <View style={styles.badgeWrap}>
          {categories.map((c) => (
            <Badge key={`cat-${c.category.id}`} label={c.category.name} variant="gray" />
          ))}
          {tags.map((t) => (
            <Badge key={`tag-${t.tag.id}`} label={t.tag.name} variant="gray" />
          ))}
        </View>
      )}

      {/* Modes */}
      <View style={styles.modesRow}>
        {hasOnline && (
          <View style={styles.modeItem}>
            <Ionicons name="videocam-outline" size={16} color={Colors.navy} />
            <Text style={styles.modeText}>Online</Text>
          </View>
        )}
        {hasFaceToFace && (
          <View style={styles.modeItem}>
            <Ionicons name="people-outline" size={16} color={Colors.navy} />
            <Text style={styles.modeText}>Yüz Yüze</Text>
          </View>
        )}
      </View>

      {/* Location */}
      {locationText && (
        <View style={styles.locationRow}>
          <Ionicons name="location-sharp" size={14} color={Colors.textSecondary} />
          <Text style={styles.locationText} numberOfLines={1}>
            {locationText}
          </Text>
        </View>
      )}

      {/* Video Player Modal */}
      {teacher.video_url && videoModalVisible && (
        <VideoPlayerModal
          visible
          videoUrl={teacher.video_url}
          onClose={() => setVideoModalVisible(false)}
        />
      )}

      {/* WhatsApp Button */}
      {isLoggedIn ? (
        <TouchableOpacity
          style={styles.whatsappButton}
          onPress={(e) => {
            e.stopPropagation?.();
            handleWhatsApp();
          }}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons name="whatsapp" size={20} color={Colors.textOnDark} />
          <Text style={styles.whatsappText}>WhatsApp ile İletişime Geç</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.disabledButton}>
          <Ionicons name="lock-closed" size={16} color={Colors.textSecondary} />
          <Text style={styles.disabledText}>İletişim için giriş yapın</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  cardBoosted: {
    borderColor: Colors.orange,
    borderWidth: 1.5,
  },
  boostBadge: {
    position: 'absolute',
    top: 0,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.orange,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 4,
    zIndex: 1,
  },
  boostBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textOnDark,
  },
  compareCheck: {
    position: 'absolute',
    top: 12,
    left: 12,
    zIndex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  avatarPlaceholder: {
    backgroundColor: Colors.navyLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitials: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.navy,
  },
  headerInfo: {
    flex: 1,
    marginLeft: 12,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  name: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.textPrimary,
    flexShrink: 1,
  },
  verifiedIcon: {
    marginLeft: 4,
  },
  major: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  university: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500',
    marginTop: 2,
  },
  rate: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.orange,
    marginTop: 2,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 3,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  bio: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: 10,
  },
  badgeWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 10,
  },
  videoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.navyLight,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 10,
    gap: 8,
  },
  videoButtonText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: Colors.navy,
  },
  modesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 16,
  },
  modeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  modeText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 4,
  },
  locationText: {
    fontSize: 13,
    color: Colors.textSecondary,
    flex: 1,
  },
  whatsappButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.whatsapp,
    borderRadius: 12,
    paddingVertical: 12,
    marginTop: 4,
    gap: 8,
  },
  whatsappText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textOnDark,
  },
  disabledButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.border,
    borderRadius: 12,
    paddingVertical: 12,
    marginTop: 4,
    gap: 8,
  },
  disabledText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
});
