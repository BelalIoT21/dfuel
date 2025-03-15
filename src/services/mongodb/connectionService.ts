
import { isWeb } from '../../utils/platform';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

class MongoConnectionService {
  private client: any | null = null;
  private db: any | null = null;
  private uri: string;
  private isConnecting: boolean = false;
  private connectionPromise: Promise<any | null> | null = null;
  
  constructor() {
    // Read from environment variables
    this.uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/learnit';
    console.log(`MongoDB Connection URI: ${this.uri}`);
    console.log(`MongoDB DB Name: ${process.env.MONGODB_DB_NAME || 'learnit'}`);
  }
  
  async connect(): Promise<any | null> {
    // Skip MongoDB connection in browser environment
    if (isWeb) {
      console.log("Running in browser environment, skipping MongoDB connection");
      return null;
    }
    
    // If we're already connecting, return the existing promise
    if (this.isConnecting && this.connectionPromise) {
      return this.connectionPromise;
    }
    
    try {
      if (!this.client) {
        this.isConnecting = true;
        console.log("Initiating MongoDB connection...");
        
        // Create a new connection promise
        this.connectionPromise = new Promise(async (resolve, reject) => {
          try {
            // Only import MongoDB in non-web environments
            const { MongoClient, ServerApiVersion } = await import('mongodb');
            console.log("MongoDB driver loaded successfully");
            
            this.client = new MongoClient(this.uri, {
              serverApi: {
                version: ServerApiVersion.v1,
                strict: true,
                deprecationErrors: true,
              }
            });
            
            console.log("Attempting to connect to MongoDB at:", this.uri);
            await this.client.connect();
            console.log("Connected to MongoDB server successfully");
            
            const dbName = process.env.MONGODB_DB_NAME || 'learnit';
            this.db = this.client.db(dbName);
            console.log(`Using MongoDB database: ${dbName}`);
            
            // List all collections to verify connection
            const collections = await this.db.listCollections().toArray();
            console.log(`Available collections in ${dbName}:`, collections.map(c => c.name).join(', '));
            
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
  
  // Get info about the database connection
  async getConnectionInfo(): Promise<{
    connected: boolean;
    databaseName: string | null;
    uri: string;
    collections: string[];
  }> {
    if (isWeb) {
      return {
        connected: false,
        databaseName: null,
        uri: this.uri,
        collections: []
      };
    }
    
    try {
      const db = await this.connect();
      if (!db) {
        return {
          connected: false,
          databaseName: null,
          uri: this.uri,
          collections: []
        };
      }
      
      const collections = await db.listCollections().toArray();
      
      return {
        connected: true,
        databaseName: db.databaseName,
        uri: this.uri,
        collections: collections.map((c: any) => c.name)
      };
    } catch (error) {
      console.error("Error getting connection info:", error);
      return {
        connected: false,
        databaseName: null,
        uri: this.uri,
        collections: []
      };
    }
  }
}

// Create a singleton instance
const mongoConnectionService = new MongoConnectionService();
export default mongoConnectionService;
