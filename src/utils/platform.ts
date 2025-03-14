
/**
 * Utility functions for platform detection
 */

// Determine if the code is running in a web browser or React Native environment
export const isWeb = typeof document !== 'undefined';
export const isNative = !isWeb;

// More reliable platform detection for React Native
export const isPlatformNative = () => {
  try {
    // This will throw an error in web environments
    require('react-native');
    return true;
  } catch (e) {
    return false;
  }
};

// Helper function to run different code based on platform
export const platformSelect = <T>(options: { web?: T; native?: T; default?: T }): T | undefined => {
  if (isWeb && options.web !== undefined) return options.web;
  if (isNative && options.native !== undefined) return options.native;
  return options.default;
};
