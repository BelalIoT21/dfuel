
import { MongoClient, ServerApiVersion, Db } from 'mongodb';

class MongoConnectionService {
  private client: MongoClient | null = null;
  private db: Db | null = null;
  private uri: string;
  
  constructor() {
    // In a real application, this would come from environment variables
    this.uri = 'mongodb://localhost:27017/learnit';
  }
  
  async connect(): Promise<Db | null> {
    try {
      if (!this.client) {
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

        // No index creation here - moved to specific service files
      }
      return this.db;
    } catch (error) {
      console.error("Error connecting to MongoDB:", error);
      // Fallback to localStorage if MongoDB connection fails
      return null;
    }
  }
  
  // Method to close the connection when the application shuts down
  async close(): Promise<void> {
    if (this.client) {
      await this.client.close();
      console.log("Disconnected from MongoDB");
    }
  }
}

// Create a singleton instance
const mongoConnectionService = new MongoConnectionService();
export default mongoConnectionService;
