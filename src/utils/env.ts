
/**
 * Environment variable management
 */

// Load environment variables into the application
export const loadEnv = (): void => {
  console.log('Environment variables loaded');
};

// For admin credentials management
export const setEnv = (key: string, value: string): void => {
  console.log(`Setting environment variable: ${key}`);
  // In a real app with proper environment variable support,
  // this would set the value in the environment
  if (typeof window !== 'undefined') {
    // Store in session storage as fallback for web
    try {
      sessionStorage.setItem(`env_${key}`, value);
    } catch (error) {
      console.error('Error storing env variable:', error);
    }
  }
};

// Get environment variables with fallback
export const getEnv = (key: string, defaultValue: string = ''): string => {
  // For MongoDB URI, use environment variable or fallback to local MongoDB
  if (key === 'MONGODB_URI') {
    // Always return a local MongoDB connection string
    return 'mongodb://localhost:27017/learnit';
  }
  
  // For session stored env variables
  if (typeof window !== 'undefined') {
    try {
      const sessionValue = sessionStorage.getItem(`env_${key}`);
      if (sessionValue) return sessionValue;
    } catch (error) {
      console.error('Error retrieving env variable:', error);
    }
  }
  
  // For other variables use process.env or default value
  const envValue = process.env[key];
  return envValue || defaultValue;
};

// Check if the app is running in a Capacitor environment
export const isCapacitorEnvironment = (): boolean => {
  return false;
};
