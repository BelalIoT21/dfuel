
/**
 * Environment variable management with fallback to localStorage
 */

// Load environment variables into the application
export const loadEnv = (): void => {
  console.log('Environment variables loaded');
};

// Set environment variables with validation and fallback to localStorage
export const setEnv = (key: string, value: string): void => {
  if (!key) {
    console.error('Cannot set environment variable with empty key');
    return;
  }
  
  try {
    // Always store in localStorage as fallback
    localStorage.setItem(`env_${key}`, value);
    console.log(`Environment variable set: ${key}`);
  } catch (error) {
    console.error(`Failed to set environment variable ${key}:`, error);
  }
};

// Get environment variables with fallback to localStorage
export const getEnv = (key: string, defaultValue: string = ''): string => {
  // For MongoDB URI, use environment variable or fallback
  if (key === 'MONGODB_URI') {
    try {
      const storedValue = localStorage.getItem(`env_${key}`);
      return storedValue || 'mongodb://localhost:27017/learnit';
    } catch (error) {
      return 'mongodb://localhost:27017/learnit';
    }
  }
  
  // For other variables, try localStorage
  try {
    const storedValue = localStorage.getItem(`env_${key}`);
    return storedValue || defaultValue;
  } catch (error) {
    return defaultValue;
  }
};

// Check if the app is running in a Capacitor environment
export const isCapacitorEnvironment = (): boolean => {
  return false;
};
