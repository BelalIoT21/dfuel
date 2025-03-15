
/**
 * Environment variable management for MongoDB-based configuration
 */

// Default values for environment variables
const ENV_DEFAULTS = {
  MONGODB_URI: 'mongodb://localhost:27017/learnit',
  API_URL: 'http://localhost:4000/api'
};

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
  
  console.log(`Environment variable set: ${key}`);
  
  // In a web environment, we could store this in sessionStorage for the current session
  try {
    sessionStorage.setItem(`env_${key}`, value);
  } catch (error) {
    console.error('Failed to store environment variable:', error);
  }
};

// Get environment variables
export const getEnv = (key: string, defaultValue: string = ''): string => {
  // For predefined values, check our defaults first
  if (key in ENV_DEFAULTS) {
    return ENV_DEFAULTS[key as keyof typeof ENV_DEFAULTS];
  }
  
  // Try to get from session storage
  try {
    const value = sessionStorage.getItem(`env_${key}`);
    if (value) return value;
  } catch (error) {
    console.error('Failed to retrieve environment variable:', error);
  }
  
  return defaultValue;
};

// Check if the app is running in a Capacitor environment
export const isCapacitorEnvironment = (): boolean => {
  return false;
};
