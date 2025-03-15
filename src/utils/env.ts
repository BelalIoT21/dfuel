
/**
 * Environment variable management
 */

// Load environment variables into the application
export const loadEnv = (): void => {
  console.log('Environment variables loaded');
};

// Get environment variables with fallback
export const getEnv = (key: string, defaultValue: string = ''): string => {
  // For MongoDB URI, use environment variable or fallback
  if (key === 'MONGODB_URI') {
    const envValue = process.env.MONGODB_URI || 'mongodb://localhost:27017/learnit';
    return envValue;
  }
  
  // For other variables use process.env or default value
  const envValue = process.env[key];
  return envValue || defaultValue;
};

// Check if the app is running in a Capacitor environment
export const isCapacitorEnvironment = (): boolean => {
  return false;
};
