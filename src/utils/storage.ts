
/**
 * DEPRECATED: This service is deprecated and should not be used.
 * All data should be fetched directly from MongoDB.
 */
class StorageService {
  constructor() {
    console.warn('Storage service is deprecated. Use MongoDB API calls instead.');
  }
  
  async getItem(key: string): Promise<string | null> {
    console.warn('Storage.getItem is deprecated. Use MongoDB API calls instead.');
    return null;
  }

  async setItem(key: string, value: string): Promise<void> {
    console.warn('Storage.setItem is deprecated. Use MongoDB API calls instead.');
  }

  async removeItem(key: string): Promise<void> {
    console.warn('Storage.removeItem is deprecated. Use MongoDB API calls instead.');
  }

  async clearExceptToken(): Promise<void> {
    console.warn('Storage.clearExceptToken is deprecated. Use MongoDB API calls instead.');
  }
}

export const storage = new StorageService();
