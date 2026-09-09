import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  Alert,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import { useAuth } from '../contexts/AuthContext';
import {
  fetchTrialRequestsForTeacher,
  fetchTrialRequestsForParent,
  updateTrialRequestStatus,
} from '../services/trialService';
import { getInitials, formatWhatsAppUrl } from '../utils/formatters';
import type { TrialRequest } from '../types/super';

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending: { label: 'Bekliyor', color: Colors.warning },
  accepted: { label: 'Kabul Edildi', color: Colors.success },
  rejected: { label: 'Reddedildi', color: Colors.error },
  cancelled: { label: 'İptal Edildi', color: Colors.textTertiary },
};

export default function TrialRequestsScreen() {
  const { state } = useAuth();
  const userId = state.user?.id;
  const isTeacher = state.user?.user_metadata?.role === 'teacher';

  const [requests, setRequests] = useState<TrialRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const loadRequests = useCallback(async () => {
    if (!userId) return;
    try {
      const data = isTeacher
        ? await fetchTrialRequestsForTeacher(userId)
        : await fetchTrialRequestsForParent(userId);
      setRequests(data);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [userId, isTeacher]);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  const handleAccept = (id: string) => {
    Alert.alert('Onayla', 'Bu tanışma talebini kabul etmek istiyor musunuz?', [
      { text: 'İptal', style: 'cancel' },
      {
        text: 'Kabul Et',
        onPress: async () => {
          try {
            await updateTrialRequestStatus(id, 'accepted');
            loadRequests();
          } catch {
            Alert.alert('Hata', 'İşlem gerçekleştirilemedi.');
          }
        },
      },
    ]);
  };

  const handleReject = (id: string) => {
    Alert.alert('Reddet', 'Bu tanışma talebini reddetmek istiyor musunuz?', [
      { text: 'İptal', style: 'cancel' },
      {
        text: 'Reddet',
        style: 'destructive',
        onPress: async () => {
          try {
            await updateTrialRequestStatus(id, 'rejected');
            loadRequests();
          } catch {
            Alert.alert('Hata', 'İşlem gerçekleştirilemedi.');
          }
        },
      },
    ]);
  };

  const renderItem = ({ item }: { item: TrialRequest }) => {
    const person = isTeacher ? item.parent : item.teacher;
    const status = STATUS_LABELS[item.status] ?? STATUS_LABELS.pending;

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          {person?.avatar_url ? (
            <Image source={{ uri: person.avatar_url }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Text style={styles.avatarInitials}>
                {getInitials(person?.full_name ?? '')}
              </Text>
            </View>
          )}
          <View style={styles.headerInfo}>
            <Text style={styles.personName}>{person?.full_name ?? 'Kullanıcı'}</Text>
            <Text style={styles.date}>
              {new Date(item.created_at).toLocaleDateString('tr-TR')}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: status.color + '20' }]}>
            <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
          </View>
        </View>

        {item.message ? (
          <Text style={styles.message}>{item.message}</Text>
        ) : null}

        {isTeacher && item.status === 'pending' && (
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.acceptButton}
              onPress={() => handleAccept(item.id)}
              activeOpacity={0.7}
            >
              <Ionicons name="checkmark" size={16} color={Colors.textOnDark} />
              <Text style={styles.acceptText}>Kabul Et</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.rejectButton}
              onPress={() => handleReject(item.id)}
              activeOpacity={0.7}
            >
              <Ionicons name="close" size={16} color={Colors.error} />
              <Text style={styles.rejectText}>Reddet</Text>
            </TouchableOpacity>
          </View>
        )}

        {!isTeacher && item.status === 'accepted' && item.teacher?.phone_number && (
          <TouchableOpacity
            style={styles.whatsappButton}
            onPress={() => {
              const url = formatWhatsAppUrl(
                item.teacher!.phone_number!,
                `Merhaba, Dersteyiz üzerinden tanışma talebim kabul edildi. Uygun olduğunuz bir zamanda görüşebilir miyiz?`,
              );
              Linking.openURL(url);
            }}
            activeOpacity={0.7}
          >
            <Ionicons name="logo-whatsapp" size={18} color={Colors.textOnDark} />
            <Text style={styles.whatsappText}>WhatsApp ile İletişime Geç</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.navy} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        data={requests}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-outline" size={48} color={Colors.textTertiary} />
            <Text style={styles.emptyTitle}>Henüz talep yok</Text>
            <Text style={styles.emptySubtitle}>
              {isTeacher
                ? 'Veliler size tanışma talebi gönderdiğinde burada görünecek.'
                : 'Öğretmenlere tanışma talebi gönderdiğinizde burada görünecek.'}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    padding: 16,
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    marginBottom: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
  },
  avatarPlaceholder: {
    backgroundColor: Colors.navyLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.navy,
  },
  headerInfo: {
    flex: 1,
    marginLeft: 10,
  },
  personName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  date: {
    fontSize: 12,
    color: Colors.textTertiary,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 100,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  message: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  acceptButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.navy,
    borderRadius: 10,
    paddingVertical: 10,
    gap: 6,
  },
  acceptText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textOnDark,
  },
  rejectButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.errorLight,
    borderRadius: 10,
    paddingVertical: 10,
    gap: 6,
  },
  rejectText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.error,
  },
  whatsappButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#25D366',
    borderRadius: 10,
    paddingVertical: 12,
    gap: 8,
    marginTop: 14,
  },
  whatsappText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textOnDark,
  },
});
