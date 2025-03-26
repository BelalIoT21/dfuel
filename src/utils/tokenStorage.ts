
/**
 * Utility functions for handling JWT tokens in localStorage or sessionStorage
 */

/**
 * Get the authentication token from storage
 * Checks both localStorage and sessionStorage
 */
export const getToken = (): string | null => {
  // Try to get the token from sessionStorage first (used for temporary sessions)
  const sessionToken = sessionStorage.getItem('token');
  if (sessionToken) {
    return sessionToken;
  }
  
  // Fall back to localStorage (used for "remember me" functionality)
  const localToken = localStorage.getItem('token');
  return localToken;
};

/**
 * Save the authentication token to storage
 * @param token The JWT token to save
 * @param remember Whether to use localStorage (true) or sessionStorage (false)
 */
export const saveToken = (token: string, remember: boolean = false): void => {
  if (remember) {
    // For "remember me" functionality, save to localStorage for persistence
    localStorage.setItem('token', token);
  } else {
    // For temporary sessions, save to sessionStorage (cleared when browser is closed)
    sessionStorage.setItem('token', token);
  }
};

/**
 * Remove the token from all storage locations
 */
export const removeToken = (): void => {
  // Clear from both storage types to ensure complete logout
  localStorage.removeItem('token');
  sessionStorage.removeItem('token');
};

/**
 * Check if a token exists in either storage location
 */
export const hasToken = (): boolean => {
  return !!getToken();
};
