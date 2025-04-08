/**
 * Environment variable management
 */

import { isCapacitor } from './platform';

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
  
  // Set API URL from environment variables if available
  // For Vite compatibility, we need to check both VITE_API_URL and API_URL
  // We'll use a server-side environment variable in production
  const apiUrl = import.meta.env.API_URL;
  setEnv('API_URL', apiUrl);
  console.log('API configuration loaded successfully');
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
  return getEnv('API_URL', '');
};

// Check if the app is running on a physical device vs emulator - simplified
export const isPhysicalDevice = (): boolean => {
  // If using Capacitor, assume physical device when not in dev mode
  if (isCapacitor() && getEnvironment() === 'production') {
    return true;
  }
  
  // Default to false for web environment
  return false;
};

// Get all possible API URLs for the current environment and platform
export const getApiEndpoints = (): string[] => {
  const configuredApiUrl = getEnv('API_URL', '');
  
  // Make sure only valid URLs are returned
  return [
    configuredApiUrl,
  ].filter(Boolean); // Remove empty values
};

// Get API URL based on environment
export const getApiUrl = (): string => {
  const env = getEnvironment();
  
  // Get API URL from environment variables
  const apiUrl = getEnv('API_URL', '');
  
  // If no API URL is configured, use a default for development only
  if (!apiUrl && env === 'development') {
    console.warn('No API URL configured. Using default development URL.');
    return 'http://localhost:4000/api';
  }
  
  return apiUrl;
};

// Ensure API endpoint always has correct format
export const formatApiEndpoint = (endpoint: string): string => {
  const apiUrl = getApiUrl();
  
  // If the endpoint already starts with http, assume it's a full URL
  if (endpoint.startsWith('http')) {
    return endpoint;
  }
  
  // If no API URL is configured, use relative path
  if (!apiUrl) {
    return endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
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
