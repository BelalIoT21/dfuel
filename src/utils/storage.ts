
/**
 * Platform-agnostic storage implementation that uses AsyncStorage for native environments
 * For web, we rely on API/server-side persistence
 */
import { Platform } from './platform';

class StorageService {
  async getItem(key: string): Promise<string | null> {
    try {
      // Only attempt to use AsyncStorage in non-web environments
      if (Platform.OS !== 'web') {
        // Use a safer approach to access AsyncStorage in native environments
        const AsyncStorage = this.getNativeStorage();
        if (AsyncStorage) {
          return await AsyncStorage.getItem(key);
        }
      }
      return null;
    } catch (error) {
      console.error('Storage error in getItem:', error);
      return null;
    }
  }

  async setItem(key: string, value: string): Promise<void> {
    try {
      if (Platform.OS !== 'web') {
        const AsyncStorage = this.getNativeStorage();
        if (AsyncStorage) {
          await AsyncStorage.setItem(key, value);
        }
      }
    } catch (error) {
      console.error('Storage error in setItem:', error);
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      if (Platform.OS !== 'web') {
        const AsyncStorage = this.getNativeStorage();
        if (AsyncStorage) {
          await AsyncStorage.removeItem(key);
        }
      }
    } catch (error) {
      console.error('Storage error in removeItem:', error);
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
