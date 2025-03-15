
import { isWeb } from './platform';

/**
 * Platform-agnostic storage implementation
 * For web environments, MongoDB access is handled through API calls
 */
class StorageService {
  async getItem(key: string): Promise<string | null> {
    console.log('Web environment - using MongoDB via API');
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.error('localStorage error in getItem:', error);
      return null;
    }
  }

  async setItem(key: string, value: string): Promise<void> {
    console.log('Web environment - using MongoDB via API');
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.error('localStorage error in setItem:', error);
    }
  }

  async removeItem(key: string): Promise<void> {
    console.log('Web environment - using MongoDB via API');
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('localStorage error in removeItem:', error);
    }
  }
}

export const storage = new StorageService();
