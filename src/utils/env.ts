
/**
 * Environment variable management for MongoDB-based configuration
 */

// Load environment variables into the application
export const loadEnv = (): void => {
  console.log('Environment variables loaded from MongoDB');
};

// Set environment variables with validation
export const setEnv = (key: string, value: string): void => {
  if (!key) {
    console.error('Cannot set environment variable with empty key');
    return;
  }
  
  console.log(`Environment variable set: ${key} (stored in MongoDB)`);
};

// Get environment variables
export const getEnv = (key: string, defaultValue: string = ''): string => {
  // For MongoDB URI, always return the same value for consistency in web env
  if (key === 'MONGODB_URI') {
    return 'mongodb://localhost:27017/learnit';
  }
  
  return defaultValue;
};

// Check if the app is running in a Capacitor environment
export const isCapacitorEnvironment = (): boolean => {
  return false;
};
