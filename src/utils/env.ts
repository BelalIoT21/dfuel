
/**
 * Environment variable management
 */

import { isAndroid, isCapacitor, isIOS } from './platform';

// Define environment types
export type Environment = 'development' | 'production';

// Get current environment
export const getEnvironment = (): Environment => {
  // Check if we're in production mode
  // This will be set to true in your production build configuration
  const isProd = import.meta.env.PROD || false;
  return isProd ? 'production' : 'development';
};

// Load environment variables into the application
export const loadEnv = (): void => {
  // This function is a placeholder for loading environment variables
  console.log('Environment variables loaded');
  
  // Set the default server IP to be consistent across platforms
  setEnv('CUSTOM_SERVER_IP', 'localhost');
  console.log('Server IP set to:', getEnv('CUSTOM_SERVER_IP'));
  
  // Set API URL from environment variables if available
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
  setEnv('API_URL', apiUrl);
  console.log('API URL set to:', apiUrl);
};

// Set environment variables with validation
export const setEnv = (key: string, value: string): void => {
  if (!key) {
    console.error('Cannot set environment variable with empty key');
    return;
  }
  
  if (typeof window !== 'undefined') {
    // Store in window for web environment
    (window as any).__ENV__ = (window as any).__ENV__ || {};
    (window as any).__ENV__[key] = value;
  }
  
  console.log(`Environment variable set: ${key}=${value}`);
};

// Get environment variables
export const getEnv = (key: string, defaultValue: string = ''): string => {
  // Check for API_URL when requesting CUSTOM_SERVER_IP for backward compatibility
  if (key === 'CUSTOM_SERVER_IP') {
    const apiUrl = getEnv('API_URL', '');
    if (apiUrl) {
      try {
        const url = new URL(apiUrl);
        return url.hostname;
      } catch (e) {
        return 'localhost';
      }
    }
    return 'localhost';
  }
  
  if (typeof window !== 'undefined' && (window as any).__ENV__) {
    return (window as any).__ENV__[key] || defaultValue;
  }
  return defaultValue;
};

// Get the local server IP for the device being used
export const getLocalServerIP = (): string => {
  // Use API_URL instead of hardcoded localhost
  return getEnv('API_URL', 'http://localhost:4000/api');
};

// Check if the app is running on a physical device vs emulator
export const isPhysicalDevice = (): boolean => {
  // If using Capacitor, assume physical device when not in dev mode
  if (isCapacitor() && getEnvironment() === 'production') {
    return true;
  }
  
  // Look for emulator indicators in user agent
  if (typeof navigator !== 'undefined' && navigator.userAgent) {
    const ua = navigator.userAgent.toLowerCase();
    if (ua.includes('android') && (ua.includes('emulator') || ua.includes('sdk_gphone'))) {
      return false; // Likely an emulator
    }
  }
  
  // Default to false for web environment
  return false;
};

// Get all possible API URLs for the current environment and platform
export const getApiEndpoints = (): string[] => {
  const configuredApiUrl = getEnv('API_URL', 'http://localhost:4000/api');
  
  return [
    configuredApiUrl,
    `http://127.0.0.1:4000/api`, // Fallback to localhost IP
    '/api' // Relative fallback
  ];
};

// Get API URL based on environment and platform
export const getApiUrl = (): string => {
  const env = getEnvironment();
  
  // In a production environment, get from environment variables
  if (env === 'production') {
    return getEnv('API_URL', 'https://api.your-domain.com/api');
  }
  
  // For development, use the API_URL from env
  return getEnv('API_URL', 'http://localhost:4000/api');
};

// Ensure API endpoint always has correct format
export const formatApiEndpoint = (endpoint: string): string => {
  const apiUrl = getApiUrl();
  
  // If the endpoint already starts with http, assume it's a full URL
  if (endpoint.startsWith('http')) {
    return endpoint;
  }
  
  // Remove leading slash from endpoint if present
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.substring(1) : endpoint;
  
  // Make sure the apiUrl ends with a slash if it doesn't already
  const formattedApiUrl = apiUrl.endsWith('/') ? apiUrl : `${apiUrl}/`;
  
  return `${formattedApiUrl}${cleanEndpoint}`;
};

// Check if the app is running in a Capacitor environment
export const isCapacitorEnvironment = (): boolean => {
  return typeof (window as any)?.Capacitor !== 'undefined';
};
