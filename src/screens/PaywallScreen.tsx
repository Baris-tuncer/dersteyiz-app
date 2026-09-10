import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import { useSubscription } from '../contexts/SubscriptionContext';
import { MONTHLY_PRICE, FREE_TRIAL_DAYS } from '../constants/subscription';

const FEATURES = [
  'Velilerin WhatsApp ile size ulaşmasını sağlayın',
  'Tanışma taleplerini kabul edin ve iletişime geçin',
  'Profilinizi öne çıkarın (ayda 2 kez, 3 gün)',
  'Listenin en üstünde görünün',
  'Öne Çıkan rozeti ile dikkat çekin',
  'Detaylı analitik: kim baktı, hangi şehir, hangi saat',
];

export default function PaywallScreen() {
  const navigation = useNavigation<any>();
  const { state, purchaseSubscription, restorePurchases } = useSubscription();
  const [loading, setLoading] = useState(false);

  const displayPrice = state.productPrice || MONTHLY_PRICE;

  const handleSubscribe = async () => {
    setLoading(true);
    try {
      await purchaseSubscription();
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async () => {
    setLoading(true);
    try {
      await restorePurchases();
    } finally {
      setLoading(false);
    }
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

      {/* Trial Banner */}
      <View style={styles.trialBanner}>
        <Ionicons name="gift-outline" size={22} color={Colors.navy} />
        <View style={styles.trialTextContainer}>
          <Text style={styles.trialTitle}>İlk {FREE_TRIAL_DAYS} gün ücretsiz!</Text>
          <Text style={styles.trialSubtitle}>
            Deneme süresi boyunca herhangi bir ücret alınmaz.
          </Text>
        </View>
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
          <Text style={styles.priceAmount}>{displayPrice}</Text>
          <Text style={styles.pricePeriod}>/ay</Text>
        </View>
        <Text style={styles.priceNote}>
          {FREE_TRIAL_DAYS} günlük ücretsiz deneme sonrası
        </Text>
      </View>

      {/* Subscribe Button */}
      <TouchableOpacity
        style={[styles.subscribeButton, loading && styles.subscribeButtonDisabled]}
        onPress={handleSubscribe}
        activeOpacity={0.8}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color={Colors.textOnDark} />
        ) : (
          <Text style={styles.subscribeButtonText}>Ücretsiz Denemeyi Başlat</Text>
        )}
      </TouchableOpacity>

      {/* Restore */}
      <TouchableOpacity
        style={styles.restoreButton}
        onPress={handleRestore}
        activeOpacity={0.7}
        disabled={loading}
      >
        <Text style={styles.restoreButtonText}>Satın Alımı Geri Yükle</Text>
      </TouchableOpacity>

      {/* Auto-renewal Disclosure (Apple zorunlu) */}
      <Text style={styles.disclosure}>
        Abonelik otomatik olarak yenilenir. Ödeme Apple ID hesabınızdan tahsil
        edilir. {FREE_TRIAL_DAYS} günlük ücretsiz deneme süresi bitmeden en az 24
        saat önce iptal edilmezse abonelik başlar. Aboneliğinizi istediğiniz zaman
        Ayarlar {'>'} Abonelikler bölümünden iptal edebilirsiniz.
      </Text>

      {/* Legal Links */}
      <View style={styles.legalContainer}>
        <TouchableOpacity
          onPress={() => navigation.navigate('Terms')}
          activeOpacity={0.7}
        >
          <Text style={styles.legalLink}>Kullanım Koşulları</Text>
        </TouchableOpacity>
        <Text style={styles.legalDot}>{'\u00B7'}</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('KVKK')}
          activeOpacity={0.7}
        >
          <Text style={styles.legalLink}>KVKK</Text>
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
  trialBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.navyLight,
    marginHorizontal: 16,
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    gap: 12,
  },
  trialTextContainer: {
    flex: 1,
  },
  trialTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.navy,
    marginBottom: 2,
  },
  trialSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
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
  subscribeButtonDisabled: {
    opacity: 0.7,
  },
  subscribeButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.textOnDark,
  },
  restoreButton: {
    alignItems: 'center',
    paddingVertical: 12,
    marginBottom: 16,
  },
  disclosure: {
    fontSize: 11,
    color: Colors.textTertiary,
    textAlign: 'center',
    lineHeight: 16,
    paddingHorizontal: 24,
    marginBottom: 16,
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
