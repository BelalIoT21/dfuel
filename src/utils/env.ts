
/**
 * Utility for loading environment variables
 */

// Function to load environment variables
export const loadEnv = () => {
  // In a real app, you might want to load environment variables from a .env file
  // or from process.env (on Node.js) or from Expo's Constants.manifest.extra
  
  // For now, we'll just return a static configuration
  return {
    API_URL: 'http://localhost:4000',
    APP_ENV: process.env.NODE_ENV || 'development',
  };
};

// Get a specific environment variable
export const getEnv = (key: string): string | undefined => {
  const env = loadEnv();
  return env[key];
};
