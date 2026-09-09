import React from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Colors } from '../constants/colors';
import { useAuth } from '../contexts/AuthContext';
import type { RootStackParamList, AuthStackParamList } from '../types/navigation';

import AuthStack from './AuthStack';
import MainTabs from './MainTabs';

import ProfileSetupScreen from '../screens/auth/ProfileSetupScreen';
import TeacherDetailScreen from '../screens/TeacherDetailScreen';
import EditProfileScreen from '../screens/profile/EditProfileScreen';
import SettingsScreen from '../screens/profile/SettingsScreen';
import AdminPanelScreen from '../screens/profile/AdminPanelScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import PaywallScreen from '../screens/PaywallScreen';
import KVKKScreen from '../screens/legal/KVKKScreen';
import TermsScreen from '../screens/legal/TermsScreen';
import PrivacyScreen from '../screens/legal/PrivacyScreen';
import ReportScreen from '../screens/ReportScreen';
import AnalyticsDashboardScreen from '../screens/AnalyticsDashboardScreen';
import CompareScreen from '../screens/CompareScreen';
import TrialRequestsScreen from '../screens/TrialRequestsScreen';
import RemindersScreen from '../screens/RemindersScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();
const ProfileSetupStack = createNativeStackNavigator<Pick<AuthStackParamList, 'ProfileSetup'>>();

function ProfileSetupNavigator() {
  return (
    <ProfileSetupStack.Navigator screenOptions={{ headerShown: false }}>
      <ProfileSetupStack.Screen name="ProfileSetup" component={ProfileSetupScreen} />
    </ProfileSetupStack.Navigator>
  );
}

export default function RootNavigator() {
  const { state } = useAuth();

  if (state.isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={Colors.navy} />
      </View>
    );
  }

  if (!state.session) {
    return <AuthStack />;
  }

  if (state.needsProfile) {
    return <ProfileSetupNavigator />;
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: Colors.surface },
        headerTintColor: Colors.navy,
        headerTitleStyle: { fontWeight: '600', color: Colors.textPrimary },
        headerBackTitle: '',
      }}
    >
      <Stack.Screen
        name="MainTabs"
        component={MainTabs}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="TeacherDetail"
        component={TeacherDetailScreen}
        options={{ title: 'Öğretmen Detayı' }}
      />
      <Stack.Screen
        name="EditProfile"
        component={EditProfileScreen}
        options={{ title: 'Profili Düzenle' }}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ title: 'Ayarlar' }}
      />
      <Stack.Screen
        name="AdminPanel"
        component={AdminPanelScreen}
        options={{ title: 'Yönetim Paneli' }}
      />
      <Stack.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{ title: 'Bildirimler' }}
      />
      <Stack.Screen
        name="Paywall"
        component={PaywallScreen}
        options={{
          title: 'Premium',
          presentation: 'modal',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="KVKK"
        component={KVKKScreen}
        options={{ title: 'KVKK Aydınlatma Metni' }}
      />
      <Stack.Screen
        name="Terms"
        component={TermsScreen}
        options={{ title: 'Kullanım Koşulları' }}
      />
      <Stack.Screen
        name="Privacy"
        component={PrivacyScreen}
        options={{ title: 'Gizlilik Politikası' }}
      />
      <Stack.Screen
        name="Report"
        component={ReportScreen}
        options={{
          title: 'Şikayet Et',
          presentation: 'modal',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="AnalyticsDashboard"
        component={AnalyticsDashboardScreen}
        options={{ title: 'Detaylı Analitik' }}
      />
      <Stack.Screen
        name="Compare"
        component={CompareScreen}
        options={{ title: 'Karşılaştır' }}
      />
      <Stack.Screen
        name="TrialRequests"
        component={TrialRequestsScreen}
        options={{ title: 'Tanışma Talepleri' }}
      />
      <Stack.Screen
        name="Reminders"
        component={RemindersScreen}
        options={{ title: 'Hatırlatıcılarım' }}
      />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
  },
});
