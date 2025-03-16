
/**
 * Authentication utilities for managing tokens
 */
export const authUtils = {
  /**
   * Get the authentication token from localStorage
   */
  getToken: (): string | null => {
    return localStorage.getItem('token');
  },

  /**
   * Set the authentication token in localStorage
   */
  setToken: (token: string): void => {
    localStorage.setItem('token', token);
  },

  /**
   * Remove the authentication token from localStorage
   */
  removeToken: (): void => {
    localStorage.removeItem('token');
  },

  /**
   * Check if the user is authenticated
   */
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('token');
  }
};
