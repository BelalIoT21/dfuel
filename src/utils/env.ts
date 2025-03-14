
/**
 * Environment variable management
 */

// Load environment variables into the application
export const loadEnv = (): void => {
  // This function is a placeholder for loading environment variables
  // In a real application, this would load variables from various sources
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
  if (typeof window !== 'undefined' && (window as any).__ENV__) {
    return (window as any).__ENV__[key] || defaultValue;
  }
  return defaultValue;
};
