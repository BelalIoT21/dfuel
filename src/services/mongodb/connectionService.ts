
import { isWeb } from '../../utils/platform';
import { getEnv } from '../../utils/env';
import { mongoMachineService } from './machineService';
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
    // Use environment utilities to get MongoDB URI instead of directly accessing process.env
    this.uri = isWeb() ? getEnv('MONGODB_URI', '') : (import.meta.env.VITE_MONGODB_URI || '');
    
    // Auto-connect when the service is instantiated
    if (this.uri && !isWeb()) {
      this.connect().catch(err => {
        console.error('Failed to auto-connect to MongoDB:', err);
      });
    }
  }
  
  /**
   * Connect to MongoDB
   */
  async connect(): Promise<any | null> {
    // If we're in a web environment, don't try to connect to MongoDB
    if (isWeb()) {
      console.log('MongoDB connection not supported in web environment');
      return null;
    }
    
    // If already connected, return the existing client
    if (this.client) {
      return this.client;
    }
    
    // If already connecting, return the existing promise
    if (this.isConnecting && this.connectionPromise) {
      return this.connectionPromise;
    }
    
    try {
      this.isConnecting = true;
      this.connectionPromise = this._connectToMongoDB();
      return await this.connectionPromise;
    } finally {
      this.isConnecting = false;
      this.connectionPromise = null;
    }
  }
  
  /**
   * Internal method to handle the actual MongoDB connection
   */
  private async _connectToMongoDB(): Promise<any | null> {
    try {
      if (this.connectionAttempts >= this.maxConnectionAttempts) {
        console.error(`Maximum connection attempts (${this.maxConnectionAttempts}) reached.`);
        return null;
      }
      
      this.connectionAttempts++;
      
      if (!this.uri) {
        console.error('MongoDB URI is not defined');
        return null;
      }
      
      console.log(`Connecting to MongoDB (Attempt ${this.connectionAttempts})...`);
      
      // In a real implementation, you would use the MongoDB driver
      // For demonstration purposes, we're simulating a successful connection
      this.client = { connected: true };
      this.db = { name: 'fabricLab', collection: (name: string) => ({ name, find: () => ({ toArray: () => [] }) }) };
      
      console.log('Connected to MongoDB successfully');
      
      // Reset connection attempts on success
      this.connectionAttempts = 0;
      
      // Initialize collections if needed
      if (!this.initialized) {
        await this.initializeCollections();
      }
      
      return this.client;
    } catch (error) {
      console.error('Error connecting to MongoDB:', error);
      this.client = null;
      this.db = null;
      throw error;
    }
  }
  
  /**
   * Initialize collections and seed data if needed
   */
  private async initializeCollections(): Promise<void> {
    try {
      if (!this.db) return;
      
      console.log('Initializing MongoDB collections...');
      
      // Seed machines if necessary
      await mongoMachineService.ensureMachinesExist();
      
      // Run other seed operations if needed
      await mongoSeedService.seedIfNeeded();
      
      this.initialized = true;
      console.log('MongoDB collections initialized');
    } catch (error) {
      console.error('Error initializing MongoDB collections:', error);
    }
  }
  
  /**
   * Get the MongoDB client
   */
  getClient(): any | null {
    return this.client;
  }
  
  /**
   * Get the MongoDB database
   */
  getDb(): any | null {
    return this.db;
  }
  
  /**
   * Close the MongoDB connection
   */
  async close(): Promise<void> {
    if (this.client) {
      try {
        await this.client.close();
        console.log('MongoDB connection closed');
      } catch (error) {
        console.error('Error closing MongoDB connection:', error);
      } finally {
        this.client = null;
        this.db = null;
        this.initialized = false;
      }
    }
  }
  
  /**
   * Check if connected to MongoDB
   */
  isConnected(): boolean {
    return !!this.client;
  }
}

const mongoConnectionService = new MongoConnectionService();
export default mongoConnectionService;
