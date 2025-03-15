
import { isWeb } from './platform';
import { apiService } from '../services/apiService';

/**
 * Platform-agnostic storage implementation
 * For web environments, MongoDB access is handled through API calls
 */
class StorageService {
  async getItem(key: string): Promise<string | null> {
    console.log('Web environment - using MongoDB via API');
    try {
      // Use API to get data from MongoDB
      const response = await apiService.getStorageItem(key);
      if (response.error) {
        console.error('MongoDB API error in getItem:', response.error);
        return null;
      }
      return response.data?.value || null;
    } catch (error) {
      console.error('MongoDB API error in getItem:', error);
      return null;
    }
  }

  async setItem(key: string, value: string): Promise<void> {
    console.log('Web environment - using MongoDB via API');
    try {
      // Use API to store data in MongoDB
      const response = await apiService.setStorageItem(key, value);
      if (response.error) {
        console.error('MongoDB API error in setItem:', response.error);
      }
    } catch (error) {
      console.error('MongoDB API error in setItem:', error);
    }
  }

  async removeItem(key: string): Promise<void> {
    console.log('Web environment - using MongoDB via API');
    try {
      // Use API to remove data from MongoDB
      const response = await apiService.removeStorageItem(key);
      if (response.error) {
        console.error('MongoDB API error in removeItem:', response.error);
      }
    } catch (error) {
      console.error('MongoDB API error in removeItem:', error);
    }
  }
}

export const storage = new StorageService();
