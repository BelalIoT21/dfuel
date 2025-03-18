
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
  // In a real application, this would load variables from various sources
  console.log('Environment variables loaded');
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
  
  console.log(`Environment variable set: ${key}`);
};

// Get environment variables
export const getEnv = (key: string, defaultValue: string = ''): string => {
  if (typeof window !== 'undefined' && (window as any).__ENV__) {
    return (window as any).__ENV__[key] || defaultValue;
  }
  return defaultValue;
};

// Get the local server IP for the device being used
export const getLocalServerIP = (): string => {
  // For Android emulator
  if (isAndroid() && !isPhysicalDevice()) {
    return '10.0.2.2'; // Special IP for Android emulator
  }
  
  // For Android physical device or iOS
  // User might need to set this manually based on their network
  const customIP = getEnv('CUSTOM_SERVER_IP', '');
  if (customIP) {
    console.log(`Using custom server IP: ${customIP}`);
    return customIP;
  }
  
  return 'localhost'; // Default fallback
};

// Check if the app is running on a physical device vs emulator
// This is a best-guess approach and might need refinement
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
  const serverIP = getLocalServerIP();
  console.log(`Using server IP for endpoints: ${serverIP}`);
  
  // For Android emulator or physical device
  if (isAndroid() || isCapacitor()) {
    return [
      `http://${serverIP}:4000/api`,
      `http://${serverIP}:8080/api`, // Try alternate port
      '/api' // Relative fallback
    ];
  }
  
  // For iOS
  if (isIOS()) {
    return [
      `http://${serverIP}:4000/api`,
      '/api' // Relative fallback
    ];
  }
  
  // For web development
  return [
    'http://localhost:4000/api',
    '/api' // Relative fallback
  ];
};

// Get API URL based on environment and platform
export const getApiUrl = (): string => {
  const env = getEnvironment();
  
  // In a production environment, this would use environment variables
  // or a configuration specific to your hosting platform
  if (env === 'production') {
    // Get from environment or use default production URL
    return getEnv('API_URL', 'https://api.your-domain.com/api');
  }
  
  // For development, get the first endpoint from the list
  const endpoints = getApiEndpoints();
  console.log('Available API endpoints:', endpoints);
  return endpoints[0];
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
