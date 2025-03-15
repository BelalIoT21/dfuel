
import { getEnv } from '../../utils/env';
import { MongoClient, Db } from 'mongodb';

class MongoConnectionService {
  private client: MongoClient | null = null;
  private db: Db | null = null;
  private uri: string;
  private isConnecting: boolean = false;
  private connectionPromise: Promise<Db | null> | null = null;
  private initialized: boolean = false;
  
  constructor() {
    // Always use a direct MongoDB connection to localhost
    this.uri = 'mongodb://localhost:27017/learnit';
    console.log(`MongoDB connection URI: ${this.uri}`);
  }
  
  async connect(): Promise<Db | null> {
    // If already connected, return the db
    if (this.db) {
      return this.db;
    }
    
    // If already connecting, return the existing promise
    if (this.isConnecting && this.connectionPromise) {
      return this.connectionPromise;
    }
    
    try {
      this.isConnecting = true;
      this.connectionPromise = this.connectToMongoDB();
      return await this.connectionPromise;
    } finally {
      this.isConnecting = false;
    }
  }
  
  private async connectToMongoDB(): Promise<Db | null> {
    try {
      console.log(`Connecting to MongoDB at: ${this.uri}`);
      
      // Create a new MongoDB client with connection options for reliability
      this.client = new MongoClient(this.uri, {
        connectTimeoutMS: 5000,
        socketTimeoutMS: 30000,
        // Add more options as needed for your specific environment
      });
      
      await this.client.connect();
      
      // Get the database
      this.db = this.client.db();
      console.log(`Connected to MongoDB: ${this.db.databaseName}`);
      
      // Set up connection event handlers
      this.client.on('close', () => {
        console.log('MongoDB connection closed');
        this.db = null;
        this.client = null;
      });
      
      this.client.on('error', (err) => {
        console.error('MongoDB connection error:', err);
      });
      
      this.initialized = true;
      return this.db;
    } catch (error) {
      console.error('Error connecting to MongoDB:', error);
      // Better error handling with specific messages
      console.error('Make sure MongoDB is running on localhost:27017');
      this.db = null;
      this.client = null;
      return null;
    }
  }
  
  async close(): Promise<void> {
    if (this.client) {
      try {
        await this.client.close();
        console.log('MongoDB connection closed');
        this.db = null;
        this.client = null;
      } catch (error) {
        console.error('Error closing MongoDB connection:', error);
      }
    }
  }

  async getDb(): Promise<Db | null> {
    return await this.connect();
  }
  
  async isConnected(): Promise<boolean> {
    try {
      if (!this.client || !this.db) {
        return false;
      }
      
      // Ping the database to check if connection is alive
      await this.db.command({ ping: 1 });
      return true;
    } catch (error) {
      console.error('MongoDB connection check failed:', error);
      return false;
    }
  }
}

const mongoConnectionService = new MongoConnectionService();
export default mongoConnectionService;
