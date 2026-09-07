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

export default function AdminPanelScreen() {
  const [pendingDiplomas, setPendingDiplomas] = useState<PendingDiploma[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const loadPending = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('teachers')
        .select(`
          profile_id,
          diploma_url,
          major,
          created_at,
          profile:profiles(full_name, avatar_url)
        `)
        .eq('diploma_status', 'pending')
        .not('diploma_url', 'is', null)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setPendingDiplomas((data ?? []) as unknown as PendingDiploma[]);
    } catch {
      Alert.alert('Hata', 'Diplomalar yüklenemedi.');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadPending();
    }, [loadPending]),
  );

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadPending();
    setRefreshing(false);
  }, [loadPending]);

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
  bottomSpacer: {
    height: 20,
  },
});
