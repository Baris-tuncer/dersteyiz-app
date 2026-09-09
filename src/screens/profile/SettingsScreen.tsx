import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Switch,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { Colors } from '../../constants/colors';
import { useAuth } from '../../contexts/AuthContext';
import {
  getNotificationPreferences,
  setNotificationPreferences,
} from '../../services/notificationService';

export default function SettingsScreen() {
  const { state } = useAuth();
  const userId = state.user?.id;

  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(false);

  useEffect(() => {
    if (!userId) return;
    getNotificationPreferences(userId).then((prefs) => {
      setPushEnabled(prefs.push_enabled);
      setEmailEnabled(prefs.email_enabled);
    });
  }, [userId]);

  const handlePushToggle = async (value: boolean) => {
    setPushEnabled(value);
    if (userId) {
      await setNotificationPreferences(userId, { push_enabled: value });
    }
  };

  const handleEmailToggle = async (value: boolean) => {
    setEmailEnabled(value);
    if (userId) {
      await setNotificationPreferences(userId, { email_enabled: value });
    }
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Notification Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Bildirimler</Text>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Push Bildirimleri</Text>
            <Text style={styles.settingDescription}>
              Yeni mesaj ve güncellemeler için anlık bildirim alın.
            </Text>
          </View>
          <Switch
            value={pushEnabled}
            onValueChange={handlePushToggle}
            trackColor={{ false: Colors.borderDark, true: Colors.navy }}
            thumbColor={Colors.surface}
            ios_backgroundColor={Colors.borderDark}
          />
        </View>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>E-posta Bildirimleri</Text>
            <Text style={styles.settingDescription}>
              Haftalık özet ve kampanya bilgileri e-posta ile gönderilsin.
            </Text>
          </View>
          <Switch
            value={emailEnabled}
            onValueChange={handleEmailToggle}
            trackColor={{ false: Colors.borderDark, true: Colors.navy }}
            thumbColor={Colors.surface}
            ios_backgroundColor={Colors.borderDark}
          />
        </View>
      </View>

      {/* App Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Uygulama Bilgisi</Text>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Versiyon</Text>
          <Text style={styles.infoValue}>1.0.0</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Platform</Text>
          <Text style={styles.infoValue}>Expo / React Native</Text>
        </View>
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
    paddingTop: 16,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 28,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  settingInfo: {
    flex: 1,
    marginRight: 12,
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 13,
    color: Colors.textTertiary,
    lineHeight: 18,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: Colors.textPrimary,
  },
  infoValue: {
    fontSize: 15,
    color: Colors.textSecondary,
  },
  bottomSpacer: {
    height: 20,
  },
});
