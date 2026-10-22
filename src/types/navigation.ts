import type { NavigatorScreenParams } from '@react-navigation/native';

export type AuthStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
  Verification: { email: string };
  ForgotPassword: undefined;
  ProfileSetup: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Favorites: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  MainTabs: NavigatorScreenParams<MainTabParamList> | undefined;
  TeacherDetail: { teacherId: string };
  EditProfile: undefined;
  Settings: undefined;
  AdminPanel: undefined;
  AdminUserDetail: { userId: string };
  Notifications: undefined;
  Paywall: undefined;
  KVKK: undefined;
  Terms: undefined;
  Privacy: undefined;
  Report: { teacherId: string };
  AnalyticsDashboard: undefined;
  Compare: undefined;
  TrialRequests: undefined;
  Reminders: undefined;
};
