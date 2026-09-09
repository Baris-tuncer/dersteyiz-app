import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import { useAuth } from '../contexts/AuthContext';
import { fetchReminders, deleteReminder } from '../services/reminderService';
import type { Reminder } from '../types/super';
import ReminderForm from '../components/ReminderForm';

export default function RemindersScreen() {
  const { state } = useAuth();
  const userId = state.user?.id;

  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const loadReminders = useCallback(async () => {
    if (!userId) return;
    try {
      const data = await fetchReminders(userId);
      setReminders(data);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useFocusEffect(
    useCallback(() => {
      loadReminders();
    }, [loadReminders]),
  );

  const handleDelete = (id: string) => {
    Alert.alert('Sil', 'Bu hatırlatıcıyı silmek istiyor musunuz?', [
      { text: 'İptal', style: 'cancel' },
      {
        text: 'Sil',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteReminder(id);
            setReminders((prev) => prev.filter((r) => r.id !== id));
          } catch {
            Alert.alert('Hata', 'Silinemedi.');
          }
        },
      },
    ]);
  };

  const isPast = (dateStr: string) => new Date(dateStr) < new Date();

  const renderItem = ({ item }: { item: Reminder }) => {
    const past = isPast(item.remind_at);
    const d = new Date(item.remind_at);
    const dateStr = d.toLocaleDateString('tr-TR');
    const timeStr = d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });

    return (
      <View style={[styles.card, past && styles.cardPast]}>
        <View style={styles.cardHeader}>
          <Ionicons
            name={past ? 'checkmark-circle' : 'alarm-outline'}
            size={20}
            color={past ? Colors.textTertiary : Colors.orange}
          />
          <View style={styles.cardInfo}>
            <Text style={[styles.cardTitle, past && styles.cardTitlePast]}>
              {item.title}
            </Text>
            <Text style={styles.cardDate}>
              {dateStr} {timeStr}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => handleDelete(item.id)}
            hitSlop={8}
            activeOpacity={0.6}
          >
            <Ionicons name="trash-outline" size={18} color={Colors.textTertiary} />
          </TouchableOpacity>
        </View>
        {item.note ? (
          <Text style={styles.cardNote}>{item.note}</Text>
        ) : null}
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
        data={reminders}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="alarm-outline" size={48} color={Colors.textTertiary} />
            <Text style={styles.emptyTitle}>Hatırlatıcı yok</Text>
            <Text style={styles.emptySubtitle}>
              Sağ alttaki + butonuna tıklayarak yeni hatırlatıcı ekleyin.
            </Text>
          </View>
        }
      />

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setShowForm(true)}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={28} color={Colors.textOnDark} />
      </TouchableOpacity>

      {/* Form Modal */}
      {showForm && userId && (
        <ReminderForm
          visible={showForm}
          userId={userId}
          onClose={() => setShowForm(false)}
          onCreated={() => {
            setShowForm(false);
            loadReminders();
          }}
        />
      )}
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
    paddingBottom: 100,
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
    padding: 14,
    marginBottom: 10,
  },
  cardPast: {
    opacity: 0.6,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  cardInfo: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  cardTitlePast: {
    textDecorationLine: 'line-through',
    color: Colors.textTertiary,
  },
  cardDate: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  cardNote: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.orange,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
});
