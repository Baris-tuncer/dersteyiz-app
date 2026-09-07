import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../types/navigation';

import WelcomeScreen from '../screens/auth/WelcomeScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import VerificationScreen from '../screens/auth/VerificationScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import ProfileSetupScreen from '../screens/auth/ProfileSetupScreen';

const Stack = createNativeStackNavigator<AuthStackParamList>();

export default function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="Verification" component={VerificationScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="ProfileSetup" component={ProfileSetupScreen} />
    </Stack.Navigator>
  );
}
