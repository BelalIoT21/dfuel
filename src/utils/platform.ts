
/**
 * This file provides platform detection utilities
 * to help with conditional rendering and functionality
 */

export const isWeb = typeof window !== 'undefined' && typeof document !== 'undefined';

export const isPlatformNative = (): boolean => {
  if (typeof navigator !== 'undefined') {
    return navigator.product === 'ReactNative';
  }
  return false;
};

export const isIOS = (): boolean => {
  if (!isWeb) {
    return false;
  }
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
};

export const isAndroid = (): boolean => {
  if (!isWeb) {
    return false;
  }
  return /Android/.test(navigator.userAgent);
};

export const isMobile = (): boolean => {
  if (!isWeb) {
    return true; // If not web, assume mobile
  }
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};
