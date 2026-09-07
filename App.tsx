import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider } from './src/contexts/AuthContext';
import { SubscriptionProvider } from './src/contexts/SubscriptionContext';
import ErrorBoundary from './src/components/ErrorBoundary';
import RootNavigator from './src/navigation/RootNavigator';

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <SubscriptionProvider>
          <NavigationContainer>
            <StatusBar style="dark" />
            <RootNavigator />
          </NavigationContainer>
        </SubscriptionProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
