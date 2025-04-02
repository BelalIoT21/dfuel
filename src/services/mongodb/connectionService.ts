import { isWeb } from '../../utils/platform';
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
    this.uri = 'mongodb://localhost:27017/learnit';
    console.log(`MongoDB connection URI: ${this.uri}`);
  }

  async connect(): Promise<any | null> {
    if (isWeb) {
      console.log("Running in browser environment, skipping MongoDB connection");
      return null;
    }

    if (this.isConnecting && this.connectionPromise) {
      console.log("MongoDB connection already in progress, waiting...");
      return this.connectionPromise;
    }

    if (this.connectionAttempts >= this.maxConnectionAttempts) {
      console.warn(`Maximum connection attempts (${this.maxConnectionAttempts}) reached. Using fallback data.`);
      return null;
    }

    try {
      if (!this.client) {
        this.isConnecting = true;
        this.connectionAttempts++;
        console.log(`Attempting to connect to MongoDB at ${this.uri} (Attempt ${this.connectionAttempts}/${this.maxConnectionAttempts})...`);

        this.connectionPromise = new Promise(async (resolve, reject) => {
          try {
            const { MongoClient, ServerApiVersion } = await import('mongodb');

            this.client = new MongoClient(this.uri, {
              serverApi: {
                version: ServerApiVersion.v1,
                strict: true,
                deprecationErrors: true,
              },
              connectTimeoutMS: 5000,
              socketTimeoutMS: 45000
            });

            await this.client.connect();
            console.log("Connected to MongoDB successfully");

            this.db = this.client.db('learnit');
            console.log(`Connected to database: ${this.db.databaseName}`);

            const collections = await this.db.listCollections().toArray();
            console.log(`Available collections: ${collections.map(c => c.name).join(', ')}`);

            // Create machineBackups collection if it doesn't exist
            if (!collections.find(c => c.name === 'machineBackups')) {
              await this.db.createCollection('machineBackups');
              console.log('Created new machineBackups collection');
            }

            if (!this.initialized) {
              await this.initializeData();
              this.initialized = true;
            }

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
        this.client = null;
        this.db = null;
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
      if (!this.client) {
        return false;
      }

      await this.db.command({ ping: 1 });
      console.log("MongoDB connection is active");
      return true;
    } catch (error) {
      console.error("MongoDB connection check failed:", error);
      return false;
    }
  }

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

const mongoConnectionService = new MongoConnectionService();
export default mongoConnectionService;

// Export a function to check MongoDB connection status
export const checkMongoDBConnection = async (): Promise<boolean> => {
  try {
    console.log("Checking MongoDB connection status...");
    
    // Try to make a simple API call to verify MongoDB connectivity
    const response = await fetch(`${window.location.origin.replace(':5000', ':4000')}/api/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log("MongoDB connection check result:", data);
      return data.dbStatus === "connected";
    }
    
    return false;
  } catch (error) {
    console.error("Error checking MongoDB connection:", error);
    return false;
  }
};

// Add connection debugging helper
export const getMongoDBConnectionDetails = () => {
  return {
    apiUrl: process.env.API_URL || window.location.origin.replace(':5000', ':4000') + '/api',
    dbUri: process.env.MONGODB_URI || "Not available in client",
    tokenAvailable: !!localStorage.getItem('token')
  };
};
