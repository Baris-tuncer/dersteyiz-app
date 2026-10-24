import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { Platform, Alert } from 'react-native';
import { useAuth } from './AuthContext';
import { supabase } from '../config/supabase';
import { REVENUECAT_API_KEY, ENTITLEMENT_ID, MONTHLY_PRICE } from '../constants/subscription';

interface SubscriptionState {
  isLoading: boolean;
  isPremium: boolean;
  productPrice: string;
}

interface SubscriptionContextType {
  state: SubscriptionState;
  purchaseSubscription: () => Promise<void>;
  restorePurchases: () => Promise<void>;
  checkSubscription: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | null>(null);

// Lazy-load RevenueCat (not available in Expo Go)
let Purchases: typeof import('react-native-purchases').default | null = null;

async function loadPurchases() {
  if (Purchases) return Purchases;
  try {
    const mod = await import('react-native-purchases');
    Purchases = mod.default;
    return Purchases;
  } catch {
    return null;
  }
}

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const { state: authState } = useAuth();
  const [state, setState] = useState<SubscriptionState>({
    isLoading: true,
    isPremium: false,
    productPrice: MONTHLY_PRICE,
  });

  const checkSubscription = useCallback(async () => {
    const rc = await loadPurchases();
    if (!rc) {
      setState((s) => ({ ...s, isLoading: false }));
      return;
    }

    try {
      const info = await rc.getCustomerInfo();
      const isPremium = !!info.entitlements.active[ENTITLEMENT_ID];
      setState((s) => ({ ...s, isLoading: false, isPremium }));

      // Sync subscription status to database
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('teachers')
          .update({ subscription_status: isPremium })
          .eq('profile_id', user.id);
      }
    } catch {
      setState((s) => ({ ...s, isLoading: false }));
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      if (!authState.user) {
        setState((s) => ({ ...s, isLoading: false, isPremium: false }));
        return;
      }

      const rc = await loadPurchases();
      if (!rc || cancelled) {
        setState((s) => ({ ...s, isLoading: false }));
        return;
      }

      try {
        const apiKey = REVENUECAT_API_KEY;
        if (!apiKey || apiKey.includes('XXXXXXXXX')) {
          // RevenueCat not configured yet
          setState((s) => ({ ...s, isLoading: false }));
          return;
        }

        if (Platform.OS !== 'web') {
          await rc.configure({ apiKey });
          await rc.logIn(authState.user.id);
        }

        if (!cancelled) {
          await checkSubscription();
        }
      } catch {
        if (!cancelled) {
          setState((s) => ({ ...s, isLoading: false }));
        }
      }
    }

    init();
    return () => { cancelled = true; };
  }, [authState.user, checkSubscription]);

  const purchaseSubscription = useCallback(async () => {
    const rc = await loadPurchases();
    if (!rc) {
      Alert.alert('Hata', 'Satın alma servisi şu anda kullanılamıyor. Lütfen daha sonra tekrar deneyin.');
      return;
    }

    try {
      // Ensure RevenueCat is configured before purchase
      const apiKey = REVENUECAT_API_KEY;
      if (apiKey && !apiKey.includes('XXXXXXXXX') && Platform.OS !== 'web') {
        try {
          await rc.configure({ apiKey });
        } catch {
          // Already configured, ignore
        }
      }

      const offerings = await rc.getOfferings();
      const pkg = offerings.current?.availablePackages?.[0];
      if (!pkg) {
        Alert.alert(
          'Abonelik Bulunamadı',
          'Abonelik paketi yüklenemedi. Lütfen internet bağlantınızı kontrol edip tekrar deneyin.',
        );
        return;
      }

      await rc.purchasePackage(pkg);
      await checkSubscription();
    } catch (e: any) {
      if (!e.userCancelled) {
        const msg = e?.message || 'Bilinmeyen hata';
        Alert.alert('Satın Alma Hatası', `İşlem tamamlanamadı: ${msg}`);
      }
    }
  }, [checkSubscription]);

  const restorePurchases = useCallback(async () => {
    const rc = await loadPurchases();
    if (!rc) {
      Alert.alert('Hata', 'Satın alma servisi şu anda kullanılamıyor.');
      return;
    }

    try {
      await rc.restorePurchases();
      await checkSubscription();
      Alert.alert('Başarılı', 'Satın alımlarınız geri yüklendi.');
    } catch {
      Alert.alert('Hata', 'Geri yükleme işlemi başarısız oldu.');
    }
  }, [checkSubscription]);

  const value = useMemo<SubscriptionContextType>(() => ({
    state,
    purchaseSubscription,
    restorePurchases,
    checkSubscription,
  }), [state, purchaseSubscription, restorePurchases, checkSubscription]);

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription(): SubscriptionContextType {
  const ctx = useContext(SubscriptionContext);
  if (!ctx) throw new Error('useSubscription must be used within SubscriptionProvider');
  return ctx;
}
