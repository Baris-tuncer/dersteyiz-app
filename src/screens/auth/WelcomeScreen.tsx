import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors } from '../../constants/colors';

type AuthStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
};

type WelcomeNavProp = NativeStackNavigationProp<AuthStackParamList, 'Welcome'>;

export default function WelcomeScreen() {
  const navigation = useNavigation<WelcomeNavProp>();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.surface} />

      {/* Logo Area */}
      <View style={styles.logoArea}>
        <Text style={styles.logoText}>
          <Text style={styles.logoNavy}>Derste</Text>
          <Text style={styles.logoOrange}>yiz</Text>
        </Text>
        <Text style={styles.tagline}>
          {'Öğrenmenin en doğru adresi'}
        </Text>
      </View>

      {/* Buttons */}
      <View style={styles.buttonArea}>
        <TouchableOpacity
          style={styles.loginButton}
          activeOpacity={0.8}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.loginButtonText}>Giriş Yap</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.registerButton}
          activeOpacity={0.8}
          onPress={() => navigation.navigate('Register')}
        >
          <Text style={styles.registerButtonText}>Kayıt Ol</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
    justifyContent: 'space-between',
  },
  logoArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  logoText: {
    fontSize: 42,
    fontWeight: '800',
    marginBottom: 16,
  },
  logoNavy: {
    color: Colors.navy,
  },
  logoOrange: {
    color: Colors.orange,
  },
  tagline: {
    fontSize: 18,
    color: Colors.textPrimary,
    textAlign: 'center',
    lineHeight: 26,
    fontWeight: '500',
    letterSpacing: 0.3,
  },
  buttonArea: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    gap: 12,
  },
  loginButton: {
    backgroundColor: Colors.navy,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  loginButtonText: {
    color: Colors.textOnDark,
    fontSize: 16,
    fontWeight: '700',
  },
  registerButton: {
    backgroundColor: Colors.orange,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  registerButtonText: {
    color: Colors.textOnDark,
    fontSize: 16,
    fontWeight: '700',
  },
});
