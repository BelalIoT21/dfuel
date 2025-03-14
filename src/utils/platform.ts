
/**
 * Utility to check the current platform
 */

// Check if we're in a web environment
export const isWeb = typeof document !== 'undefined';

// Check if we're on a native platform
export const isPlatformNative = () => {
  return !isWeb;
};

// Helper to determine if we're on iOS
export const isIOS = () => {
  if (!isPlatformNative()) return false;
  try {
    // @ts-ignore - Platform is only available in React Native
    const { Platform } = require('react-native');
    return Platform.OS === 'ios';
  } catch (e) {
    return false;
  }
};

// Helper to determine if we're on Android
export const isAndroid = () => {
  if (!isPlatformNative()) return false;
  try {
    // @ts-ignore - Platform is only available in React Native
    const { Platform } = require('react-native');
    return Platform.OS === 'android';
  } catch (e) {
    return false;
  }
};
