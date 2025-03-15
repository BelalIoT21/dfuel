
import { isWeb } from '../../utils/platform';

class MongoConnectionService {
  private client: any | null = null;
  private db: any | null = null;
  private uri: string;
  
  constructor() {
    // In a real application, this would come from environment variables
    this.uri = 'mongodb://localhost:27017/learnit';
  }
  
  async connect(): Promise<any | null> {
    // Skip MongoDB connection in browser environment
    if (isWeb) {
      console.log("Running in browser environment, skipping MongoDB connection");
      return null;
    }
    
    try {
      if (!this.client) {
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
        console.log("Connected to MongoDB");
        
        this.db = this.client.db('learnit');
      }
      return this.db;
    } catch (error) {
      console.error("Error connecting to MongoDB:", error);
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
}

// Create a singleton instance
const mongoConnectionService = new MongoConnectionService();
export default mongoConnectionService;
