
/**
 * Environment variable management for client-side configuration
 */

// Default values for environment variables
const ENV_DEFAULTS = {
  // Use localhost:4000/api as the default API URL when in development
  API_URL: 'http://localhost:4000/api',
  // Keep MongoDB URI for reference only in client
  MONGODB_URI: 'mongodb://localhost:27017/learnit'
};

// Load environment variables into the application
export const loadEnv = (): void => {
  console.log('Environment variables loaded');
  console.log('API URL:', getEnv('API_URL'));
};

// Set environment variables with validation
export const setEnv = (key: string, value: string): void => {
  if (!key) {
    console.error('Cannot set environment variable with empty key');
    return;
  }
  
  console.log(`Environment variable set: ${key} = ${value}`);
  
  // In a web environment, we store this in sessionStorage for the current session
  try {
    sessionStorage.setItem(`env_${key}`, value);
  } catch (error) {
    console.error('Failed to store environment variable:', error);
  }
};

// Get environment variables
export const getEnv = (key: string, defaultValue: string = ''): string => {
  // First try from session storage
  try {
    const value = sessionStorage.getItem(`env_${key}`);
    if (value) return value;
  } catch (error) {
    console.error('Failed to retrieve environment variable from session storage:', error);
  }
  
  // Then check our defaults
  if (key in ENV_DEFAULTS) {
    return ENV_DEFAULTS[key as keyof typeof ENV_DEFAULTS];
  }
  
  // If no value was found, return the provided default
  return defaultValue;
};

// Check if the app is running in a Capacitor environment
export const isCapacitorEnvironment = (): boolean => {
  return false;
};
