
import { isWeb } from './platform';
import mongoConnectionService from '../services/mongodb/connectionService';

/**
 * Platform-agnostic storage implementation using MongoDB
 */
class StorageService {
  private async getStorageCollection() {
    const db = await mongoConnectionService.connect();
    if (!db) {
      throw new Error('Could not connect to MongoDB');
    }
    return db.collection('storage');
  }

  async getItem(key: string): Promise<string | null> {
    try {
      const collection = await this.getStorageCollection();
      const item = await collection.findOne({ key });
      return item ? item.value : null;
    } catch (error) {
      console.error('Storage error in getItem:', error);
      return null;
    }
  }

  async setItem(key: string, value: string): Promise<void> {
    try {
      const collection = await this.getStorageCollection();
      await collection.updateOne(
        { key },
        { $set: { key, value } },
        { upsert: true }
      );
    } catch (error) {
      console.error('Storage error in setItem:', error);
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      const collection = await this.getStorageCollection();
      await collection.deleteOne({ key });
    } catch (error) {
      console.error('Storage error in removeItem:', error);
    }
  }
}

export const storage = new StorageService();
