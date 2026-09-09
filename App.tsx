import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider } from './src/contexts/AuthContext';
import { SubscriptionProvider } from './src/contexts/SubscriptionContext';
import { NotificationProvider } from './src/contexts/NotificationContext';
import { navigationRef } from './src/navigation/navigationRef';
import ErrorBoundary from './src/components/ErrorBoundary';
import RootNavigator from './src/navigation/RootNavigator';

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <NotificationProvider>
          <SubscriptionProvider>
            <NavigationContainer ref={navigationRef}>
              <StatusBar style="dark" />
              <RootNavigator />
            </NavigationContainer>
          </SubscriptionProvider>
        </NotificationProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
