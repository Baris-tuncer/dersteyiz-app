import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { AppState } from 'react-native';
import * as Notifications from 'expo-notifications';
import { useAuth } from './AuthContext';
import { navigate } from '../navigation/navigationRef';
import {
  registerForPushNotifications,
  savePushToken,
  updateLastActive,
  getUnreadCount,
} from '../services/notificationService';

interface NotificationContextType {
  unreadCount: number;
  expoPushToken: string | null;
  refreshUnreadCount: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType>({
  unreadCount: 0,
  expoPushToken: null,
  refreshUnreadCount: async () => {},
});

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { state: authState } = useAuth();
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const notificationListener = useRef<Notifications.EventSubscription>();
  const responseListener = useRef<Notifications.EventSubscription>();

  const userId = authState.user?.id;

  // Register push token and load unread count when authenticated
  useEffect(() => {
    if (!userId) {
      setExpoPushToken(null);
      setUnreadCount(0);
      return;
    }

    let cancelled = false;

    async function setup() {
      const token = await registerForPushNotifications();
      if (token && !cancelled) {
        setExpoPushToken(token);
        await savePushToken(userId!, token);
      }

      await updateLastActive(userId!);

      const count = await getUnreadCount(userId!);
      if (!cancelled) setUnreadCount(count);
    }

    setup();
    return () => { cancelled = true; };
  }, [userId]);

  // Track app foregrounding for last_active_at
  useEffect(() => {
    if (!userId) return;
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        updateLastActive(userId);
      }
    });
    return () => sub.remove();
  }, [userId]);

  // Notification listeners
  useEffect(() => {
    notificationListener.current = Notifications.addNotificationReceivedListener(() => {
      setUnreadCount((prev) => prev + 1);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
      // Navigate to NotificationsScreen when user taps push
      navigate('Notifications');
    });

    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, []);

  const refreshUnreadCount = useCallback(async () => {
    if (!userId) return;
    const count = await getUnreadCount(userId);
    setUnreadCount(count);
  }, [userId]);

  return (
    <NotificationContext.Provider value={{ unreadCount, expoPushToken, refreshUnreadCount }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  return useContext(NotificationContext);
}
