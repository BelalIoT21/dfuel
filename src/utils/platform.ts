
/**
 * This file provides platform detection utilities
 * to help with conditional rendering and functionality
 */

export const isWeb = () => typeof window !== 'undefined' && typeof document !== 'undefined';

export const isPlatformNative = (): boolean => {
  if (typeof navigator !== 'undefined') {
    return navigator.product === 'ReactNative' || 
           (isWeb() && (isIOS() || isAndroid())) || 
           typeof (window as any).Capacitor !== 'undefined';
  }
  return false;
};

export const isIOS = (): boolean => {
  if (!isWeb()) {
    return false;
  }
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream || 
         (typeof (window as any).Capacitor !== 'undefined' && (window as any).Capacitor.getPlatform() === 'ios');
};

export const isAndroid = (): boolean => {
  if (!isWeb()) {
    return false;
  }
  return /Android/.test(navigator.userAgent) || 
         (typeof (window as any).Capacitor !== 'undefined' && (window as any).Capacitor.getPlatform() === 'android');
};

export const isMobile = (): boolean => {
  if (!isWeb()) {
    return true; // If not web, assume mobile
  }
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
         typeof (window as any).Capacitor !== 'undefined';
};

/**
 * Check if app is running in Capacitor container
 */
export const isCapacitor = (): boolean => {
  return typeof (window as any).Capacitor !== 'undefined';
};
