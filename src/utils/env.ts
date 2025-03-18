
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
  // Use localhost:4000 for all platforms for consistency
  if (key === 'CUSTOM_SERVER_IP') {
    return 'localhost';
  }
  
  if (typeof window !== 'undefined' && (window as any).__ENV__) {
    return (window as any).__ENV__[key] || defaultValue;
  }
  return defaultValue;
};

// Get the local server IP for the device being used
export const getLocalServerIP = (): string => {
  // Always return localhost for consistency
  return 'localhost';
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
  // Use consistent localhost:4000 endpoints for all platforms
  return [
    `http://localhost:4000/api`,
    `http://127.0.0.1:4000/api`,
    '/api' // Relative fallback
  ];
};

// Get API URL based on environment and platform
export const getApiUrl = (): string => {
  const env = getEnvironment();
  
  // In a production environment, this would use environment variables
  if (env === 'production') {
    return getEnv('API_URL', 'https://api.your-domain.com/api');
  }
  
  // For development, always use localhost:4000
  return 'http://localhost:4000/api';
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
