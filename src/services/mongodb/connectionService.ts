
import { isWeb } from '../../utils/platform';
import mongoMachineService from './machineService';
import mongoSeedService from './seedService';
import { toast } from '@/components/ui/use-toast';

class MongoConnectionService {
  private client: any | null = null;
  private db: any | null = null;
  private uri: string;
  private isConnecting: boolean = false;
  private connectionPromise: Promise<any | null> | null = null;
  private initialized: boolean = false;
  
  constructor() {
    // Use a hardcoded URI in browser environments
    this.uri = typeof process !== 'undefined' && process.env && process.env.MONGODB_URI 
      ? process.env.MONGODB_URI 
      : 'mongodb://localhost:27017/learnit';
    console.log(`MongoDB connection URI: ${this.uri}`);
  }
  
  async connect(): Promise<any | null> {
    // If we're already connecting, return the existing promise
    if (this.isConnecting && this.connectionPromise) {
      console.log("MongoDB connection already in progress, waiting...");
      return this.connectionPromise;
    }
    
    try {
      if (!this.client) {
        this.isConnecting = true;
        console.log(`Attempting to connect to MongoDB at ${this.uri}...`);
        
        // Create a new connection promise
        this.connectionPromise = new Promise(async (resolve, reject) => {
          try {
            // Only import MongoDB in non-web environments
            if (isWeb) {
              console.error("Cannot directly connect to MongoDB in web environment");
              // Instead of failing silently, show a toast for web users
              toast({
                title: "Database Connection Error",
                description: "Cannot connect directly to MongoDB in web environment. Please ensure the server is running.",
                variant: "destructive"
              });
              this.isConnecting = false;
              reject(new Error("Cannot connect to MongoDB in web environment"));
              return;
            }
            
            const { MongoClient, ServerApiVersion } = await import('mongodb');
            
            this.client = new MongoClient(this.uri, {
              serverApi: {
                version: ServerApiVersion.v1,
                strict: true,
                deprecationErrors: true,
              }
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
            
            resolve(this.db);
          } catch (error) {
            console.error("Error connecting to MongoDB:", error);
            // Show a toast for connection errors
            toast({
              title: "Database Connection Error",
              description: "Failed to connect to MongoDB. Please check your connection and try again.",
              variant: "destructive"
            });
            this.isConnecting = false;
            this.connectionPromise = null;
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
      toast({
        title: "Data Initialization Error",
        description: "Failed to initialize seed data in MongoDB",
        variant: "destructive"
      });
    }
  }
  
  // Method to close the connection when the application shuts down
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

  // Get the database instance
  async getDb(): Promise<any | null> {
    if (this.db) {
      return this.db;
    }
    
    return this.connect();
  }
  
  // Check if the database connection is active
  async isConnected(): Promise<boolean> {
    if (isWeb) {
      console.log("Web environment - using API for MongoDB access");
      return false;
    }
    
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
}

// Create a singleton instance
const mongoConnectionService = new MongoConnectionService();
export default mongoConnectionService;
