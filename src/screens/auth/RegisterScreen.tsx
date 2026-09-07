import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { BackButton } from '../../components/BackButton';
import { PasswordStrength } from '../../components/PasswordStrength';
import { useAuth } from '../../contexts/AuthContext';
import { Colors } from '../../constants/colors';
import { validateEmail, validatePhone, isPasswordValid } from '../../utils/validation';
import type { UserRole } from '../../types/auth';

type AuthStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
  Verification: { email: string };
};

type RegisterNavProp = NativeStackNavigationProp<AuthStackParamList, 'Register'>;

export default function RegisterScreen() {
  const navigation = useNavigation<RegisterNavProp>();
  const { signUp } = useAuth();

  const [role, setRole] = useState<UserRole>('parent');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [kvkkAccepted, setKvkkAccepted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    // Validations
    if (!fullName.trim()) {
      Alert.alert('Hata', 'Lütfen adınızı ve soyadınızı girin.');
      return;
    }
    if (!validatePhone(phone)) {
      Alert.alert('Hata', 'Lütfen geçerli bir telefon numarası girin.');
      return;
    }
    if (!validateEmail(email)) {
      Alert.alert('Hata', 'Lütfen geçerli bir e-posta adresi girin.');
      return;
    }
    if (!isPasswordValid(password)) {
      Alert.alert('Hata', 'Şifreniz tüm güvenlik kurallarını karşılamalıdır.');
      return;
    }
    if (!kvkkAccepted) {
      Alert.alert('Hata', 'Devam etmek için KVKK metnini kabul etmeniz gerekmektedir.');
      return;
    }

    setLoading(true);
    try {
      await signUp(email.trim(), password, role, fullName.trim(), phone.trim());
      navigation.navigate('Verification', { email: email.trim() });
    } catch (error: any) {
      Alert.alert(
        'Kayıt Başarısız',
        error?.message || 'Kayıt sırasında bir hata oluştu. Lütfen tekrar deneyin.',
      );
    } finally {
      setLoading(false);
    }
  };

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
          <View style={styles.header}>
            <BackButton />
          </View>

          <Text style={styles.title}>Kayıt Ol</Text>

          {/* Role Selector */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Hesap Türü</Text>
            <View style={styles.roleContainer}>
              <TouchableOpacity
                style={[
                  styles.rolePill,
                  role === 'parent' && styles.rolePillActive,
                ]}
                onPress={() => setRole('parent')}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.rolePillText,
                    role === 'parent' && styles.rolePillTextActive,
                  ]}
                >
                  Veli / Öğrenci
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.rolePill,
                  role === 'teacher' && styles.rolePillActive,
                ]}
                onPress={() => setRole('teacher')}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.rolePillText,
                    role === 'teacher' && styles.rolePillTextActive,
                  ]}
                >
                  Öğretmen
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Full Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Ad Soyad</Text>
            <TextInput
              style={styles.input}
              placeholder="Adınız ve soyadınız"
              placeholderTextColor={Colors.textTertiary}
              value={fullName}
              onChangeText={setFullName}
              autoCapitalize="words"
              returnKeyType="next"
            />
          </View>

          {/* Phone */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Telefon</Text>
            <TextInput
              style={styles.input}
              placeholder="05XX XXX XX XX"
              placeholderTextColor={Colors.textTertiary}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              returnKeyType="next"
            />
          </View>

          {/* Email */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>E-posta</Text>
            <TextInput
              style={styles.input}
              placeholder="ornek@email.com"
              placeholderTextColor={Colors.textTertiary}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="next"
            />
          </View>

          {/* Password */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Şifre</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Şifrenizi belirleyin"
                placeholderTextColor={Colors.textTertiary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                returnKeyType="done"
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowPassword(!showPassword)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={showPassword ? 'eye' : 'eye-off'}
                  size={22}
                  color={Colors.textSecondary}
                />
              </TouchableOpacity>
            </View>
            <PasswordStrength password={password} />
          </View>

          {/* KVKK Checkbox */}
          <TouchableOpacity
            style={styles.kvkkRow}
            onPress={() => setKvkkAccepted(!kvkkAccepted)}
            activeOpacity={0.7}
          >
            <View style={[styles.checkbox, kvkkAccepted && styles.checkboxActive]}>
              {kvkkAccepted && (
                <Ionicons name="checkmark" size={16} color={Colors.textOnDark} />
              )}
            </View>
            <Text style={styles.kvkkText}>
              KVKK Aydınlatma Metni'ni okudum ve kabul ediyorum.
            </Text>
          </TouchableOpacity>

          {/* Register Button */}
          <TouchableOpacity
            style={[styles.ctaButton, loading && styles.ctaButtonDisabled]}
            activeOpacity={0.8}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={Colors.textOnDark} />
            ) : (
              <Text style={styles.ctaButtonText}>Kayıt Ol</Text>
            )}
          </TouchableOpacity>

          {/* Login Link */}
          <View style={styles.bottomLink}>
            <Text style={styles.bottomText}>Zaten hesabınız var mı? </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('Login')}
              activeOpacity={0.7}
            >
              <Text style={styles.bottomLinkText}>Giriş Yap</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
    paddingBottom: 40,
  },
  header: {
    paddingTop: 8,
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.navy,
    marginBottom: 28,
  },
  inputGroup: {
    marginBottom: 20,
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
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.borderDark,
    borderRadius: 12,
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: Colors.textPrimary,
  },
  eyeButton: {
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  eyeText: {
    fontSize: 20,
    color: Colors.textSecondary,
  },
  roleContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  rolePill: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: Colors.borderDark,
    alignItems: 'center',
    backgroundColor: Colors.surface,
  },
  rolePillActive: {
    backgroundColor: Colors.navy,
    borderColor: Colors.navy,
  },
  rolePillText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  rolePillTextActive: {
    color: Colors.textOnDark,
  },
  kvkkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 28,
    paddingRight: 16,
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
  kvkkText: {
    flex: 1,
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  ctaButton: {
    backgroundColor: Colors.orange,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 24,
  },
  ctaButtonDisabled: {
    opacity: 0.7,
  },
  ctaButtonText: {
    color: Colors.textOnDark,
    fontSize: 16,
    fontWeight: '700',
  },
  bottomLink: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  bottomLinkText: {
    fontSize: 14,
    color: Colors.orange,
    fontWeight: '700',
  },
});
