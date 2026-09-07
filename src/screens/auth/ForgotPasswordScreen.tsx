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
import { Ionicons } from '@expo/vector-icons';
import { BackButton } from '../../components/BackButton';
import { useAuth } from '../../contexts/AuthContext';
import { Colors } from '../../constants/colors';
import { validateEmail } from '../../utils/validation';

export default function ForgotPasswordScreen() {
  const { resetPassword } = useAuth();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleReset = async () => {
    if (!validateEmail(email.trim())) {
      Alert.alert('Hata', 'Lütfen geçerli bir e-posta adresi girin.');
      return;
    }

    setLoading(true);
    try {
      await resetPassword(email.trim());
      setSent(true);
    } catch (error: any) {
      Alert.alert(
        'Hata',
        error?.message || 'Sıfırlama bağlantısı gönderilemedi. Lütfen tekrar deneyin.',
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

          <Text style={styles.title}>Şifremi Unuttum</Text>

          {sent ? (
            /* Success State */
            <View style={styles.successContainer}>
              <Ionicons name="mail-outline" size={48} color={Colors.success} />
              <Text style={styles.successTitle}>Bağlantı Gönderildi</Text>
              <Text style={styles.successText}>
                Şifre sıfırlama bağlantısı{' '}
                <Text style={styles.emailHighlight}>{email.trim()}</Text>
                {' '}adresine gönderildi. Lütfen e-postanızı kontrol edin.
              </Text>
            </View>
          ) : (
            /* Form State */
            <>
              <Text style={styles.description}>
                Kayıtlı e-posta adresinizi girin. Şifre sıfırlama bağlantısı
                göndereceğiz.
              </Text>

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
                  returnKeyType="done"
                  onSubmitEditing={handleReset}
                />
              </View>

              <TouchableOpacity
                style={[styles.ctaButton, loading && styles.ctaButtonDisabled]}
                activeOpacity={0.8}
                onPress={handleReset}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color={Colors.textOnDark} />
                ) : (
                  <Text style={styles.ctaButtonText}>
                    Sıfırlama Bağlantısı Gönder
                  </Text>
                )}
              </TouchableOpacity>
            </>
          )}
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
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    color: Colors.textSecondary,
    lineHeight: 22,
    marginBottom: 32,
  },
  inputGroup: {
    marginBottom: 28,
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
  ctaButton: {
    backgroundColor: Colors.orange,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  ctaButtonDisabled: {
    opacity: 0.7,
  },
  ctaButtonText: {
    color: Colors.textOnDark,
    fontSize: 16,
    fontWeight: '700',
  },
  successContainer: {
    alignItems: 'center',
    paddingTop: 40,
    paddingHorizontal: 16,
  },
  successIcon: {
    fontSize: 48,
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.success,
    marginBottom: 12,
  },
  successText: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  emailHighlight: {
    color: Colors.textPrimary,
    fontWeight: '600',
  },
});
