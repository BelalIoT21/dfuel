
import { isWeb } from '../../utils/platform';
import mongoMachineService from './machineService';
import mongoSeedService from './seedService';
import { getEnv } from '../../utils/env';
import { apiService } from '../apiService';
import { toast } from '@/components/ui/use-toast';

class MongoConnectionService {
  private client: any | null = null;
  private db: any | null = null;
  private uri: string;
  private isConnecting: boolean = false;
  private connectionPromise: Promise<any | null> | null = null;
  private initialized: boolean = false;
  private serverConnected: boolean = false;
  
  constructor() {
    // Get MongoDB URI from environment variables
    this.uri = getEnv('MONGODB_URI', 'mongodb://localhost:27017/learnit');
    console.log(`MongoDB connection URI: ${this.uri}`);
    
    // Check server connection status initially
    if (isWeb) {
      this.checkServerConnection();
    }
  }
  
  /**
   * Check if the server is connected (for web)
   */
  async checkServerConnection(): Promise<boolean> {
    if (!isWeb) return true;
    
    try {
      const healthCheck = await apiService.checkHealth();
      this.serverConnected = !!healthCheck.data;
      return this.serverConnected;
    } catch (error) {
      console.error("Error checking server connection:", error);
      this.serverConnected = false;
      return false;
    }
  }
  
  async connect(): Promise<any | null> {
    // In web environment, we don't connect directly to MongoDB - this is handled by the server
    if (isWeb) {
      console.log("Running in browser environment, using server API for MongoDB access");
      const serverConnected = await this.checkServerConnection();
      if (!serverConnected) {
        toast({
          title: "Database Connection",
          description: "Could not connect to the database server. Using API instead.",
          variant: "default"
        });
      } else {
        toast({
          title: "Database Connection",
          description: "Connected to the database through the server API.",
          variant: "default"
        });
      }
      return null;
    }
    
    // Implementation for native platforms would be here
    return null;
  }
  
  async close(): Promise<void> {
    // No direct MongoDB connection in web environment
    if (isWeb) {
      console.log("No MongoDB connection to close in web environment");
      return;
    }
    
    // Implementation for native platforms would be here
  }

  async getDb(): Promise<any | null> {
    // In web environment, we don't access the DB directly
    if (isWeb) {
      console.log("Web environment - using API for MongoDB access");
      return null;
    }
    
    // Implementation for native platforms would be here
    return null;
  }
  
  async isConnected(): Promise<boolean> {
    // Web environment doesn't connect directly to MongoDB
    if (isWeb) {
      return this.serverConnected;
    }
    
    // Implementation for native platforms would be here
    return false;
  }
  
  /**
   * Get the connection status
   */
  getConnectionStatus(): { 
    connected: boolean, 
    initialized: boolean, 
    uri: string, 
    isWeb: boolean 
  } {
    return {
      connected: isWeb ? this.serverConnected : false,
      initialized: this.initialized,
      uri: this.uri,
      isWeb
    };
  }
}

const mongoConnectionService = new MongoConnectionService();
export default mongoConnectionService;
