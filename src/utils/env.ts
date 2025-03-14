
/**
 * This module simulates an environment variables system.
 * 
 * IMPORTANT: In a real production app, environment variables would be:
 * 1. Stored in .env files on the server
 * 2. Never exposed directly to the client
 * 3. Accessed via secure API endpoints with proper authentication
 * 4. Updated through admin panels that communicate with the backend
 * 
 * This simulation maintains variables in memory and provides utility
 * functions to access and update them as if they were environment variables.
 */

// In-memory store for our simulated environment variables
const ENV_VARS: Record<string, string> = {};

// Initialize with default values (in a real app, these would be loaded from .env)
export const loadEnv = () => {
  // Default admin credentials (only used during initial setup)
  if (!ENV_VARS['ADMIN_EMAIL']) {
    ENV_VARS['ADMIN_EMAIL'] = 'admin@learnit.com';
  }
  
  if (!ENV_VARS['ADMIN_PASSWORD']) {
    ENV_VARS['ADMIN_PASSWORD'] = 'admin123';
  }
};

export const getEnv = (key: string): string => {
  return ENV_VARS[key] || '';
};

export const setEnv = (key: string, value: string): void => {
  ENV_VARS[key] = value;
  
  // In a real app, this would be an API call to update environment variables
  // on the server, possibly with some caching mechanism
  console.log(`Environment variable ${key} updated (simulated)`);
};
