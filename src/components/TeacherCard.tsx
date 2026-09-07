import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  Linking,
  StyleSheet,
} from 'react-native';
import { Ionicons, MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import { formatPrice, getInitials, formatWhatsAppUrl } from '../utils/formatters';
import type { TeacherWithDetails } from '../types/teacher';
import Badge from './Badge';

interface TeacherCardProps {
  teacher: TeacherWithDetails;
  onPress: () => void;
  isLoggedIn: boolean;
}

export default function TeacherCard({ teacher, onPress, isLoggedIn }: TeacherCardProps) {
  const { profile, categories, tags, modes, locations } = teacher;

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
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.7}
    >
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
                color="#3897F0"
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
        </View>
      </View>

      {/* Bio */}
      <Text style={styles.bio} numberOfLines={2}>
        {teacher.bio}
      </Text>

      {/* Categories & Tags */}
      {(categories.length > 0 || tags.length > 0) && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.badgeScroll}
          contentContainerStyle={styles.badgeScrollContent}
        >
          {categories.map((c) => (
            <Badge key={`cat-${c.category.id}`} label={c.category.name} variant="navy" />
          ))}
          {tags.map((t) => (
            <Badge key={`tag-${t.tag.id}`} label={t.tag.name} variant="gray" />
          ))}
        </ScrollView>
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
  bio: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: 10,
  },
  badgeScroll: {
    marginBottom: 10,
  },
  badgeScrollContent: {
    flexDirection: 'row',
    alignItems: 'center',
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
