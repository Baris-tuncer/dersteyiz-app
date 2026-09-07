import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { decode } from 'base64-arraybuffer';
import { Colors } from '../../constants/colors';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../config/supabase';
import { getInitials } from '../../utils/formatters';
import { CATEGORIES, MAJORS, TEACHING_MODES, TAGS } from '../../constants/categories';
import { TURKEY_CITIES } from '../../constants/cities';

export default function EditProfileScreen() {
  const navigation = useNavigation();
  const { state } = useAuth();

  const userMeta = state.user?.user_metadata;
  const isTeacher = userMeta?.role === 'teacher';
  const userId = state.user?.id;

  // Form state
  const [fullName, setFullName] = useState(userMeta?.full_name ?? '');
  const [phone, setPhone] = useState(userMeta?.phone_number ?? '');
  const [email, setEmail] = useState(state.user?.email ?? '');
  const [bio, setBio] = useState('');
  const [major, setMajor] = useState('');
  const [hourlyRate, setHourlyRate] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [selectedModes, setSelectedModes] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<number[]>([]);
  const [city, setCity] = useState('');
  const [university, setUniversity] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Load existing teacher data
  useEffect(() => {
    let cancelled = false;

    async function loadProfile() {
      if (!userId || !isTeacher) {
        setLoading(false);
        return;
      }

      try {
        const { data: teacher } = await supabase
          .from('teachers')
          .select(`
            *,
            modes:teacher_modes(mode),
            locations:teacher_locations(city),
            categories:teacher_categories(category_id),
            tags:teacher_tags(tag_id)
          `)
          .eq('profile_id', userId)
          .single();

        if (!cancelled && teacher) {
          setBio(teacher.bio ?? '');
          setMajor(teacher.major ?? '');
          setUniversity(teacher.university ?? '');
          setHourlyRate(teacher.hourly_rate ? String(teacher.hourly_rate) : '');
          setSelectedModes(teacher.modes?.map((m: any) => m.mode) ?? []);
          setSelectedCategories(teacher.categories?.map((c: any) => c.category_id) ?? []);
          setSelectedTags(teacher.tags?.map((t: any) => t.tag_id) ?? []);
          const firstLoc = teacher.locations?.[0];
          if (firstLoc) setCity(firstLoc.city);
        }
      } catch {
        // Silently handle - fields will show empty defaults
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadProfile();
    return () => { cancelled = true; };
  }, [userId, isTeacher]);

  const toggleCategory = (id: number) => {
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id],
    );
  };

  const toggleMode = (mode: string) => {
    setSelectedModes((prev) =>
      prev.includes(mode) ? prev.filter((m) => m !== mode) : [...prev, mode],
    );
  };

  const toggleTag = (id: number) => {
    setSelectedTags((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id],
    );
  };

  const handlePhotoPicker = async () => {
    if (!userId) return;

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('İzin Gerekli', 'Fotoğraf seçmek için galeri erişim izni gereklidir.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (result.canceled || !result.assets[0]) return;

    try {
      const uri = result.assets[0].uri;
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      const ext = uri.split('.').pop()?.toLowerCase() || 'jpg';
      const contentType = ext === 'png' ? 'image/png' : 'image/jpeg';
      const filePath = `${userId}/avatar.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, decode(base64), { contentType, upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
      await supabase.from('profiles').update({ avatar_url: data.publicUrl }).eq('id', userId);
      Alert.alert('Başarılı', 'Fotoğrafınız güncellendi.');
    } catch (err: any) {
      Alert.alert('Hata', err?.message || 'Fotoğraf yüklenemedi.');
    }
  };

  const handleSave = async () => {
    if (!fullName.trim()) {
      Alert.alert('Hata', 'Ad Soyad alanı zorunludur.');
      return;
    }
    if (!userId) return;

    setSaving(true);
    try {
      // Update profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: fullName.trim(),
          phone_number: phone.trim(),
        })
        .eq('id', userId);

      if (profileError) throw profileError;

      // Update user metadata
      await supabase.auth.updateUser({
        data: { full_name: fullName.trim(), phone_number: phone.trim() },
      });

      // Update teacher-specific data
      if (isTeacher) {
        const { error: teacherError } = await supabase
          .from('teachers')
          .update({
            bio: bio.trim(),
            major,
            university: university.trim(),
            hourly_rate: parseInt(hourlyRate, 10) || 0,
            phone_number: phone.trim(),
          })
          .eq('profile_id', userId);

        if (teacherError) throw teacherError;

        // Replace modes
        await supabase.from('teacher_modes').delete().eq('teacher_id', userId);
        if (selectedModes.length > 0) {
          await supabase.from('teacher_modes').insert(
            selectedModes.map((mode) => ({ teacher_id: userId, mode })),
          );
        }

        // Replace categories
        await supabase.from('teacher_categories').delete().eq('teacher_id', userId);
        if (selectedCategories.length > 0) {
          await supabase.from('teacher_categories').insert(
            selectedCategories.map((catId) => ({ teacher_id: userId, category_id: catId })),
          );
        }

        // Replace tags
        await supabase.from('teacher_tags').delete().eq('teacher_id', userId);
        if (selectedTags.length > 0) {
          await supabase.from('teacher_tags').insert(
            selectedTags.map((tagId) => ({ teacher_id: userId, tag_id: tagId })),
          );
        }

        // Replace location
        await supabase.from('teacher_locations').delete().eq('teacher_id', userId);
        if (selectedModes.includes('face_to_face') && city) {
          await supabase.from('teacher_locations').insert({
            teacher_id: userId,
            city,
            district: '',
          });
        }
      }

      Alert.alert('Başarılı', 'Profiliniz güncellendi.', [
        { text: 'Tamam', onPress: () => navigation.goBack() },
      ]);
    } catch (error: any) {
      Alert.alert(
        'Hata',
        error?.message || 'Profil güncellenemedi. Lütfen tekrar deneyin.',
      );
    } finally {
      setSaving(false);
    }
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
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {/* Photo Picker */}
      <TouchableOpacity
        style={styles.photoContainer}
        onPress={handlePhotoPicker}
        activeOpacity={0.7}
      >
        <View style={styles.photoCircle}>
          <Text style={styles.photoInitials}>{getInitials(fullName || 'K')}</Text>
        </View>
        <View style={styles.cameraOverlay}>
          <Ionicons name="camera" size={16} color={Colors.textOnDark} />
        </View>
        <Text style={styles.photoHint}>Fotoğraf Değiştir</Text>
      </TouchableOpacity>

      {/* Basic Fields */}
      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>Ad Soyad</Text>
        <TextInput
          style={styles.input}
          value={fullName}
          onChangeText={setFullName}
          placeholder="Adınız ve soyadınız"
          placeholderTextColor={Colors.textTertiary}
          autoCapitalize="words"
        />
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>Telefon</Text>
        <TextInput
          style={styles.input}
          value={phone}
          onChangeText={setPhone}
          placeholder="05XX XXX XX XX"
          placeholderTextColor={Colors.textTertiary}
          keyboardType="phone-pad"
        />
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>E-posta</Text>
        <TextInput
          style={[styles.input, styles.inputDisabled]}
          value={email}
          editable={false}
          placeholder="E-posta adresiniz"
          placeholderTextColor={Colors.textTertiary}
          keyboardType="email-address"
        />
        <Text style={styles.fieldHint}>E-posta adresi değiştirilemez.</Text>
      </View>

      {/* Teacher-specific Fields */}
      {isTeacher && (
        <>
          <View style={styles.divider} />
          <Text style={styles.sectionTitle}>Öğretmen Bilgileri</Text>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Üniversite</Text>
            <TextInput
              style={styles.input}
              value={university}
              onChangeText={setUniversity}
              placeholder="Örn: İstanbul Üniversitesi"
              placeholderTextColor={Colors.textTertiary}
              autoCapitalize="words"
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Hakkında</Text>
            <TextInput
              style={[styles.input, styles.inputMultiline]}
              value={bio}
              onChangeText={setBio}
              placeholder="Kendinizi tanıtın, deneyimlerinizi paylaşın..."
              placeholderTextColor={Colors.textTertiary}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              maxLength={500}
            />
            <Text style={styles.charCount}>{bio.length}/500</Text>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Branş</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipScrollContent}
            >
              {MAJORS.map((m) => (
                <TouchableOpacity
                  key={m}
                  style={[
                    styles.chip,
                    major === m && styles.chipSelected,
                  ]}
                  onPress={() => setMajor(major === m ? '' : m)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.chipText,
                      major === m && styles.chipTextSelected,
                    ]}
                  >
                    {m}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Saatlik Ücret (₺)</Text>
            <TextInput
              style={styles.input}
              value={hourlyRate}
              onChangeText={setHourlyRate}
              placeholder="Örn: 1500"
              placeholderTextColor={Colors.textTertiary}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Kategoriler</Text>
            <View style={styles.chipsWrap}>
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.chip,
                    selectedCategories.includes(cat.id) && styles.chipSelected,
                  ]}
                  onPress={() => toggleCategory(cat.id)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.chipText,
                      selectedCategories.includes(cat.id) && styles.chipTextSelected,
                    ]}
                  >
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Ders Verme Şekli</Text>
            <View style={styles.chipsRow}>
              {TEACHING_MODES.map((mode) => (
                <TouchableOpacity
                  key={mode.value}
                  style={[
                    styles.chip,
                    selectedModes.includes(mode.value) && styles.chipSelected,
                  ]}
                  onPress={() => toggleMode(mode.value)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.chipText,
                      selectedModes.includes(mode.value) && styles.chipTextSelected,
                    ]}
                  >
                    {mode.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Etiketler</Text>
            <View style={styles.chipsWrap}>
              {TAGS.map((tag) => (
                <TouchableOpacity
                  key={tag.id}
                  style={[
                    styles.chip,
                    selectedTags.includes(tag.id) && styles.chipSelected,
                  ]}
                  onPress={() => toggleTag(tag.id)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.chipText,
                      selectedTags.includes(tag.id) && styles.chipTextSelected,
                    ]}
                  >
                    {tag.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Şehir</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipScrollContent}
            >
              {TURKEY_CITIES.map((c) => (
                <TouchableOpacity
                  key={c}
                  style={[
                    styles.chip,
                    city === c && styles.chipSelected,
                  ]}
                  onPress={() => setCity(city === c ? '' : c)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.chipText,
                      city === c && styles.chipTextSelected,
                    ]}
                  >
                    {c}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Diploma</Text>
            <TouchableOpacity
              style={styles.uploadButton}
              onPress={async () => {
                if (!userId) return;
                const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
                if (status !== 'granted') {
                  Alert.alert('İzin Gerekli', 'Galeri erişim izni gereklidir.');
                  return;
                }
                const result = await ImagePicker.launchImageLibraryAsync({
                  mediaTypes: ['images'],
                  quality: 0.8,
                });
                if (result.canceled || !result.assets[0]) return;
                try {
                  const uri = result.assets[0].uri;
                  const base64 = await FileSystem.readAsStringAsync(uri, {
                    encoding: FileSystem.EncodingType.Base64,
                  });
                  const ext = uri.split('.').pop()?.toLowerCase() || 'jpg';
                  const contentType = ext === 'png' ? 'image/png' : 'image/jpeg';
                  const filePath = `${userId}/diploma.${ext}`;

                  const { error: uploadError } = await supabase.storage
                    .from('diplomas')
                    .upload(filePath, decode(base64), { contentType, upsert: true });
                  if (uploadError) throw uploadError;

                  const { data } = supabase.storage.from('diplomas').getPublicUrl(filePath);
                  await supabase.from('teachers').update({
                    diploma_url: data.publicUrl,
                    diploma_status: 'pending',
                  }).eq('profile_id', userId);

                  Alert.alert('Başarılı', 'Diplomanız yüklendi ve incelemeye gönderildi.');
                } catch (err: any) {
                  Alert.alert('Hata', err?.message || 'Diploma yüklenemedi.');
                }
              }}
              activeOpacity={0.7}
            >
              <Ionicons name="attach" size={18} color={Colors.textSecondary} />
              <Text style={styles.uploadText}>Diploma Yükle</Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      {/* Save Button */}
      <TouchableOpacity
        style={[styles.saveButton, saving && styles.saveButtonDisabled]}
        onPress={handleSave}
        activeOpacity={0.8}
        disabled={saving}
      >
        {saving ? (
          <ActivityIndicator color={Colors.textOnDark} />
        ) : (
          <Text style={styles.saveButtonText}>Kaydet</Text>
        )}
      </TouchableOpacity>

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
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
  },

  // Photo
  photoContainer: {
    alignItems: 'center',
    marginBottom: 28,
  },
  photoCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: Colors.navyLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoInitials: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.navy,
  },
  cameraOverlay: {
    position: 'absolute',
    bottom: 24,
    right: '50%',
    marginRight: -44,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.orange,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: Colors.background,
  },
  photoHint: {
    fontSize: 14,
    color: Colors.orange,
    fontWeight: '600',
    marginTop: 8,
  },

  // Fields
  fieldGroup: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: Colors.textPrimary,
  },
  inputDisabled: {
    backgroundColor: Colors.border,
    color: Colors.textTertiary,
  },
  inputMultiline: {
    minHeight: 100,
    paddingTop: 14,
    lineHeight: 22,
  },
  fieldHint: {
    fontSize: 12,
    color: Colors.textTertiary,
    marginTop: 6,
  },
  charCount: {
    fontSize: 12,
    color: Colors.textTertiary,
    textAlign: 'right',
    marginTop: 6,
  },

  // Section
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.navy,
    marginBottom: 16,
  },

  // Chips
  chipsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chipScrollContent: {
    gap: 8,
    paddingRight: 16,
  },
  chip: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.borderDark,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  chipSelected: {
    backgroundColor: Colors.navyLight,
    borderColor: Colors.navy,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  chipTextSelected: {
    color: Colors.navy,
    fontWeight: '600',
  },

  // Upload
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.borderDark,
    borderRadius: 12,
    paddingVertical: 14,
    borderStyle: 'dashed',
    gap: 8,
  },
  uploadText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textSecondary,
  },

  // Save
  saveButton: {
    backgroundColor: Colors.orange,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 12,
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.textOnDark,
  },
  bottomSpacer: {
    height: 20,
  },
});
