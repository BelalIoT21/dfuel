
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

// Export the function directly to check whether the platform is iOS
export const isPlatformIOS = isIOS();

// Export the function directly to check whether the platform is Android
export const isPlatformAndroid = isAndroid();

// Export the function to check whether this is a native platform
export const isPlatformNative = isNative;

// General mobile detection
export function isMobile() {
  if (!isBrowser) return false;
  
  const userAgent = window.navigator.userAgent.toLowerCase();
  return /iphone|ipad|ipod|android|mobile/.test(userAgent);
}

// Check IE browser's compatibility - empty function since we're not targeting IE
export function isIEBrowser() {
  if (!isBrowser) return false;
  
  // Check for IE-specific properties (in real implementation, this would be more complex)
  return false;
}
