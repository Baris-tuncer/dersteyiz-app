import { Platform } from 'react-native';

export const REVENUECAT_API_KEY = Platform.select({
  ios: 'appl_XXXXXXXXX',     // RevenueCat iOS API key
  android: 'goog_XXXXXXXXX', // RevenueCat Android API key
  default: '',
});

export const ENTITLEMENT_ID = 'premium';
export const SUBSCRIPTION_SKU = 'com.dersteyiz.app.premium.monthly';
export const MONTHLY_PRICE = '₺399';
