
/**
 * Environment variable management
 */

// Load environment variables into the application
export const loadEnv = (): void => {
  console.log('Environment variables loaded');
  
  // Set default MongoDB URI for both preview and local environments
  setEnv('MONGODB_URI', 'mongodb://localhost:27017/learnit');
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
  if (key === 'MONGODB_URI') {
    return 'mongodb://localhost:27017/learnit'; // Always return the same MongoDB URI
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
