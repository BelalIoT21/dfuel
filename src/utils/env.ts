/**
 * Environment variable management for client-side configuration
 */

// Default values for environment variables
const ENV_DEFAULTS = {
  // Updated default API URL to use localhost since render.com URL is not working
  API_URL: 'http://localhost:4000/api',
  // Keep MongoDB URI for reference only in client
  MONGODB_URI: 'mongodb://localhost:27017/learnit'
};

// Load environment variables into the application
export const loadEnv = (): void => {
  // Ensure we're using the correct API URL on initialization
  // Clear any invalid API URLs that might be stored
  try {
    const storedApiUrl = sessionStorage.getItem('env_API_URL');
    if (storedApiUrl && (storedApiUrl.startsWith('mongodb://') || !storedApiUrl.includes('http'))) {
      console.error('Invalid API URL detected in storage, resetting to default');
      sessionStorage.removeItem('env_API_URL');
    }
  } catch (error) {
    console.error('Error checking stored API URL:', error);
  }

  console.log('Environment variables loaded');
  console.log('API URL:', getEnv('API_URL'));
};

// Set environment variables with validation
export const setEnv = (key: string, value: string): void => {
  if (!key) {
    console.error('Cannot set environment variable with empty key');
    return;
  }
  
  // Validate API_URL specifically to prevent invalid URLs
  if (key === 'API_URL') {
    if (!value.startsWith('http')) {
      console.error('Invalid API URL format. API URL must start with http:// or https://');
      return;
    }
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
    if (value) {
      // For API_URL, validate the format
      if (key === 'API_URL' && (value.startsWith('mongodb://') || !value.includes('http'))) {
        console.warn('Invalid API URL format detected, using default instead');
        sessionStorage.removeItem(`env_${key}`);
        return ENV_DEFAULTS[key as keyof typeof ENV_DEFAULTS] || defaultValue;
      }
      return value;
    }
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
