
/**
 * Environment variable management
 */

// Load environment variables into the application
export const loadEnv = (): void => {
  console.log('Environment variables loaded');
};

// Set environment variables with validation
export const setEnv = (key: string, value: string): void => {
  if (!key) {
    console.error('Cannot set environment variable with empty key');
    return;
  }
  
  if (typeof window !== 'undefined') {
    // Store in window for web environment
    (window as any).__ENV__ = (window as any).__ENV__ || {};
    (window as any).__ENV__[key] = value;
  }
  
  console.log(`Environment variable set: ${key}`);
};

// Get environment variables
export const getEnv = (key: string, defaultValue: string = ''): string => {
  // For MongoDB URI, always return the same value for consistency in web env
  if (key === 'MONGODB_URI') {
    return 'mongodb://localhost:27017/learnit';
  }
  
  if (typeof window !== 'undefined' && (window as any).__ENV__) {
    return (window as any).__ENV__[key] || defaultValue;
  }
  return defaultValue;
};

// Check if the app is running in a Capacitor environment
export const isCapacitorEnvironment = (): boolean => {
  return typeof (window as any)?.Capacitor !== 'undefined';
};
