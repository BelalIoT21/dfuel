
/**
 * DEPRECATED: This service has been completely removed.
 * All data should be fetched directly from MongoDB.
 */
class StorageService {
  constructor() {
    console.warn('Storage service has been completely removed. Use MongoDB API calls instead.');
  }
  
  async getItem(key: string): Promise<string | null> {
    console.warn('Storage.getItem has been removed. Use MongoDB API calls instead.');
    return null;
  }

  async setItem(key: string, value: string): Promise<void> {
    console.warn('Storage.setItem has been removed. Use MongoDB API calls instead.');
  }

  async removeItem(key: string): Promise<void> {
    console.warn('Storage.removeItem has been removed. Use MongoDB API calls instead.');
  }

  async clearExceptToken(): Promise<void> {
    console.warn('Storage.clearExceptToken has been removed. Use MongoDB API calls instead.');
  }
}

export const storage = new StorageService();
