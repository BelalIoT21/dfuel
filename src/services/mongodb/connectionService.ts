
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
    // In web environment, we don't need to connect directly to MongoDB
    console.log("Running in browser environment, using server API for MongoDB access");
    return null;
  }
  
  async close(): Promise<void> {
    // No direct MongoDB connection in web environment
    console.log("No MongoDB connection to close in web environment");
  }

  async getDb(): Promise<any | null> {
    // In web environment, we don't need to access the DB directly
    console.log("Web environment - using API for MongoDB access");
    return null;
  }
  
  async isConnected(): Promise<boolean> {
    // Web environment doesn't connect directly to MongoDB
    return false;
  }
}

const mongoConnectionService = new MongoConnectionService();
export default mongoConnectionService;
