
/**
 * Utility functions for API connectivity
 */

/**
 * Check if the server is accessible
 * @param url The server URL to check
 * @returns Promise resolving to true if server is accessible, false otherwise
 */
export const isServerAccessible = async (url: string): Promise<boolean> => {
  try {
    // Make a simple HEAD request to check if server responds
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
    
    const response = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal,
      mode: 'cors',
      cache: 'no-cache',
    });
    
    clearTimeout(timeoutId);
    return response.ok;
  } catch (error) {
    console.error('Server accessibility check failed:', error);
    return false;
  }
};

/**
 * Get the API base URL
 * @returns The base URL for API requests
 */
export const getApiBaseUrl = (): string => {
  // For local development, always use localhost:4000
  if (window.location.hostname === 'localhost') {
    return 'http://localhost:4000/api';
  }
  
  // For deployed environments, try to use the same origin if available
  return `${window.location.origin}/api`;
};

/**
 * Get detailed server connection information for debugging
 */
export const getServerConnectionInfo = (): Record<string, string> => {
  return {
    origin: window.location.origin,
    apiUrl: getApiBaseUrl(),
    browser: navigator.userAgent,
    protocol: window.location.protocol,
    timestamp: new Date().toISOString(),
  };
};
