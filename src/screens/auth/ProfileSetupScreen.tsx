import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Modal,
  FlatList,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../config/supabase';
import { CATEGORIES, MAJORS, TAGS, TEACHING_MODES } from '../../constants/categories';
import { TURKEY_CITIES } from '../../constants/cities';
import { decode } from 'base64-arraybuffer';
import * as FileSystem from 'expo-file-system';

export default function ProfileSetupScreen() {
  const { signOut, completeProfile, state } = useAuth();
  const [bio, setBio] = useState('');
  const [selectedMajors, setSelectedMajors] = useState<string[]>([]);
  const [hourlyRate, setHourlyRate] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [selectedModes, setSelectedModes] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<number[]>([]);
  const [university, setUniversity] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [diplomaUri, setDiplomaUri] = useState<string | null>(null);
  const [customTags, setCustomTags] = useState<string[]>([]);
  const [customTagInput, setCustomTagInput] = useState('');
  const [loading, setLoading] = useState(false);

  // Picker modals
  const [showCityPicker, setShowCityPicker] = useState(false);

  const showsFaceToFace = selectedModes.includes('face_to_face');

  const toggleCategory = (id: number) => {
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id],
    );
  };

  const toggleMajor = (major: string) => {
    setSelectedMajors((prev) =>
      prev.includes(major) ? prev.filter((m) => m !== major) : [...prev, major],
    );
  };

  const toggleMode = (value: string) => {
    setSelectedModes((prev) =>
      prev.includes(value) ? prev.filter((m) => m !== value) : [...prev, value],
    );
  };

  const toggleTag = (id: number) => {
    setSelectedTags((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id],
    );
  };

  const addCustomTag = () => {
    const tag = customTagInput.trim();
    if (!tag) return;
    if (customTags.includes(tag)) {
      setCustomTagInput('');
      return;
    }
    setCustomTags((prev) => [...prev, tag]);
    setCustomTagInput('');
  };

  const removeCustomTag = (tag: string) => {
    setCustomTags((prev) => prev.filter((t) => t !== tag));
  };

  const pickImage = async (type: 'photo' | 'diploma') => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('İzin Gerekli', 'Fotoğraf seçmek için galeri erişim izni gereklidir.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: type === 'photo',
      aspect: type === 'photo' ? [1, 1] : undefined,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      if (type === 'photo') {
        setPhotoUri(result.assets[0].uri);
      } else {
        setDiplomaUri(result.assets[0].uri);
      }
    }
  };

  const uploadFile = async (uri: string, bucket: string, path: string): Promise<string | null> => {
    try {
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      const ext = uri.split('.').pop()?.toLowerCase() || 'jpg';
      const contentType = ext === 'png' ? 'image/png' : 'image/jpeg';
      const filePath = `${path}.${ext}`;

      const { error } = await supabase.storage
        .from(bucket)
        .upload(filePath, decode(base64), { contentType, upsert: true });

      if (error) return null;

      const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
      return data.publicUrl;
    } catch {
      return null;
    }
  };

  const handleSave = async () => {
    if (!bio.trim()) {
      Alert.alert('Hata', 'Lütfen kendinizi tanıtan bir biyografi yazın.');
      return;
    }
    if (selectedMajors.length === 0) {
      Alert.alert('Hata', 'En az bir branş seçin.');
      return;
    }
    if (!hourlyRate.trim()) {
      Alert.alert('Hata', 'Lütfen saatlik ücretinizi girin.');
      return;
    }
    if (selectedCategories.length === 0) {
      Alert.alert('Hata', 'Lütfen en az bir kategori seçin.');
      return;
    }
    if (selectedModes.length === 0) {
      Alert.alert('Hata', 'Lütfen en az bir ders verme şekli seçin.');
      return;
    }
    if (showsFaceToFace && !selectedCity) {
      Alert.alert('Hata', 'Yüz yüze ders için lütfen şehir seçin.');
      return;
    }

    const user = state.user;
    if (!user) {
      Alert.alert('Hata', 'Oturum bulunamadı. Lütfen tekrar giriş yapın.');
      return;
    }

    setLoading(true);
    try {
      // Upload avatar
      let avatarUrl: string | null = null;
      if (photoUri) {
        avatarUrl = await uploadFile(photoUri, 'avatars', `${user.id}/avatar`);
      }

      // Upload diploma
      let diplomaUrl: string | null = null;
      if (diplomaUri) {
        diplomaUrl = await uploadFile(diplomaUri, 'diplomas', `${user.id}/diploma`);
      }

      // Update profile avatar
      if (avatarUrl) {
        await supabase.from('profiles').update({ avatar_url: avatarUrl }).eq('id', user.id);
      }

      // Insert teacher record
      const { error: teacherError } = await supabase.from('teachers').insert({
        profile_id: user.id,
        bio: bio.trim(),
        major: selectedMajors.join(', '),
        university: university.trim(),
        phone_number: user.user_metadata?.phone_number ?? '',
        email: user.email ?? '',
        hourly_rate: parseInt(hourlyRate, 10),
        diploma_url: diplomaUrl,
        diploma_status: diplomaUrl ? 'pending' : 'pending',
      });

      if (teacherError) throw teacherError;

      // Insert teaching modes
      if (selectedModes.length > 0) {
        const modeRows = selectedModes.map((mode) => ({
          teacher_id: user.id,
          mode,
        }));
        const { error: modesError } = await supabase.from('teacher_modes').insert(modeRows);
        if (modesError) throw modesError;
      }

      // Insert location (if face_to_face)
      if (showsFaceToFace && selectedCity) {
        const { error: locError } = await supabase.from('teacher_locations').insert({
          teacher_id: user.id,
          city: selectedCity,
          district: '',
        });
        if (locError) throw locError;
      }

      // Insert categories
      if (selectedCategories.length > 0) {
        const catRows = selectedCategories.map((catId) => ({
          teacher_id: user.id,
          category_id: catId,
        }));
        const { error: catError } = await supabase.from('teacher_categories').insert(catRows);
        if (catError) throw catError;
      }

      // Insert tags (predefined)
      if (selectedTags.length > 0) {
        const tagRows = selectedTags.map((tagId) => ({
          teacher_id: user.id,
          tag_id: tagId,
        }));
        const { error: tagError } = await supabase.from('teacher_tags').insert(tagRows);
        if (tagError) throw tagError;
      }

      // Insert custom tags - first create the tag, then link
      for (const tagName of customTags) {
        const { data: newTag, error: newTagError } = await supabase
          .from('tags')
          .upsert({ name: tagName, display_order: 99 }, { onConflict: 'name' })
          .select('id')
          .single();

        if (!newTagError && newTag) {
          await supabase.from('teacher_tags').insert({
            teacher_id: user.id,
            tag_id: newTag.id,
          });
        }
      }

      completeProfile();
      Alert.alert('Başarılı', 'Profiliniz kaydedildi.');
    } catch (error: any) {
      Alert.alert(
        'Hata',
        error?.message || 'Profil kaydedilemedi. Lütfen tekrar deneyin.',
      );
    } finally {
      setLoading(false);
    }
  };

  const renderPickerModal = (
    visible: boolean,
    onClose: () => void,
    title: string,
    data: readonly string[],
    onSelect: (item: string) => void,
  ) => (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{title}</Text>
            <TouchableOpacity onPress={onClose} activeOpacity={0.7}>
              <Ionicons name="close" size={22} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>
          <FlatList
            data={data as unknown as string[]}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.modalItem}
                onPress={() => {
                  onSelect(item);
                  onClose();
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.modalItemText}>{item}</Text>
              </TouchableOpacity>
            )}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={styles.title}>Profilinizi Tamamlayın</Text>
            <TouchableOpacity onPress={() => signOut()} activeOpacity={0.7}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: Colors.error }}>Çıkış Yap</Text>
            </TouchableOpacity>
          </View>

          {/* Photo Upload */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Profil Fotoğrafı</Text>
            <TouchableOpacity
              style={styles.uploadButton}
              onPress={() => pickImage('photo')}
              activeOpacity={0.7}
            >
              {photoUri ? (
                <View style={styles.uploadedRow}>
                  <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
                  <Text style={styles.uploadedText}>Fotoğraf seçildi</Text>
                </View>
              ) : (
                <View style={styles.uploadRow}>
                  <Ionicons name="cloud-upload-outline" size={20} color={Colors.textSecondary} />
                  <Text style={styles.uploadText}>Fotoğraf Yükle</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Bio */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Hakkınızda</Text>
            <TextInput
              style={[styles.input, styles.multilineInput]}
              placeholder="Kendinizi tanıtın, deneyimlerinizden bahsedin..."
              placeholderTextColor={Colors.textTertiary}
              value={bio}
              onChangeText={setBio}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          {/* University */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Mezun Olduğunuz Okul</Text>
            <TextInput
              style={styles.input}
              placeholder="Örn: İstanbul Üniversitesi"
              placeholderTextColor={Colors.textTertiary}
              value={university}
              onChangeText={setUniversity}
              autoCapitalize="words"
              returnKeyType="next"
            />
          </View>

          {/* Major Selection */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Branş (birden fazla seçebilirsiniz)</Text>
            <View style={styles.checkboxGrid}>
              {MAJORS.map((major) => (
                <TouchableOpacity
                  key={major}
                  style={styles.checkboxRow}
                  onPress={() => toggleMajor(major)}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.checkbox,
                      selectedMajors.includes(major) && styles.checkboxActive,
                    ]}
                  >
                    {selectedMajors.includes(major) && (
                      <Ionicons name="checkmark" size={16} color={Colors.textOnDark} />
                    )}
                  </View>
                  <Text style={styles.checkboxLabel}>{major}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Hourly Rate */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Saatlik Ücret (TL)</Text>
            <TextInput
              style={styles.input}
              placeholder="Örn: 1500"
              placeholderTextColor={Colors.textTertiary}
              value={hourlyRate}
              onChangeText={setHourlyRate}
              keyboardType="numeric"
              returnKeyType="done"
            />
          </View>

          {/* Categories */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Kategoriler (birden fazla seçebilirsiniz)</Text>
            <View style={styles.checkboxGrid}>
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={styles.checkboxRow}
                  onPress={() => toggleCategory(cat.id)}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.checkbox,
                      selectedCategories.includes(cat.id) && styles.checkboxActive,
                    ]}
                  >
                    {selectedCategories.includes(cat.id) && (
                      <Ionicons name="checkmark" size={16} color={Colors.textOnDark} />
                    )}
                  </View>
                  <Text style={styles.checkboxLabel}>{cat.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Teaching Modes */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Ders Verme Şekli (birden fazla seçebilirsiniz)</Text>
            <View style={styles.checkboxGrid}>
              {TEACHING_MODES.map((mode) => (
                <TouchableOpacity
                  key={mode.value}
                  style={styles.checkboxRow}
                  onPress={() => toggleMode(mode.value)}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.checkbox,
                      selectedModes.includes(mode.value) && styles.checkboxActive,
                    ]}
                  >
                    {selectedModes.includes(mode.value) && (
                      <Ionicons name="checkmark" size={16} color={Colors.textOnDark} />
                    )}
                  </View>
                  <Text style={styles.checkboxLabel}>{mode.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* City Picker (shown if face_to_face selected) */}
          {showsFaceToFace && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Şehir</Text>
              <TouchableOpacity
                style={styles.pickerButton}
                onPress={() => setShowCityPicker(true)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.pickerText,
                    !selectedCity && styles.pickerPlaceholder,
                  ]}
                >
                  {selectedCity || 'Şehir seçin'}
                </Text>
                <Ionicons name="chevron-down" size={18} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>
          )}

          {/* Tags */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Etiketler (birden fazla seçebilirsiniz)</Text>
            <View style={styles.checkboxGrid}>
              {TAGS.map((tag) => (
                <TouchableOpacity
                  key={tag.id}
                  style={styles.checkboxRow}
                  onPress={() => toggleTag(tag.id)}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.checkbox,
                      selectedTags.includes(tag.id) && styles.checkboxActive,
                    ]}
                  >
                    {selectedTags.includes(tag.id) && (
                      <Ionicons name="checkmark" size={16} color={Colors.textOnDark} />
                    )}
                  </View>
                  <Text style={styles.checkboxLabel}>{tag.name}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Custom tags */}
            {customTags.length > 0 && (
              <View style={styles.customTagsContainer}>
                {customTags.map((tag) => (
                  <View key={tag} style={styles.customTagChip}>
                    <Text style={styles.customTagText}>{tag}</Text>
                    <TouchableOpacity onPress={() => removeCustomTag(tag)} hitSlop={8}>
                      <Ionicons name="close-circle" size={18} color={Colors.textSecondary} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

            <View style={styles.customTagInputRow}>
              <TextInput
                style={styles.customTagInput}
                placeholder="Kendiniz ekleyin..."
                placeholderTextColor={Colors.textTertiary}
                value={customTagInput}
                onChangeText={setCustomTagInput}
                onSubmitEditing={addCustomTag}
                returnKeyType="done"
              />
              <TouchableOpacity
                style={[styles.customTagAddButton, !customTagInput.trim() && styles.customTagAddButtonDisabled]}
                onPress={addCustomTag}
                activeOpacity={0.7}
                disabled={!customTagInput.trim()}
              >
                <Ionicons name="add" size={20} color={customTagInput.trim() ? Colors.textOnDark : Colors.textTertiary} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Diploma Upload */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Diploma / Sertifika</Text>
            <TouchableOpacity
              style={styles.uploadButton}
              onPress={() => pickImage('diploma')}
              activeOpacity={0.7}
            >
              {diplomaUri ? (
                <View style={styles.uploadedRow}>
                  <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
                  <Text style={styles.uploadedText}>Belge seçildi</Text>
                </View>
              ) : (
                <View style={styles.uploadRow}>
                  <Ionicons name="cloud-upload-outline" size={20} color={Colors.textSecondary} />
                  <Text style={styles.uploadText}>Belge Yükle</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Save Button */}
          <TouchableOpacity
            style={[styles.ctaButton, loading && styles.ctaButtonDisabled]}
            activeOpacity={0.8}
            onPress={handleSave}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={Colors.textOnDark} />
            ) : (
              <Text style={styles.ctaButtonText}>Profili Kaydet</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* City Picker Modal */}
      {renderPickerModal(
        showCityPicker,
        () => setShowCityPicker(false),
        'Şehir Seçin',
        TURKEY_CITIES,
        setSelectedCity,
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 48,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.navy,
    marginBottom: 28,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.borderDark,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: Colors.textPrimary,
  },
  multilineInput: {
    minHeight: 100,
    paddingTop: 14,
  },
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.borderDark,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  pickerText: {
    fontSize: 16,
    color: Colors.textPrimary,
  },
  pickerPlaceholder: {
    color: Colors.textTertiary,
  },
  pickerArrow: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  checkboxGrid: {
    gap: 10,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: Colors.borderDark,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
  },
  checkboxActive: {
    backgroundColor: Colors.navy,
    borderColor: Colors.navy,
  },
  checkmark: {
    color: Colors.textOnDark,
    fontSize: 14,
    fontWeight: '700',
  },
  checkboxLabel: {
    fontSize: 15,
    color: Colors.textPrimary,
  },
  customTagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  customTagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.orangeLight,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 6,
  },
  customTagText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.orange,
  },
  customTagInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
  },
  customTagInput: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.borderDark,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: Colors.textPrimary,
  },
  customTagAddButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.navy,
    alignItems: 'center',
    justifyContent: 'center',
  },
  customTagAddButtonDisabled: {
    backgroundColor: Colors.border,
  },
  uploadButton: {
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.borderDark,
    borderRadius: 12,
    borderStyle: 'dashed',
    paddingVertical: 20,
    alignItems: 'center',
  },
  uploadRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  uploadIcon: {
    fontSize: 18,
    color: Colors.textSecondary,
  },
  uploadText: {
    fontSize: 15,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  uploadedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  uploadedIcon: {
    fontSize: 18,
    color: Colors.success,
    fontWeight: '700',
  },
  uploadedText: {
    fontSize: 15,
    color: Colors.success,
    fontWeight: '600',
  },
  ctaButton: {
    backgroundColor: Colors.orange,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  ctaButtonDisabled: {
    opacity: 0.7,
  },
  ctaButtonText: {
    color: Colors.textOnDark,
    fontSize: 16,
    fontWeight: '700',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
    paddingBottom: 32,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  modalClose: {
    fontSize: 18,
    color: Colors.textSecondary,
    padding: 4,
  },
  modalItem: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalItemText: {
    fontSize: 16,
    color: Colors.textPrimary,
  },
});
