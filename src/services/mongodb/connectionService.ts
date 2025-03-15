
import { isWeb } from '../../utils/platform';
import mongoMachineService from './machineService';
import mongoSeedService from './seedService';

class MongoConnectionService {
  private client: any | null = null;
  private db: any | null = null;
  private uri: string;
  private isConnecting: boolean = false;
  private connectionPromise: Promise<any | null> | null = null;
  private initialized: boolean = false;
  
  constructor() {
    // Use the same URI for both preview and local machine
    this.uri = 'mongodb://localhost:27017/learnit';
    console.log(`MongoDB connection URI: ${this.uri}`);
  }
  
  async connect(): Promise<any | null> {
    if (isWeb) {
      console.log("Running in browser environment, using server API for MongoDB access");
      return null;
    }
    
    if (this.isConnecting && this.connectionPromise) {
      console.log("MongoDB connection already in progress, waiting...");
      return this.connectionPromise;
    }
    
    try {
      if (!this.client) {
        this.isConnecting = true;
        console.log(`Attempting to connect to MongoDB at ${this.uri}...`);
        
        this.connectionPromise = new Promise(async (resolve, reject) => {
          try {
            // Safe import of MongoDB - this prevents crashing in web environment
            let MongoClient, ServerApiVersion;
            try {
              const mongodb = await import('mongodb');
              MongoClient = mongodb.MongoClient;
              ServerApiVersion = mongodb.ServerApiVersion;
            } catch (err) {
              console.log("Could not import MongoDB client, likely in web environment", err);
              this.isConnecting = false;
              resolve(null);
              return;
            }
            
            this.client = new MongoClient(this.uri, {
              serverApi: {
                version: ServerApiVersion.v1,
                strict: true,
                deprecationErrors: true,
              },
              connectTimeoutMS: 5000,      // Connection timeout
              socketTimeoutMS: 30000,      // Socket timeout
              waitQueueTimeoutMS: 10000,   // Wait queue timeout
            });
            
            await this.client.connect();
            console.log("Connected to MongoDB successfully");
            
            this.db = this.client.db('learnit');
            console.log(`Connected to database: ${this.db.databaseName}`);
            
            // List collections for debugging
            const collections = await this.db.listCollections().toArray();
            console.log(`Available collections: ${collections.map(c => c.name).join(', ')}`);
            
            if (!this.initialized) {
              await this.initializeData();
              this.initialized = true;
            }
            
            resolve(this.db);
          } catch (error) {
            console.error("Error connecting to MongoDB:", error);
            this.isConnecting = false;
            this.connectionPromise = null;
            // Return null instead of rejecting to allow app to continue
            resolve(null);
          }
        });
        
        const result = await this.connectionPromise;
        this.isConnecting = false;
        return result;
      }
      return this.db;
    } catch (error) {
      console.error("Error connecting to MongoDB:", error);
      this.isConnecting = false;
      this.connectionPromise = null;
      return null;
    }
  }
  
  private async initializeData(): Promise<void> {
    try {
      console.log("Initializing MongoDB with seed data...");
      
      await mongoMachineService.seedDefaultMachines();
      await mongoSeedService.seedUsers();
      await mongoSeedService.seedBookings();
      
      console.log("Seed data initialization complete");
    } catch (error) {
      console.error("Error initializing seed data:", error);
    }
  }
  
  async close(): Promise<void> {
    if (!isWeb && this.client) {
      try {
        await this.client.close();
        console.log("Disconnected from MongoDB");
      } catch (error) {
        console.error("Error closing MongoDB connection:", error);
      }
    }
  }

  async getDb(): Promise<any | null> {
    if (this.db) {
      return this.db;
    }
    
    return this.connect();
  }
  
  async isConnected(): Promise<boolean> {
    if (isWeb) return false;
    
    try {
      if (!this.client || !this.db) {
        return false;
      }
      
      // Simple ping to check connection
      await this.db.command({ ping: 1 });
      console.log("MongoDB connection is active");
      return true;
    } catch (error) {
      console.error("MongoDB connection check failed:", error);
      return false;
    }
  }
}

const mongoConnectionService = new MongoConnectionService();
export default mongoConnectionService;
