
import { isWeb } from './platform';

/**
 * Platform-agnostic storage implementation
 * For web, we explicitly block all localStorage usage except token since we're using MongoDB exclusively
 * For native environments, we still use AsyncStorage for session persistence
 */
class StorageService {
  async getItem(key: string): Promise<string | null> {
    if (isWeb) {
      // Only allow token storage in localStorage for web
      if (key === 'token') {
        try {
          return localStorage.getItem(key);
        } catch (error) {
          console.error('localStorage error in getItem:', error);
          return null;
        }
      }
      console.log('Web environment - MongoDB only, localStorage access blocked for:', key);
      return null;
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
      // Only allow token storage in localStorage for web
      if (key === 'token') {
        try {
          localStorage.setItem(key, value);
        } catch (error) {
          console.error('localStorage error in setItem:', error);
        }
        return;
      }
      console.log('Web environment - MongoDB only, localStorage access blocked for:', key);
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
      // Only allow token removal from localStorage for web
      if (key === 'token') {
        try {
          localStorage.removeItem(key);
        } catch (error) {
          console.error('localStorage error in removeItem:', error);
        }
        return;
      }
      console.log('Web environment - MongoDB only, localStorage access blocked for:', key);
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
