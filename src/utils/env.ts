/// <reference types="vite/client" />

/**
 * Environment variable management
 */

import { isCapacitor } from './platform';

// Define environment types
export type Environment = 'development' | 'production';

// Cache for environment variables
let envCache: Record<string, string> = {};

// Get current environment
export const getEnvironment = (): Environment => {
  return import.meta.env.PROD ? 'production' : 'development';
};

// Initialize environment configuration
export const loadEnv = (): void => {
  console.log('Initializing environment configuration...');
  
  // Initialize the environment cache with only public variables
  envCache = {
    API_URL: import.meta.env.VITE_API_URL || '',
  };
  
  // Load any additional public env vars from Vite
  Object.entries(import.meta.env).forEach(([key, value]) => {
    if (key.startsWith('VITE_') && typeof value === 'string') {
      envCache[key.replace('VITE_', '')] = value;
    }
  });
  
  console.log('Environment configuration initialized');
};

// Set environment variables
export const setEnv = (key: string, value: string): void => {
  if (!key) throw new Error('Environment variable key cannot be empty');
  envCache[key] = value;
};

// Get environment variables
export const getEnv = (key: string): string => {
  // Special case for CUSTOM_SERVER_IP
  if (key === 'CUSTOM_SERVER_IP') {
    const apiUrl = getEnv('API_URL');
    try {
      return new URL(apiUrl).hostname;
    } catch {
      return 'localhost';
    }
  }
  
  // First try the cache
  if (envCache[key] !== undefined) {
    return envCache[key];
  }
  
  // Then try Vite env vars
  const viteKey = `VITE_${key}`;
  if (import.meta.env[viteKey] !== undefined) {
    const value = import.meta.env[viteKey];
    if (typeof value === 'string') {
      envCache[key] = value;
      return value;
    }
  }
  
  throw new Error(`Environment variable ${key} not found`);
};

// Get API URL
export const getApiUrl = (): string => {
  return getEnv('API_URL');
};

// Get all configured API endpoints
export const getApiEndpoints = (): string[] => {
  const apiUrl = getApiUrl();
  return [apiUrl];
};

// Format API endpoint
export const formatApiEndpoint = (endpoint: string): string => {
  const apiUrl = getApiUrl();
  
  if (endpoint.startsWith('http')) {
    try {
      new URL(endpoint);
      return endpoint;
    } catch {
      throw new Error('Invalid absolute endpoint URL');
    }
  }
  
  // Remove leading slash if present
  const cleanEndpoint = endpoint.startsWith('/') 
    ? endpoint.substring(1) 
    : endpoint;
  
  // Ensure API URL ends with slash
  const formattedApiUrl = apiUrl.endsWith('/') 
    ? apiUrl 
    : `${apiUrl}/`;
  
  return `${formattedApiUrl}${cleanEndpoint}`;
};

// Get local server IP
export const getLocalServerIP = (): string => {
  return getEnv('CUSTOM_SERVER_IP');
};

// Device detection
export const isPhysicalDevice = (): boolean => {
  return isCapacitor() && getEnvironment() === 'production';
};

// Capacitor environment check
export const isCapacitorEnvironment = (): boolean => {
  return typeof (window as any)?.Capacitor !== 'undefined';
};