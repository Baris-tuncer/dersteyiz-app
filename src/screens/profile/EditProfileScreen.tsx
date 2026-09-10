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
  Modal,
  FlatList,
  Image,
  Switch,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { decode } from 'base64-arraybuffer';
import { Colors } from '../../constants/colors';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../config/supabase';
import { getInitials } from '../../utils/formatters';
import { CATEGORIES, MAJORS, MAJOR_GROUPS, TEACHING_MODES, getTagsForCategories } from '../../constants/categories';
import FilterModal from '../../components/FilterModal';
import { TURKEY_CITIES } from '../../constants/cities';
import AvailabilityEditor from '../../components/AvailabilityEditor';

interface PickerModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  data: { id: string | number; label: string }[];
  selected: (string | number)[];
  onToggle: (id: string | number) => void;
  multi?: boolean;
}

function PickerModal({ visible, onClose, title, data, selected, onToggle, multi = true }: PickerModalProps) {
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={modalStyles.overlay}>
        <View style={modalStyles.content}>
          <View style={modalStyles.header}>
            <Text style={modalStyles.title}>{title}</Text>
            <TouchableOpacity onPress={onClose} activeOpacity={0.7}>
              <Ionicons name="close" size={22} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>
          <FlatList
            data={data}
            keyExtractor={(item) => String(item.id)}
            renderItem={({ item }) => {
              const isSelected = selected.includes(item.id);
              return (
                <TouchableOpacity
                  style={modalStyles.item}
                  onPress={() => {
                    onToggle(item.id);
                    if (!multi) onClose();
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={[modalStyles.itemText, isSelected && modalStyles.itemTextSelected]}>
                    {item.label}
                  </Text>
                  {isSelected && (
                    <Ionicons name="checkmark-circle" size={22} color={Colors.navy} />
                  )}
                </TouchableOpacity>
              );
            }}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </View>
    </Modal>
  );
}

export default function EditProfileScreen() {
  const navigation = useNavigation();
  const { state } = useAuth();

  const userMeta = state.user?.user_metadata;
  const isTeacher = userMeta?.role === 'teacher';
  const userId = state.user?.id;

  const formatPhone = (text: string) => {
    const digits = text.replace(/[^0-9]/g, '').slice(0, 11);
    if (digits.length <= 4) return `(${digits}`;
    if (digits.length <= 7) return `(${digits.slice(0, 4)}) ${digits.slice(4)}`;
    if (digits.length <= 9) return `(${digits.slice(0, 4)}) ${digits.slice(4, 7)} ${digits.slice(7)}`;
    return `(${digits.slice(0, 4)}) ${digits.slice(4, 7)} ${digits.slice(7, 9)} ${digits.slice(9)}`;
  };

  // Form state
  const [fullName, setFullName] = useState(userMeta?.full_name ?? '');
  const [phone, setPhone] = useState(formatPhone(userMeta?.phone_number ?? ''));
  const [email, setEmail] = useState(state.user?.email ?? '');
  const [bio, setBio] = useState('');
  const [major, setMajor] = useState('');
  const [hourlyRate, setHourlyRate] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [selectedModes, setSelectedModes] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<number[]>([]);
  const [city, setCity] = useState('');
  const [university, setUniversity] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [offersTrial, setOffersTrial] = useState<boolean | null>(null);
  const [showDiploma, setShowDiploma] = useState(false);
  const [diplomaApproved, setDiplomaApproved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Modal visibility
  const [showMajorPicker, setShowMajorPicker] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showModePicker, setShowModePicker] = useState(false);
  const [showTagPicker, setShowTagPicker] = useState(false);
  const [showCityPicker, setShowCityPicker] = useState(false);

  // Load existing teacher data
  useEffect(() => {
    let cancelled = false;

    async function loadProfile() {
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        // Load avatar + city from profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('avatar_url, city')
          .eq('id', userId)
          .single();
        if (!cancelled && profile?.avatar_url) {
          setAvatarUrl(profile.avatar_url);
        }
        if (!cancelled && profile?.city && !isTeacher) {
          setCity(profile.city);
        }

        if (!isTeacher) {
          if (!cancelled) setLoading(false);
          return;
        }

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
          setOffersTrial(teacher.offers_trial ?? false);
          setShowDiploma(teacher.show_diploma ?? false);
          setDiplomaApproved(teacher.diploma_status === 'approved');
        }
      } catch {
        // fields will show empty defaults
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadProfile();
    return () => { cancelled = true; };
  }, [userId, isTeacher]);

  const toggleCategory = (id: string | number) => {
    const numId = Number(id);
    setSelectedCategories((prev) =>
      prev.includes(numId) ? prev.filter((c) => c !== numId) : [...prev, numId],
    );
  };

  const toggleMode = (mode: string | number) => {
    const strMode = String(mode);
    setSelectedModes((prev) =>
      prev.includes(strMode) ? prev.filter((m) => m !== strMode) : [...prev, strMode],
    );
  };

  const toggleTag = (id: string | number) => {
    const numId = Number(id);
    setSelectedTags((prev) =>
      prev.includes(numId) ? prev.filter((t) => t !== numId) : [...prev, numId],
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
      const filePath = `${userId}/avatar_${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, decode(base64), { contentType });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
      const newUrl = `${data.publicUrl}?t=${Date.now()}`;
      await supabase.from('profiles').update({ avatar_url: newUrl }).eq('id', userId);
      setAvatarUrl(newUrl);
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
      const profileUpdate: Record<string, any> = {
        full_name: fullName.trim(),
        phone_number: phone.replace(/[^0-9]/g, ''),
      };
      if (!isTeacher) {
        profileUpdate.city = city || null;
      }
      const { error: profileError } = await supabase
        .from('profiles')
        .update(profileUpdate)
        .eq('id', userId);

      if (profileError) throw profileError;

      await supabase.auth.updateUser({
        data: { full_name: fullName.trim(), phone_number: phone.trim() },
      });

      if (isTeacher) {
        const { error: teacherError } = await supabase
          .from('teachers')
          .update({
            bio: bio.trim(),
            major,
            university: university.trim(),
            hourly_rate: parseInt(hourlyRate, 10) || 0,
            phone_number: phone.replace(/[^0-9]/g, ''),
            offers_trial: offersTrial ?? false,
            show_diploma: showDiploma,
          })
          .eq('profile_id', userId);

        if (teacherError) throw teacherError;

        await supabase.from('teacher_modes').delete().eq('teacher_id', userId);
        if (selectedModes.length > 0) {
          await supabase.from('teacher_modes').insert(
            selectedModes.map((mode) => ({ teacher_id: userId, mode })),
          );
        }

        await supabase.from('teacher_categories').delete().eq('teacher_id', userId);
        if (selectedCategories.length > 0) {
          await supabase.from('teacher_categories').insert(
            selectedCategories.map((catId) => ({ teacher_id: userId, category_id: catId })),
          );
        }

        await supabase.from('teacher_tags').delete().eq('teacher_id', userId);
        if (selectedTags.length > 0) {
          await supabase.from('teacher_tags').insert(
            selectedTags.map((tagId) => ({ teacher_id: userId, tag_id: tagId })),
          );
        }

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

  // Helper to get summary text for dropdowns
  const getMajorText = () => major || 'Branş seçin';
  const getCategoryText = () => {
    if (selectedCategories.length === 0) return 'Kategori seçin';
    const names = selectedCategories.map((id) => CATEGORIES.find((c) => c.id === id)?.name).filter(Boolean);
    return names.join(', ');
  };
  const getModeText = () => {
    if (selectedModes.length === 0) return 'Ders verme şekli seçin';
    return selectedModes.map((v) => TEACHING_MODES.find((m) => m.value === v)?.label).filter(Boolean).join(', ');
  };
  const filteredTags = getTagsForCategories(selectedCategories);
  const getTagText = () => {
    if (selectedTags.length === 0) return 'Etiket seçin';
    const allTags = getTagsForCategories([1,2,3,4,5,6,7,8,9,10,11,12]);
    const names = selectedTags.map((id) => allTags.find((t) => t.id === id)?.name).filter(Boolean);
    if (names.length <= 2) return names.join(', ');
    return `${names.length} etiket seçildi`;
  };
  const getCityText = () => city || 'Şehir seçin';

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
        {avatarUrl ? (
          <Image source={{ uri: avatarUrl }} style={styles.photoImage} />
        ) : (
          <View style={styles.photoCircle}>
            <Text style={styles.photoInitials}>{getInitials(fullName || 'K')}</Text>
          </View>
        )}
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
          onChangeText={(text) => setPhone(formatPhone(text))}
          placeholder="(05XX) XXX XX XX"
          placeholderTextColor={Colors.textTertiary}
          keyboardType="number-pad"
          maxLength={16}
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

      {/* City — for parents */}
      {!isTeacher && (
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Şehir</Text>
          <TouchableOpacity style={styles.dropdown} onPress={() => setShowCityPicker(true)} activeOpacity={0.7}>
            <Text style={[styles.dropdownText, !city && styles.dropdownPlaceholder]}>{getCityText()}</Text>
            <Ionicons name="chevron-down" size={18} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>
      )}

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
              placeholder="Kendinizi tanıtın..."
              placeholderTextColor={Colors.textTertiary}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              maxLength={500}
            />
            <Text style={styles.charCount}>{bio.length}/500</Text>
          </View>

          {/* Branş Dropdown */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Branş</Text>
            <TouchableOpacity style={styles.dropdown} onPress={() => setShowMajorPicker(true)} activeOpacity={0.7}>
              <Text style={[styles.dropdownText, !major && styles.dropdownPlaceholder]}>{getMajorText()}</Text>
              <Ionicons name="chevron-down" size={18} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Saatlik Ücret */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Saatlik Ücret (₺)</Text>
            <TextInput
              style={styles.input}
              value={hourlyRate}
              onChangeText={(text) => setHourlyRate(text.replace(/[^0-9]/g, ''))}
              placeholder="Örn: 1500"
              placeholderTextColor={Colors.textTertiary}
              keyboardType="number-pad"
            />
          </View>

          {/* Tanışma Dersi Toggle */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Tanışma Dersi</Text>
            <View style={styles.trialToggleRow}>
              <TouchableOpacity
                style={[styles.trialToggle, offersTrial === true && styles.trialToggleActive]}
                onPress={() => setOffersTrial(true)}
                activeOpacity={0.7}
              >
                <Text style={[styles.trialToggleText, offersTrial === true && styles.trialToggleTextActive]}>
                  Evet, veriyorum
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.trialToggle, offersTrial === false && styles.trialToggleActive]}
                onPress={() => setOffersTrial(false)}
                activeOpacity={0.7}
              >
                <Text style={[styles.trialToggleText, offersTrial === false && styles.trialToggleTextActive]}>
                  Hayır
                </Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.trialNote}>
              Tanışma dersi vermeyi kabul etmeniz seçilme oranınızı artırır.
            </Text>
          </View>

          {/* Kategoriler Dropdown */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Kategoriler</Text>
            <TouchableOpacity style={styles.dropdown} onPress={() => setShowCategoryPicker(true)} activeOpacity={0.7}>
              <Text style={[styles.dropdownText, selectedCategories.length === 0 && styles.dropdownPlaceholder]} numberOfLines={1}>{getCategoryText()}</Text>
              <Ionicons name="chevron-down" size={18} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Ders Verme Şekli Dropdown */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Ders Verme Şekli</Text>
            <TouchableOpacity style={styles.dropdown} onPress={() => setShowModePicker(true)} activeOpacity={0.7}>
              <Text style={[styles.dropdownText, selectedModes.length === 0 && styles.dropdownPlaceholder]} numberOfLines={1}>{getModeText()}</Text>
              <Ionicons name="chevron-down" size={18} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Etiketler Dropdown */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Etiketler</Text>
            <TouchableOpacity style={styles.dropdown} onPress={() => setShowTagPicker(true)} activeOpacity={0.7}>
              <Text style={[styles.dropdownText, selectedTags.length === 0 && styles.dropdownPlaceholder]} numberOfLines={1}>{getTagText()}</Text>
              <Ionicons name="chevron-down" size={18} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Şehir Dropdown */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Şehir</Text>
            <TouchableOpacity style={styles.dropdown} onPress={() => setShowCityPicker(true)} activeOpacity={0.7}>
              <Text style={[styles.dropdownText, !city && styles.dropdownPlaceholder]}>{getCityText()}</Text>
              <Ionicons name="chevron-down" size={18} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Availability Calendar */}
          {userId && (
            <View style={styles.fieldGroup}>
              <AvailabilityEditor teacherId={userId} />
            </View>
          )}

          {/* Diploma */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Mezun Belgesi / Sertifika</Text>
            <Text style={styles.diplomaNotice}>
              Mezun belgeniz veya sertifikanız yalnızca yetkinliğinizi doğrulamak amacıyla talep edilmektedir. Belgeniz onaylandığında profilinizde "Onaylı Eğitmen" rozeti görünür ve velilerin size olan güveni artar. Yüklediğiniz belge, inceleme sürecinin ardından sunucularımızdan kalıcı olarak silinir ve hiçbir şekilde üçüncü taraflarla paylaşılmaz.
            </Text>
            <TouchableOpacity
              style={styles.uploadButton}
              onPress={async () => {
                if (!userId) return;
                const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
                if (status !== 'granted') {
                  Alert.alert('İzin Gerekli', 'Galeri erişim izni gereklidir.');
                  return;
                }
                const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.8, allowsEditing: true });
                if (result.canceled || !result.assets[0]) return;
                try {
                  const uri = result.assets[0].uri;
                  const base64 = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
                  const ext = uri.split('.').pop()?.toLowerCase() || 'jpg';
                  const contentType = ext === 'png' ? 'image/png' : 'image/jpeg';
                  const filePath = `${userId}/diploma_${Date.now()}.${ext}`;
                  const { error: uploadError } = await supabase.storage.from('diplomas').upload(filePath, decode(base64), { contentType });
                  if (uploadError) throw uploadError;
                  const { data } = supabase.storage.from('diplomas').getPublicUrl(filePath);
                  await supabase.from('teachers').update({ diploma_url: data.publicUrl, diploma_status: 'pending' }).eq('profile_id', userId);
                  Alert.alert('Başarılı', 'Belgeniz yüklendi ve incelemeye gönderildi.');
                } catch (err: any) {
                  Alert.alert('Hata', err?.message || 'Belge yüklenemedi.');
                }
              }}
              activeOpacity={0.7}
            >
              <Ionicons name="attach" size={18} color={Colors.textSecondary} />
              <Text style={styles.uploadText}>Mezun Belgesi / Sertifika Yükle</Text>
            </TouchableOpacity>
            {diplomaApproved && (
              <View style={styles.diplomaToggle}>
                <View style={styles.diplomaToggleText}>
                  <Text style={styles.fieldLabel}>Belgemi Velilere Göster</Text>
                  <Text style={styles.fieldHint}>Açık olursa belgeniz profil detayınızda görünür.</Text>
                </View>
                <Switch
                  value={showDiploma}
                  onValueChange={setShowDiploma}
                  trackColor={{ false: Colors.border, true: Colors.navy }}
                  thumbColor={Colors.surface}
                />
              </View>
            )}
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

      {/* Modals */}
      <FilterModal
        visible={showMajorPicker}
        title="Branş Seçin"
        options={MAJORS.map((m) => ({ label: m, value: m }))}
        groups={MAJOR_GROUPS.map((g) => ({
          title: g.title,
          items: g.items.map((m) => ({ label: m, value: m })),
        }))}
        selectedValues={major ? [major] : []}
        searchable
        onSelectMulti={(values) => setMajor(values[0] as string ?? '')}
        onClose={() => setShowMajorPicker(false)}
      />
      <PickerModal
        visible={showCategoryPicker}
        onClose={() => setShowCategoryPicker(false)}
        title="Kategoriler"
        data={CATEGORIES.map((c) => ({ id: c.id, label: c.name }))}
        selected={selectedCategories}
        onToggle={toggleCategory}
      />
      <PickerModal
        visible={showModePicker}
        onClose={() => setShowModePicker(false)}
        title="Ders Verme Şekli"
        data={TEACHING_MODES.map((m) => ({ id: m.value, label: m.label }))}
        selected={selectedModes}
        onToggle={toggleMode}
      />
      <PickerModal
        visible={showTagPicker}
        onClose={() => setShowTagPicker(false)}
        title="Etiketler"
        data={filteredTags.map((t) => ({ id: t.id, label: t.name }))}
        selected={selectedTags}
        onToggle={toggleTag}
      />
      <PickerModal
        visible={showCityPicker}
        onClose={() => setShowCityPicker(false)}
        title="Şehir Seçin"
        data={TURKEY_CITIES.map((c) => ({ id: c, label: c }))}
        selected={city ? [city] : []}
        onToggle={(id) => setCity(city === String(id) ? '' : String(id))}
        multi={false}
      />
    </ScrollView>
  );
}

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  content: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  itemText: {
    fontSize: 16,
    color: Colors.textPrimary,
    flex: 1,
  },
  itemTextSelected: {
    color: Colors.navy,
    fontWeight: '600',
  },
});

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
  photoContainer: {
    alignItems: 'center',
    marginBottom: 28,
  },
  photoImage: {
    width: 88,
    height: 88,
    borderRadius: 44,
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
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  dropdownText: {
    fontSize: 15,
    color: Colors.textPrimary,
    flex: 1,
    marginRight: 8,
  },
  dropdownPlaceholder: {
    color: Colors.textTertiary,
  },
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
  diplomaToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
    paddingVertical: 8,
  },
  diplomaToggleText: {
    flex: 1,
    marginRight: 12,
  },
  diplomaNotice: {
    fontSize: 13,
    color: Colors.textPrimary,
    lineHeight: 19,
    marginBottom: 10,
  },
  trialToggleRow: {
    flexDirection: 'row',
    gap: 10,
  },
  trialToggle: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    alignItems: 'center',
  },
  trialToggleActive: {
    borderColor: Colors.navy,
    backgroundColor: Colors.navy,
  },
  trialToggleText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  trialToggleTextActive: {
    color: Colors.textOnDark,
  },
  trialNote: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontStyle: 'italic',
    marginTop: 8,
  },
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
