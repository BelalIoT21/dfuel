
import { isWeb } from '../../utils/platform';

class MongoConnectionService {
  private client: any | null = null;
  private db: any | null = null;
  private uri: string;
  private isConnecting: boolean = false;
  private connectionPromise: Promise<any | null> | null = null;
  
  constructor() {
    // In a real application, this would come from environment variables
    this.uri = 'mongodb://localhost:27017/learnit';
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
    
    try {
      if (!this.client) {
        this.isConnecting = true;
        console.log(`Attempting to connect to MongoDB at ${this.uri}...`);
        
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
              }
            });
            
            await this.client.connect();
            console.log("Connected to MongoDB successfully");
            
            this.db = this.client.db('learnit');
            console.log(`Connected to database: ${this.db.databaseName}`);
            
            // List collections for debugging
            const collections = await this.db.listCollections().toArray();
            console.log(`Available collections: ${collections.map(c => c.name).join(', ')}`);
            
            resolve(this.db);
          } catch (error) {
            console.error("Error connecting to MongoDB:", error);
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
}

// Create a singleton instance
const mongoConnectionService = new MongoConnectionService();
export default mongoConnectionService;
