import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';

const FEATURES = [
  'Profiliniz vitrine çıkar',
  'Öğrenciler sizi kolayca bulur',
  'WhatsApp ile doğrudan iletişim',
  'Sınırsız profil görüntülenme',
  'Öncelikli destek',
];

export default function PaywallScreen() {
  const navigation = useNavigation<any>();

  const handleSubscribe = () => {
    Alert.alert(
      'Abonelik',
      'Abonelik işlemi yakında aktif olacaktır.',
      [{ text: 'Tamam' }],
    );
  };

  const handleRestore = () => {
    Alert.alert(
      'Geri Yükleme',
      'Satın alım geri yükleme işlemi başlatıldı.',
      [{ text: 'Tamam' }],
    );
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Hero */}
      <View style={styles.heroSection}>
        <Ionicons name="star" size={48} color={Colors.orange} />
        <Text style={styles.heroTitle}>Premium Öğretmen Aboneliği</Text>
        <Text style={styles.heroSubtitle}>
          Profilinizi öne çıkarın, daha fazla öğrenciye ulaşın.
        </Text>
      </View>

      {/* Features */}
      <View style={styles.featuresCard}>
        {FEATURES.map((feature, index) => (
          <View key={index} style={styles.featureRow}>
            <Ionicons name="checkmark-circle" size={20} color={Colors.success} style={styles.featureCheck} />
            <Text style={styles.featureText}>{feature}</Text>
          </View>
        ))}
      </View>

      {/* Pricing */}
      <View style={styles.priceCard}>
        <Text style={styles.priceLabel}>Aylık Abonelik</Text>
        <View style={styles.priceRow}>
          <Text style={styles.priceAmount}>₺399</Text>
          <Text style={styles.pricePeriod}>/ay</Text>
        </View>
        <Text style={styles.priceNote}>
          İstediğiniz zaman iptal edebilirsiniz.
        </Text>
      </View>

      {/* Subscribe Button */}
      <TouchableOpacity
        style={styles.subscribeButton}
        onPress={handleSubscribe}
        activeOpacity={0.8}
      >
        <Text style={styles.subscribeButtonText}>Abone Ol</Text>
      </TouchableOpacity>

      {/* Restore */}
      <TouchableOpacity
        style={styles.restoreButton}
        onPress={handleRestore}
        activeOpacity={0.7}
      >
        <Text style={styles.restoreButtonText}>Satın Alımı Geri Yükle</Text>
      </TouchableOpacity>

      {/* Legal Links */}
      <View style={styles.legalContainer}>
        <TouchableOpacity
          onPress={() => navigation.navigate('KVKK')}
          activeOpacity={0.7}
        >
          <Text style={styles.legalLink}>KVKK Aydınlatma Metni</Text>
        </TouchableOpacity>
        <Text style={styles.legalDot}>{'\u00B7'}</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('Privacy')}
          activeOpacity={0.7}
        >
          <Text style={styles.legalLink}>Gizlilik Politikası</Text>
        </TouchableOpacity>
      </View>

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
    paddingBottom: 40,
  },
  heroSection: {
    alignItems: 'center',
    paddingTop: 32,
    paddingBottom: 24,
    paddingHorizontal: 24,
  },
  heroIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.navy,
    textAlign: 'center',
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  featuresCard: {
    backgroundColor: Colors.surface,
    marginHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 20,
    marginBottom: 16,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  featureCheck: {
    marginRight: 14,
    width: 24,
  },
  featureText: {
    fontSize: 15,
    color: Colors.textPrimary,
    fontWeight: '500',
    flex: 1,
  },
  priceCard: {
    backgroundColor: Colors.orangeLight,
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 2,
    borderColor: Colors.orange,
  },
  priceLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  priceAmount: {
    fontSize: 40,
    fontWeight: '800',
    color: Colors.orange,
  },
  pricePeriod: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginLeft: 4,
  },
  priceNote: {
    fontSize: 13,
    color: Colors.textTertiary,
  },
  subscribeButton: {
    backgroundColor: Colors.orange,
    borderRadius: 14,
    paddingVertical: 16,
    marginHorizontal: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  subscribeButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.textOnDark,
  },
  restoreButton: {
    alignItems: 'center',
    paddingVertical: 12,
    marginBottom: 20,
  },
  restoreButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.navy,
  },
  legalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  legalLink: {
    fontSize: 13,
    color: Colors.textTertiary,
    textDecorationLine: 'underline',
  },
  legalDot: {
    fontSize: 13,
    color: Colors.textTertiary,
    marginHorizontal: 8,
  },
  bottomSpacer: {
    height: 20,
  },
});
