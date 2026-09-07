import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { useAuth } from '../../contexts/AuthContext';
import { getInitials, formatWhatsAppUrl } from '../../utils/formatters';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];
type MCIName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

interface MenuItem {
  iconLib: 'ionicons' | 'mci';
  iconName: IoniconsName | MCIName;
  label: string;
  description: string;
  onPress: () => void;
  destructive?: boolean;
}

function MenuRow({ item }: { item: MenuItem }) {
  return (
    <TouchableOpacity
      style={styles.menuRow}
      onPress={item.onPress}
      activeOpacity={0.7}
    >
      <View style={styles.menuIconContainer}>
        {item.iconLib === 'mci' ? (
          <MaterialCommunityIcons
            name={item.iconName as MCIName}
            size={18}
            color={Colors.navy}
          />
        ) : (
          <Ionicons
            name={item.iconName as IoniconsName}
            size={18}
            color={Colors.navy}
          />
        )}
      </View>
      <View style={styles.menuContent}>
        <Text
          style={[
            styles.menuLabel,
            item.destructive && styles.menuLabelDestructive,
          ]}
        >
          {item.label}
        </Text>
        <Text style={styles.menuDescription}>{item.description}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={Colors.textTertiary} />
    </TouchableOpacity>
  );
}

export default function ProfileScreen() {
  const navigation = useNavigation<any>();
  const { state, signOut } = useAuth();

  const userName = state.user?.user_metadata?.full_name ?? 'Kullanıcı';
  const userEmail = state.user?.email ?? '';

  const handleSignOut = () => {
    Alert.alert(
      'Çıkış Yap',
      'Hesabınızdan çıkış yapmak istediğinize emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Çıkış Yap',
          style: 'destructive',
          onPress: () => signOut(),
        },
      ],
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Hesabımı Sil',
      'Bu işlem geri alınamaz. Hesabınız ve tüm verileriniz kalıcı olarak silinecektir. Devam etmek istiyor musunuz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Evet, Hesabımı Sil',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Bilgi', 'Hesap silme talebi alınmıştır.');
          },
        },
      ],
    );
  };

  const handleWhatsAppSupport = () => {
    const url = formatWhatsAppUrl('5300000000', 'Merhaba, Dersteyiz uygulaması hakkında destek almak istiyorum.');
    Linking.openURL(url).catch(() => {});
  };

  const profileMenuItems: MenuItem[] = [
    {
      iconLib: 'ionicons',
      iconName: 'create-outline',
      label: 'Profilimi Düzenle',
      description: 'Kişisel bilgilerinizi güncelleyin',
      onPress: () => navigation.navigate('EditProfile'),
    },
    {
      iconLib: 'ionicons',
      iconName: 'heart-outline',
      label: 'Favori Öğretmenlerim',
      description: 'Kaydettiğiniz öğretmenleri görün',
      onPress: () => navigation.navigate('MainTabs', { screen: 'Favorites' }),
    },
    {
      iconLib: 'ionicons',
      iconName: 'settings-outline',
      label: 'Ayarlar',
      description: 'Bildirim ve uygulama ayarları',
      onPress: () => navigation.navigate('Settings'),
    },
  ];

  const supportMenuItems: MenuItem[] = [
    {
      iconLib: 'mci',
      iconName: 'whatsapp',
      label: 'WhatsApp Destek Hattı',
      description: 'Sorularınız için bize ulaşın',
      onPress: handleWhatsAppSupport,
    },
    {
      iconLib: 'ionicons',
      iconName: 'key-outline',
      label: 'Şifre Değiştir',
      description: 'Hesap şifrenizi güncelleyin',
      onPress: () => {
        Alert.alert('Bilgi', 'Şifre değiştirme e-postası gönderildi.');
      },
    },
    {
      iconLib: 'ionicons',
      iconName: 'notifications-outline',
      label: 'Bildirim İzinleri',
      description: 'Bildirim tercihlerinizi yönetin',
      onPress: () => navigation.navigate('Settings'),
    },
  ];

  const legalMenuItems: MenuItem[] = [
    {
      iconLib: 'ionicons',
      iconName: 'document-text-outline',
      label: 'KVKK Aydınlatma Metni',
      description: 'Kişisel veri koruma bilgilendirmesi',
      onPress: () => navigation.navigate('KVKK'),
    },
    {
      iconLib: 'ionicons',
      iconName: 'reader-outline',
      label: 'Kullanım Koşulları',
      description: 'Uygulama kullanım şartları',
      onPress: () => navigation.navigate('Terms'),
    },
    {
      iconLib: 'ionicons',
      iconName: 'shield-outline',
      label: 'Gizlilik Politikası',
      description: 'Gizlilik ve veri güvenliği',
      onPress: () => navigation.navigate('Privacy'),
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profil</Text>
        </View>

        {/* User Card */}
        <View style={styles.userCard}>
          <View style={styles.userAvatar}>
            <Text style={styles.userAvatarText}>
              {getInitials(userName)}
            </Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{userName}</Text>
            <Text style={styles.userEmail}>{userEmail}</Text>
          </View>
        </View>

        {/* Profile Section */}
        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>HESABIM</Text>
          {profileMenuItems.map((item, index) => (
            <MenuRow key={index} item={item} />
          ))}
        </View>

        {/* Support Section */}
        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>DESTEK</Text>
          {supportMenuItems.map((item, index) => (
            <MenuRow key={index} item={item} />
          ))}
        </View>

        {/* Legal Section */}
        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>YASAL</Text>
          {legalMenuItems.map((item, index) => (
            <MenuRow key={index} item={item} />
          ))}
        </View>

        {/* Sign Out */}
        <TouchableOpacity
          style={styles.signOutButton}
          onPress={handleSignOut}
          activeOpacity={0.8}
        >
          <Text style={styles.signOutButtonText}>Çıkış Yap</Text>
        </TouchableOpacity>

        {/* Delete Account */}
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={handleDeleteAccount}
          activeOpacity={0.7}
        >
          <Text style={styles.deleteButtonText}>Hesabımı Sil</Text>
        </TouchableOpacity>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    paddingBottom: 40,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.navy,
    letterSpacing: -0.5,
  },

  // User Card
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    marginHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    marginBottom: 24,
  },
  userAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.navyLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userAvatarText: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.navy,
  },
  userInfo: {
    flex: 1,
    marginLeft: 14,
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 14,
    color: Colors.textSecondary,
  },

  // Menu Sections
  menuSection: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textTertiary,
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 14,
    marginBottom: 6,
  },
  menuIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.navyLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  menuContent: {
    flex: 1,
  },
  menuLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  menuLabelDestructive: {
    color: Colors.error,
  },
  menuDescription: {
    fontSize: 13,
    color: Colors.textTertiary,
  },

  // Sign Out
  signOutButton: {
    backgroundColor: Colors.navy,
    borderRadius: 14,
    paddingVertical: 16,
    marginHorizontal: 16,
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 8,
  },
  signOutButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textOnDark,
  },

  // Delete Account
  deleteButton: {
    alignItems: 'center',
    paddingVertical: 14,
    marginHorizontal: 16,
  },
  deleteButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.error,
  },
  bottomSpacer: {
    height: 20,
  },
});
