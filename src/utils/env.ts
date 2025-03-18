
/**
 * Environment variable management
 */

// Define environment types
export type Environment = 'development' | 'production';

// Get current environment
export const getEnvironment = (): Environment => {
  // Check if we're in production mode
  // This will be set to true in your production build configuration
  const isProd = import.meta.env.PROD || false;
  return isProd ? 'production' : 'development';
};

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

// Get API URL based on environment
export const getApiUrl = (): string => {
  const env = getEnvironment();
  
  // In a production environment, this would use environment variables
  // or a configuration specific to your hosting platform
  if (env === 'production') {
    // Get from environment or use default production URL
    return getEnv('API_URL', 'https://api.your-domain.com/api');
  }
  
  // For development, continue using the existing URLs
  return '';
};

// Check if the app is running in a Capacitor environment
export const isCapacitorEnvironment = (): boolean => {
  return typeof (window as any)?.Capacitor !== 'undefined';
};
