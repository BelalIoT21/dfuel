
/**
 * Authentication utility functions for handling tokens
 */

export const authUtils = {
  /**
   * Gets the authentication token from localStorage
   */
  getToken(): string | null {
    return localStorage.getItem('token');
  },
  
  /**
   * Sets the authentication token in localStorage
   */
  setToken(token: string | null): void {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  },
  
  /**
   * Removes the authentication token from localStorage
   */
  removeToken(): void {
    localStorage.removeItem('token');
  },
  
  /**
   * Checks if the user is authenticated (has a token)
   */
  isAuthenticated(): boolean {
    return !!this.getToken();
  }
};
