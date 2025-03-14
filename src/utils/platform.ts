
// This file contains platform-specific utilities and checks

// Check if we're running in a web environment
export const isWeb = typeof document !== 'undefined';

// Check if we're running in a React Native environment
export function isPlatformNative() {
  return !isWeb && typeof global.nativeCallSyncHook !== 'undefined';
}

// Log platform detection on import
console.log('Platform detection initialized', { isWeb, isNative: isPlatformNative() });
