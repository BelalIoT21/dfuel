
import { isWeb } from '../../utils/platform';
import mongoMachineService from './machineService';
import mongoSeedService from './seedService';
import { getEnv } from '../../utils/env';

class MongoConnectionService {
  private client: any | null = null;
  private db: any | null = null;
  private uri: string;
  private isConnecting: boolean = false;
  private connectionPromise: Promise<any | null> | null = null;
  private initialized: boolean = false;
  
  constructor() {
    // Get MongoDB URI from environment variables
    this.uri = getEnv('MONGODB_URI', 'mongodb://localhost:27017/learnit');
    console.log(`MongoDB connection URI: ${this.uri}`);
  }
  
  async connect(): Promise<any | null> {
    // In web environment, we don't connect directly to MongoDB - this is handled by the server
    console.log("Using server API for MongoDB access, with local storage fallback");
    return null;
  }
  
  async close(): Promise<void> {
    // No direct MongoDB connection in web environment
    console.log("No MongoDB connection to close");
  }

  async getDb(): Promise<any | null> {
    // In web environment, we don't access the DB directly
    console.log("Using API for MongoDB access, with local storage fallback");
    return null;
  }
  
  async isConnected(): Promise<boolean> {
    // Check if our API is available
    try {
      const response = await fetch('/api/health');
      return response.ok;
    } catch (error) {
      console.log("API not available, using local storage fallback");
      return false;
    }
  }
}

const mongoConnectionService = new MongoConnectionService();
export default mongoConnectionService;
