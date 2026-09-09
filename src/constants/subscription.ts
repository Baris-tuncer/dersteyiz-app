import { Platform } from 'react-native';

export const REVENUECAT_API_KEY = Platform.select({
  ios: 'appl_HDgroIpcrxMzxNJBDBrHklZxHxU',
  android: 'goog_lNzUYOHCYWNGDANdFDSPNBVDAtV',
  default: '',
});

export const ENTITLEMENT_ID = 'Dersteyiz Pro';
export const SUBSCRIPTION_SKU = 'com.dersteyiz.app.premium.monthly';
export const MONTHLY_PRICE = '₺299';
export const FREE_TRIAL_DAYS = 90;
