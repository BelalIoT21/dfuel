
/**
 * This module simulates an environment variables system.
 * In a real production app with proper backend, environment variables would be 
 * stored in .env files and accessed via process.env on the server.
 * 
 * For this demo, we're simulating a system that allows admin credential updates
 * which would typically be handled differently in a real production app.
 */

// In-memory store for our "environment variables"
const ENV_VARS: Record<string, string> = {};

// Initialize with default values - in a real app, this would be loaded from .env
export const loadEnv = () => {
  // Default admin credentials (only used if not already initialized)
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
};
