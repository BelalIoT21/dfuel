
import { isWeb } from './platform';

/**
 * Platform-agnostic storage implementation
 * Uses localStorage for web and AsyncStorage for native
 */
class StorageService {
  async getItem(key: string): Promise<string | null> {
    if (isWeb) {
      return localStorage.getItem(key);
    } else {
      try {
        // Use a safer approach to access AsyncStorage in native environments
        // This avoids build issues with static analyzers
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
      localStorage.setItem(key, value);
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
      localStorage.removeItem(key);
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
    // This approach prevents bundlers from trying to resolve the import at build time
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
