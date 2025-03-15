
import { isWeb } from './platform';

/**
 * Platform-agnostic storage implementation
 * For web environments, MongoDB access is handled through API calls
 * For native environments, we use AsyncStorage for session persistence
 */
class StorageService {
  async getItem(key: string): Promise<string | null> {
    if (isWeb) {
      // In web environment, we use API calls to MongoDB via API instead
      console.log('Web environment - using MongoDB via API');
      try {
        return localStorage.getItem(key);
      } catch (error) {
        console.error('localStorage error in getItem:', error);
        return null;
      }
    } else {
      try {
        // Native environment - use AsyncStorage
        const AsyncStorage = this.getNativeStorage();
        if (AsyncStorage) {
          return await AsyncStorage.getItem(key);
        }
        return null;
      } catch (error) {
        console.error('AsyncStorage error in getItem:', error);
        return null;
      }
    }
  }

  async setItem(key: string, value: string): Promise<void> {
    if (isWeb) {
      // In web environment, use localStorage as fallback
      console.log('Web environment - using MongoDB via API');
      try {
        localStorage.setItem(key, value);
      } catch (error) {
        console.error('localStorage error in setItem:', error);
      }
    } else {
      try {
        const AsyncStorage = this.getNativeStorage();
        if (AsyncStorage) {
          await AsyncStorage.setItem(key, value);
        }
      } catch (error) {
        console.error('AsyncStorage error in setItem:', error);
      }
    }
  }

  async removeItem(key: string): Promise<void> {
    if (isWeb) {
      // In web environment, use localStorage as fallback
      console.log('Web environment - using MongoDB via API');
      try {
        localStorage.removeItem(key);
      } catch (error) {
        console.error('localStorage error in removeItem:', error);
      }
    } else {
      try {
        const AsyncStorage = this.getNativeStorage();
        if (AsyncStorage) {
          await AsyncStorage.removeItem(key);
        }
      } catch (error) {
        console.error('AsyncStorage error in removeItem:', error);
      }
    }
  }

  // Helper method to safely get AsyncStorage without build-time issues
  private getNativeStorage(): any {
    if (typeof global !== 'undefined' && global.require) {
      try {
        return global.require('@react-native-async-storage/async-storage');
      } catch (e) {
        console.warn('AsyncStorage not available:', e);
        return null;
      }
    }
    return null;
  }
}

export const storage = new StorageService();
