
// Platform detection utility

// Check if running in a browser environment
export const isBrowser = typeof window !== "undefined";

// Basic check for native platforms
export const isNative = false; // Simplified since we're targeting web

// For web usage, we'll just define isWeb as true
export const isWeb = true;

// Helper function to detect iOS
export function isIOS() {
  if (!isBrowser) return false;
  
  const userAgent = window.navigator.userAgent.toLowerCase();
  return /iphone|ipad|ipod/.test(userAgent);
}

// Helper function to detect Android
export function isAndroid() {
  if (!isBrowser) return false;
  
  const userAgent = window.navigator.userAgent.toLowerCase();
  return /android/.test(userAgent);
}

// General mobile detection
export function isMobile() {
  if (!isBrowser) return false;
  
  const userAgent = window.navigator.userAgent.toLowerCase();
  return /iphone|ipad|ipod|android|mobile/.test(userAgent);
}
