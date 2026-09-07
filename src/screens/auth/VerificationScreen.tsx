import React, { useState, useRef, useEffect, useCallback } from 'react';
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
  ActivityIndicator,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BackButton } from '../../components/BackButton';
import { Colors } from '../../constants/colors';
import { supabase } from '../../config/supabase';

type AuthStackParamList = {
  Verification: { email: string };
  Login: undefined;
};

type VerificationRouteProp = RouteProp<AuthStackParamList, 'Verification'>;

const OTP_LENGTH = 6;
const COOLDOWN_SECONDS = 30;

export default function VerificationScreen() {
  const route = useRoute<VerificationRouteProp>();
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList>>();
  const { email } = route.params;

  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const inputRefs = useRef<(TextInput | null)[]>([]);

  // Cooldown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const focusInput = (index: number) => {
    if (index >= 0 && index < OTP_LENGTH) {
      inputRefs.current[index]?.focus();
    }
  };

  const handleChange = (text: string, index: number) => {
    // Handle paste (multiple characters)
    if (text.length > 1) {
      const digits = text.replace(/\D/g, '').slice(0, OTP_LENGTH).split('');
      const newOtp = [...otp];
      digits.forEach((digit, i) => {
        if (index + i < OTP_LENGTH) {
          newOtp[index + i] = digit;
        }
      });
      setOtp(newOtp);
      const nextIndex = Math.min(index + digits.length, OTP_LENGTH - 1);
      focusInput(nextIndex);
      return;
    }

    // Single character
    const digit = text.replace(/\D/g, '');
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);

    if (digit && index < OTP_LENGTH - 1) {
      focusInput(index + 1);
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !otp[index] && index > 0) {
      const newOtp = [...otp];
      newOtp[index - 1] = '';
      setOtp(newOtp);
      focusInput(index - 1);
    }
  };

  const handleVerify = async () => {
    const code = otp.join('');
    if (code.length !== OTP_LENGTH) {
      Alert.alert('Hata', 'Lütfen 6 haneli doğrulama kodunu eksiksiz girin.');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: code,
        type: 'signup',
      });
      if (error) throw error;
      // onAuthStateChange listener will pick up the session automatically
    } catch (error: any) {
      Alert.alert(
        'Doğrulama Başarısız',
        error?.message || 'Kod geçersiz veya süresi dolmuş. Lütfen tekrar deneyin.',
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResend = useCallback(async () => {
    if (cooldown > 0) return;

    try {
      const { error } = await supabase.auth.resend({ type: 'signup', email });
      if (error) throw error;
      setCooldown(COOLDOWN_SECONDS);
      Alert.alert('Gönderildi', 'Doğrulama kodu tekrar gönderildi.');
    } catch (error: any) {
      Alert.alert('Hata', error?.message || 'Kod gönderilemedi. Lütfen tekrar deneyin.');
    }
  }, [cooldown, email]);

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <BackButton />
          </View>

          <Text style={styles.title}>E-posta Doğrulama</Text>
          <Text style={styles.subtitle}>
            <Text style={styles.subtitleRegular}>Doğrulama kodu </Text>
            <Text style={styles.subtitleEmail}>{email}</Text>
            <Text style={styles.subtitleRegular}> adresine gönderildi.</Text>
          </Text>

          {/* OTP Inputs */}
          <View style={styles.otpContainer}>
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => {
                  inputRefs.current[index] = ref;
                }}
                style={[
                  styles.otpInput,
                  digit ? styles.otpInputFilled : null,
                ]}
                value={digit}
                onChangeText={(text) => handleChange(text, index)}
                onKeyPress={({ nativeEvent }) =>
                  handleKeyPress(nativeEvent.key, index)
                }
                keyboardType="number-pad"
                maxLength={index === 0 ? OTP_LENGTH : 1}
                selectTextOnFocus
                textContentType="oneTimeCode"
              />
            ))}
          </View>

          {/* Verify Button */}
          <TouchableOpacity
            style={[styles.ctaButton, loading && styles.ctaButtonDisabled]}
            activeOpacity={0.8}
            onPress={handleVerify}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={Colors.textOnDark} />
            ) : (
              <Text style={styles.ctaButtonText}>Doğrula</Text>
            )}
          </TouchableOpacity>

          {/* Resend */}
          <TouchableOpacity
            style={styles.resendLink}
            onPress={handleResend}
            activeOpacity={0.7}
            disabled={cooldown > 0}
          >
            <Text
              style={[
                styles.resendText,
                cooldown > 0 && styles.resendTextDisabled,
              ]}
            >
              {cooldown > 0
                ? `Kodu tekrar gönder (${cooldown}s)`
                : 'Kodu tekrar gönder'}
            </Text>
          </TouchableOpacity>

          {/* Already verified? Go to login */}
          <TouchableOpacity
            style={styles.loginLink}
            onPress={() => navigation.navigate('Login')}
            activeOpacity={0.7}
          >
            <Text style={styles.loginLinkText}>
              Zaten doğruladıysanız{' '}
              <Text style={styles.loginLinkBold}>Giriş Yapın</Text>
            </Text>
          </TouchableOpacity>
        </View>
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
  content: {
    flex: 1,
    paddingHorizontal: 24,
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
  subtitle: {
    marginBottom: 36,
    lineHeight: 22,
  },
  subtitleRegular: {
    fontSize: 15,
    color: Colors.textSecondary,
  },
  subtitleEmail: {
    fontSize: 15,
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 32,
  },
  otpInput: {
    flex: 1,
    height: 56,
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.borderDark,
    borderRadius: 12,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  otpInputFilled: {
    borderColor: Colors.navy,
  },
  ctaButton: {
    backgroundColor: Colors.orange,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  ctaButtonDisabled: {
    opacity: 0.7,
  },
  ctaButtonText: {
    color: Colors.textOnDark,
    fontSize: 16,
    fontWeight: '700',
  },
  resendLink: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  resendText: {
    fontSize: 14,
    color: Colors.orange,
    fontWeight: '600',
  },
  resendTextDisabled: {
    color: Colors.textTertiary,
  },
  loginLink: {
    alignItems: 'center',
    paddingVertical: 16,
    marginTop: 12,
  },
  loginLinkText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  loginLinkBold: {
    color: Colors.navy,
    fontWeight: '700',
  },
});
