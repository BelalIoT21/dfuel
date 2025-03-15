
import mongoConnectionService from '../services/mongodb/connectionService';

/**
 * Storage implementation using MongoDB directly for web and native platforms
 */
class StorageService {
  private async getStorageCollection() {
    try {
      console.log('Getting storage collection from MongoDB...');
      const db = await mongoConnectionService.connect();
      if (!db) {
        console.error('Could not connect to MongoDB for storage operations');
        throw new Error('Could not connect to MongoDB');
      }
      return db.collection('storage');
    } catch (error) {
      console.error('Error getting storage collection:', error);
      throw error;
    }
  }

  async getItem(key: string): Promise<string | null> {
    try {
      console.log(`Storage: Getting item with key: ${key}`);
      const collection = await this.getStorageCollection();
      const item = await collection.findOne({ key });
      console.log(`Storage: Retrieved item for key ${key}:`, item ? 'found' : 'not found');
      return item ? item.value : null;
    } catch (error) {
      console.error(`Storage error in getItem for key ${key}:`, error);
      // Fall back to session storage for web as emergency backup
      if (typeof window !== 'undefined') {
        try {
          const value = sessionStorage.getItem(key);
          console.log(`Falling back to sessionStorage for key ${key}:`, value ? 'found' : 'not found');
          return value;
        } catch (e) {
          console.error('Session storage fallback also failed:', e);
        }
      }
      return null;
    }
  }

  async setItem(key: string, value: string): Promise<void> {
    try {
      console.log(`Storage: Setting item with key: ${key}`);
      const collection = await this.getStorageCollection();
      await collection.updateOne(
        { key },
        { $set: { key, value } },
        { upsert: true }
      );
      console.log(`Storage: Successfully set item with key: ${key}`);
      // Also set in session storage as backup for web
      if (typeof window !== 'undefined') {
        try {
          sessionStorage.setItem(key, value);
        } catch (e) {
          console.error('Failed to set backup in session storage:', e);
        }
      }
    } catch (error) {
      console.error(`Storage error in setItem for key ${key}:`, error);
      // Fall back to session storage for web
      if (typeof window !== 'undefined') {
        try {
          sessionStorage.setItem(key, value);
          console.log(`Falling back to sessionStorage for setting key ${key}`);
        } catch (e) {
          console.error('Session storage fallback also failed:', e);
        }
      }
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      console.log(`Storage: Removing item with key: ${key}`);
      const collection = await this.getStorageCollection();
      await collection.deleteOne({ key });
      console.log(`Storage: Successfully removed item with key: ${key}`);
      // Also remove from session storage for web
      if (typeof window !== 'undefined') {
        try {
          sessionStorage.removeItem(key);
        } catch (e) {
          console.error('Failed to remove backup from session storage:', e);
        }
      }
    } catch (error) {
      console.error(`Storage error in removeItem for key ${key}:`, error);
    }
  }
}

export const storage = new StorageService();
