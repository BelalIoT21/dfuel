
import { isWeb } from '../../utils/env';
import mongoMachineService from './machineService';
import mongoSeedService from './seedService'; 

class MongoConnectionService {
  private client: any | null = null;
  private db: any | null = null;
  private uri: string;
  private isConnecting: boolean = false;
  private connectionPromise: Promise<any | null> | null = null;
  private initialized: boolean = false;
  private connectionAttempts: number = 0;
  private maxConnectionAttempts: number = 3;
  
  constructor() {
    // Use the correct MongoDB connection URL based on environment
    if (isWeb) {
      // For browser environments, connect through the API
      this.uri = 'http://localhost:4000/api/mongodb';
      console.log('MongoDB: Using browser API endpoint');
    } else {
      // For Node.js environments (server-side), use direct MongoDB connection
      // @ts-ignore - process.env may not exist in browser but this code only runs in Node
      this.uri = (typeof process !== 'undefined' && process.env && process.env.MONGODB_URI) || 
                'mongodb://localhost:27017/learnit';
      console.log('MongoDB: Using direct connection');
    }
    
    console.log(`MongoDB connection URI: ${this.uri}`);
  }
  
  async connect(): Promise<any | null> {
    // Skip MongoDB connection in browser environment
    if (isWeb) {
      console.log("Running in browser environment, skipping MongoDB connection");
      return null;
    }
    
    // If we're already connecting, return the existing promise
    if (this.isConnecting && this.connectionPromise) {
      console.log("MongoDB connection already in progress, waiting...");
      return this.connectionPromise;
    }
    
    // Check if we've exceeded the maximum number of connection attempts
    if (this.connectionAttempts >= this.maxConnectionAttempts) {
      console.warn(`Maximum connection attempts (${this.maxConnectionAttempts}) reached. Using fallback data.`);
      return null;
    }
    
    try {
      if (!this.client) {
        this.isConnecting = true;
        this.connectionAttempts++;
        console.log(`Attempting to connect to MongoDB at ${this.uri} (Attempt ${this.connectionAttempts}/${this.maxConnectionAttempts})...`);
        
        // Create a new connection promise
        this.connectionPromise = new Promise(async (resolve, reject) => {
          try {
            // Only import MongoDB in non-web environments
            const { MongoClient, ServerApiVersion } = await import('mongodb');
            
            this.client = new MongoClient(this.uri, {
              serverApi: {
                version: ServerApiVersion.v1,
                strict: true,
                deprecationErrors: true,
              },
              // Add connection timeout
              connectTimeoutMS: 5000, 
              socketTimeoutMS: 45000
            });
            
            await this.client.connect();
            console.log("Connected to MongoDB successfully");
            
            this.db = this.client.db('learnit');
            console.log(`Connected to database: ${this.db.databaseName}`);
            
            // List collections for debugging
            const collections = await this.db.listCollections().toArray();
            console.log(`Available collections: ${collections.map(c => c.name).join(', ')}`);
            
            // Initialize seed data if not already done
            if (!this.initialized) {
              await this.initializeData();
              this.initialized = true;
            }
            
            // Reset connection attempts on success
            this.connectionAttempts = 0;
            resolve(this.db);
          } catch (error) {
            console.error("Error connecting to MongoDB:", error);
            this.isConnecting = false;
            this.connectionPromise = null;
            
            if (this.client) {
              try {
                await this.client.close();
                this.client = null;
                this.db = null;
              } catch (closeError) {
                console.error("Error closing MongoDB client:", closeError);
              }
            }
            
            reject(error);
          }
        });
        
        // Wait for the connection to complete
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
  
  // New method to initialize data
  private async initializeData(): Promise<void> {
    try {
      console.log("Initializing MongoDB with seed data...");
      
      // First seed machines (as they're referenced by users and bookings)
      await mongoMachineService.seedDefaultMachines();
      
      // Then seed users and bookings
      await mongoSeedService.seedUsers();
      await mongoSeedService.seedBookings();
      
      console.log("Seed data initialization complete");
    } catch (error) {
      console.error("Error initializing seed data:", error);
    }
  }
  
  // Method to close the connection when the application shuts down
  async close(): Promise<void> {
    if (!isWeb && this.client) {
      try {
        await this.client.close();
        console.log("Disconnected from MongoDB");
        this.client = null;
        this.db = null;
      } catch (error) {
        console.error("Error closing MongoDB connection:", error);
      }
    }
  }

  // Get the database instance
  async getDb(): Promise<any | null> {
    if (this.db) {
      return this.db;
    }
    
    return this.connect();
  }
  
  // Check if the database connection is active
  async isConnected(): Promise<boolean> {
    if (isWeb) return false;
    
    try {
      if (!this.client) {
        return false;
      }
      
      // Try a simple command to test the connection
      await this.db.command({ ping: 1 });
      console.log("MongoDB connection is active");
      return true;
    } catch (error) {
      console.error("MongoDB connection check failed:", error);
      return false;
    }
  }
  
  // Reset connection state (useful for retrying)
  async resetConnection(): Promise<void> {
    if (this.client) {
      try {
        await this.client.close();
      } catch (error) {
        console.error("Error closing MongoDB connection during reset:", error);
      }
    }
    
    this.client = null;
    this.db = null;
    this.isConnecting = false;
    this.connectionPromise = null;
    this.connectionAttempts = 0;
  }
}

// Create a singleton instance
const mongoConnectionService = new MongoConnectionService();
export default mongoConnectionService;
