
import { isWeb } from './platform';
import { apiService } from '../services/apiService';

/**
 * Platform-agnostic storage implementation
 * Using MongoDB via API when available, with localStorage fallback
 */
class StorageService {
  async getItem(key: string): Promise<string | null> {
    try {
      // Try MongoDB API first
      const response = await apiService.getStorageItem(key);
      if (!response.error && response.data?.value) {
        return response.data.value;
      }
      
      // Fallback to localStorage if API fails
      console.log('MongoDB API unavailable, using localStorage fallback');
      return localStorage.getItem(key);
    } catch (error) {
      console.error('Storage error in getItem:', error);
      
      // Final fallback to localStorage
      try {
        return localStorage.getItem(key);
      } catch (localError) {
        console.error('localStorage fallback failed:', localError);
        return null;
      }
    }
  }

  async setItem(key: string, value: string): Promise<void> {
    try {
      // Try MongoDB API first
      const response = await apiService.setStorageItem(key, value);
      
      // Always set in localStorage as fallback
      localStorage.setItem(key, value);
      
      if (response.error) {
        console.log('MongoDB API error, using localStorage only');
      }
    } catch (error) {
      console.error('Storage error in setItem:', error);
      
      // Fallback to localStorage
      try {
        localStorage.setItem(key, value);
      } catch (localError) {
        console.error('localStorage fallback failed:', localError);
      }
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      // Try MongoDB API first
      const response = await apiService.removeStorageItem(key);
      
      // Always remove from localStorage
      localStorage.removeItem(key);
      
      if (response.error) {
        console.log('MongoDB API error, using localStorage only');
      }
    } catch (error) {
      console.error('Storage error in removeItem:', error);
      
      // Fallback to localStorage
      try {
        localStorage.removeItem(key);
      } catch (localError) {
        console.error('localStorage fallback failed:', localError);
      }
    }
  }
}

export const storage = new StorageService();
