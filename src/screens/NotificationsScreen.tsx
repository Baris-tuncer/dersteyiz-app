import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import {
  fetchNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from '../services/notificationService';

interface Notification {
  id: string;
  user_id: string;
  title: string;
  body: string;
  read: boolean;
  data: any;
  created_at: string;
}

const ICON_MAP: Record<string, { name: React.ComponentProps<typeof Ionicons>['name']; color: string }> = {
  diploma_status: { name: 'ribbon', color: Colors.success },
  daily_summary: { name: 'eye', color: Colors.navy },
  milestone: { name: 'trophy', color: Colors.orange },
  weekly_new_teachers: { name: 'school', color: Colors.navy },
  favorite_update: { name: 'heart', color: Colors.error },
  re_engagement: { name: 'sparkles', color: Colors.orange },
  profile_tip: { name: 'bulb', color: Colors.warning },
};

function getTimeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return 'Az önce';
  if (diffMin < 60) return `${diffMin} dk önce`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr} saat önce`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `${diffDay} gün önce`;
  return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
}

export default function NotificationsScreen() {
  const { state } = useAuth();
  const { refreshUnreadCount } = useNotifications();
  const userId = state.user?.id;

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!userId) return;
    try {
      const data = await fetchNotifications(userId);
      setNotifications(data as Notification[]);
    } catch {
      // Silently fail
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  const handlePress = useCallback(async (item: Notification) => {
    if (!item.read) {
      await markNotificationRead(item.id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === item.id ? { ...n, read: true } : n)),
      );
      refreshUnreadCount();
    }
  }, [refreshUnreadCount]);

  const handleMarkAllRead = useCallback(async () => {
    if (!userId) return;
    await markAllNotificationsRead(userId);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    refreshUnreadCount();
  }, [userId, refreshUnreadCount]);

  const hasUnread = notifications.some((n) => !n.read);

  const renderItem = useCallback(
    ({ item }: { item: Notification }) => {
      const type = item.data?.type ?? 'default';
      const iconInfo = ICON_MAP[type] ?? { name: 'notifications' as const, color: Colors.navy };

      return (
        <TouchableOpacity
          style={[styles.notifRow, !item.read && styles.notifRowUnread]}
          onPress={() => handlePress(item)}
          activeOpacity={0.7}
        >
          <View style={[styles.iconCircle, { backgroundColor: iconInfo.color + '18' }]}>
            <Ionicons name={iconInfo.name} size={20} color={iconInfo.color} />
          </View>
          <View style={styles.notifContent}>
            <Text style={[styles.notifTitle, !item.read && styles.notifTitleUnread]} numberOfLines={1}>
              {item.title}
            </Text>
            <Text style={styles.notifBody} numberOfLines={2}>
              {item.body}
            </Text>
            <Text style={styles.notifTime}>{getTimeAgo(item.created_at)}</Text>
          </View>
          {!item.read && <View style={styles.unreadDot} />}
        </TouchableOpacity>
      );
    },
    [handlePress],
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.navy} />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      {hasUnread && (
        <TouchableOpacity style={styles.markAllButton} onPress={handleMarkAllRead} activeOpacity={0.7}>
          <Ionicons name="checkmark-done" size={16} color={Colors.navy} />
          <Text style={styles.markAllText}>Tümünü okundu işaretle</Text>
        </TouchableOpacity>
      )}

      <FlatList
        data={notifications}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
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
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="notifications-off-outline" size={56} color={Colors.textTertiary} />
            <Text style={styles.emptyTitle}>Henüz bildiriminiz yok</Text>
            <Text style={styles.emptySubtitle}>
              Yeni bildirimler geldiğinde burada görünecektir.
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
  },
  markAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    gap: 6,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  markAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.navy,
  },
  listContent: {
    paddingBottom: 32,
    flexGrow: 1,
  },
  notifRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  notifRowUnread: {
    backgroundColor: Colors.navyLight,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  notifContent: {
    flex: 1,
  },
  notifTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  notifTitleUnread: {
    fontWeight: '700',
  },
  notifBody: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
    marginBottom: 4,
  },
  notifTime: {
    fontSize: 12,
    color: Colors.textTertiary,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.orange,
    marginLeft: 8,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
    paddingHorizontal: 40,
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
});
