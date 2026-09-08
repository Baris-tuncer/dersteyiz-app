import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../config/supabase';
import type { TeacherWithDetails } from '../types/teacher';
import type { RootStackParamList } from '../types/navigation';
import TeacherCard from '../components/TeacherCard';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function FavoritesScreen() {
  const navigation = useNavigation<Nav>();
  const { state: authState } = useAuth();
  const userId = authState.user?.id;
  const isLoggedIn = !!authState.session;

  const [favorites, setFavorites] = useState<TeacherWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(false);

  const loadFavorites = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      const { data, error: fetchError } = await supabase
        .from('favorites')
        .select(`
          teacher:teachers(
            *,
            profile:profiles!teachers_profile_id_fkey(*),
            modes:teacher_modes(mode),
            locations:teacher_locations(id, city, district),
            categories:teacher_categories(category:categories(*)),
            tags:teacher_tags(tag:tags(*))
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      const teachers = (data ?? [])
        .map((row: any) => row.teacher)
        .filter(Boolean) as TeacherWithDetails[];

      setFavorites(teachers);
      setError(false);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Reload when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadFavorites();
    }, [loadFavorites]),
  );

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadFavorites();
    setRefreshing(false);
  }, [loadFavorites]);

  const handleTeacherPress = useCallback(
    (teacher: TeacherWithDetails) => {
      navigation.navigate('TeacherDetail', { teacherId: teacher.profile_id });
    },
    [navigation],
  );

  const renderTeacher = useCallback(
    ({ item }: { item: TeacherWithDetails }) => (
      <TeacherCard
        teacher={item}
        onPress={() => handleTeacherPress(item)}
        isLoggedIn={isLoggedIn}
      />
    ),
    [isLoggedIn, handleTeacherPress],
  );

  const keyExtractor = useCallback(
    (item: TeacherWithDetails) => item.profile_id,
    [],
  );

  const renderEmpty = useCallback(() => {
    if (loading) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color={Colors.navy} />
        </View>
      );
    }

    if (!isLoggedIn) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="lock-closed-outline" size={56} color={Colors.textTertiary} />
          <Text style={styles.emptyTitle}>Giriş yapın</Text>
          <Text style={styles.emptySubtitle}>
            Favori öğretmenlerinizi görmek için giriş yapmanız gerekiyor.
          </Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="cloud-offline-outline" size={48} color={Colors.textTertiary} />
          <Text style={styles.emptyTitle}>Bağlantı hatası</Text>
          <Text style={styles.emptySubtitle}>
            Favoriler yüklenemedi. Lütfen tekrar deneyin.
          </Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={handleRefresh}
            activeOpacity={0.7}
          >
            <Text style={styles.retryText}>Tekrar Dene</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="heart-outline" size={56} color={Colors.textTertiary} />
        <Text style={styles.emptyTitle}>
          Henüz favori öğretmeniniz yok.
        </Text>
        <Text style={styles.emptySubtitle}>
          Öğretmen profillerinde kalp ikonuna basarak favorilere
          ekleyebilirsiniz.
        </Text>
      </View>
    );
  }, [loading, error, isLoggedIn, handleRefresh]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Favori Öğretmenlerim</Text>
        </View>

        <FlatList
          data={favorites}
          renderItem={renderTeacher}
          keyExtractor={keyExtractor}
          ListEmptyComponent={renderEmpty}
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
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.navy,
    letterSpacing: -0.5,
  },
  listContent: {
    paddingBottom: 32,
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
  retryButton: {
    marginTop: 20,
    backgroundColor: Colors.navy,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  retryText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textOnDark,
  },
});
