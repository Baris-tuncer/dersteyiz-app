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
import { useAuth } from '../../contexts/AuthContext';
import { Colors } from '../../constants/colors';

type AuthStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

type LoginNavProp = NativeStackNavigationProp<AuthStackParamList, 'Login'>;

export default function LoginScreen() {
  const navigation = useNavigation<LoginNavProp>();
  const { signIn } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Hata', 'Lütfen e-posta ve şifrenizi girin.');
      return;
    }

    setLoading(true);
    try {
      await signIn(email.trim(), password);
    } catch (error: any) {
      Alert.alert(
        'Giriş Başarısız',
        error?.message || 'E-posta veya şifre hatalı. Lütfen tekrar deneyin.',
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
        >
          <View style={styles.header}>
            <BackButton />
          </View>

          <Text style={styles.title}>Giriş Yap</Text>

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
                placeholder="Şifrenizi girin"
                placeholderTextColor={Colors.textTertiary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                returnKeyType="done"
                onSubmitEditing={handleLogin}
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
          </View>

          {/* Forgot Password */}
          <TouchableOpacity
            style={styles.forgotLink}
            onPress={() => navigation.navigate('ForgotPassword')}
            activeOpacity={0.7}
          >
            <Text style={styles.forgotText}>Şifremi Unuttum</Text>
          </TouchableOpacity>

          {/* Login Button */}
          <TouchableOpacity
            style={[styles.ctaButton, loading && styles.ctaButtonDisabled]}
            activeOpacity={0.8}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={Colors.textOnDark} />
            ) : (
              <Text style={styles.ctaButtonText}>Giriş Yap</Text>
            )}
          </TouchableOpacity>

          {/* Register Link */}
          <View style={styles.bottomLink}>
            <Text style={styles.bottomText}>Hesabınız yok mu? </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('Register')}
              activeOpacity={0.7}
            >
              <Text style={styles.bottomLinkText}>Kayıt Ol</Text>
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
    paddingBottom: 32,
  },
  header: {
    paddingTop: 8,
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.navy,
    marginBottom: 32,
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
  forgotLink: {
    alignSelf: 'flex-end',
    marginBottom: 28,
  },
  forgotText: {
    fontSize: 14,
    color: Colors.orange,
    fontWeight: '600',
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
