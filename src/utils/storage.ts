
import { isWeb } from './platform';

/**
 * Platform-agnostic storage implementation
 * For web, we now allow localStorage usage for auth persistence
 * For native environments, we still use AsyncStorage for session persistence
 */
class StorageService {
  async getItem(key: string): Promise<string | null> {
    if (isWeb) {
      try {
        return localStorage.getItem(key);
      } catch (error) {
        console.error('localStorage error in getItem:', error);
        return null;
      }
    } else {
      try {
        // Use a safer approach to access AsyncStorage in native environments
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

  /**
   * Clear all localStorage items except the token
   */
  async clearExceptToken(): Promise<void> {
    if (isWeb) {
      try {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('learnit_user');
        localStorage.clear();
        if (token) {
          localStorage.setItem('token', token);
        }
        if (userData) {
          localStorage.setItem('learnit_user', userData);
        }
        console.log('Cleared all localStorage data except auth data');
      } catch (error) {
        console.error('Error clearing localStorage:', error);
      }
    } else {
      try {
        const AsyncStorage = this.getNativeStorage();
        if (AsyncStorage) {
          const token = await AsyncStorage.getItem('token');
          const userData = await AsyncStorage.getItem('learnit_user');
          // In a real implementation, we would need to get all keys and remove them except auth data
          const allKeys = await AsyncStorage.getAllKeys();
          const keysToRemove = allKeys.filter(key => key !== 'token' && key !== 'learnit_user');
          await AsyncStorage.multiRemove(keysToRemove);
          
          // Make sure auth data is preserved
          if (token) await AsyncStorage.setItem('token', token);
          if (userData) await AsyncStorage.setItem('learnit_user', userData);
        }
      } catch (error) {
        console.error('Error clearing AsyncStorage:', error);
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
