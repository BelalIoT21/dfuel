
import { MongoClient, ServerApiVersion, Db, Collection } from 'mongodb';

// Types
export interface MongoUser {
  id: string;
  email: string;
  password: string;
  name: string;
  isAdmin: boolean;
  certifications: string[];
  bookings: {
    id: string;
    machineId: string;
    date: string;
    time: string;
    status: 'Pending' | 'Approved' | 'Completed' | 'Canceled';
  }[];
  lastLogin: string;
  resetCode?: {
    code: string;
    expiry: string;
  };
}

export interface MongoMachineStatus {
  machineId: string;
  status: string;
  note?: string;
}

class MongoDbService {
  private client: MongoClient | null = null;
  private db: Db | null = null;
  private usersCollection: Collection<MongoUser> | null = null;
  private machineStatusesCollection: Collection<MongoMachineStatus> | null = null;
  private uri: string;
  
  constructor() {
    // In a real application, this would come from environment variables
    this.uri = 'mongodb://localhost:27017/learnit';
    this.connect();
  }
  
  async connect(): Promise<void> {
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
        this.usersCollection = this.db.collection<MongoUser>('users');
        this.machineStatusesCollection = this.db.collection<MongoMachineStatus>('machineStatuses');
        
        // Create indexes for faster queries
        await this.usersCollection.createIndex({ email: 1 }, { unique: true });
      }
    } catch (error) {
      console.error("Error connecting to MongoDB:", error);
      // Fallback to localStorage if MongoDB connection fails
    }
  }
  
  async getUsers(): Promise<MongoUser[]> {
    if (!this.usersCollection) await this.connect();
    if (!this.usersCollection) return [];
    
    try {
      return await this.usersCollection.find().toArray();
    } catch (error) {
      console.error("Error getting users from MongoDB:", error);
      return [];
    }
  }
  
  async getUserByEmail(email: string): Promise<MongoUser | null> {
    if (!this.usersCollection) await this.connect();
    if (!this.usersCollection) return null;
    
    try {
      return await this.usersCollection.findOne({ email: email.toLowerCase() });
    } catch (error) {
      console.error("Error getting user by email from MongoDB:", error);
      return null;
    }
  }
  
  async getUserById(id: string): Promise<MongoUser | null> {
    if (!this.usersCollection) await this.connect();
    if (!this.usersCollection) return null;
    
    try {
      return await this.usersCollection.findOne({ id });
    } catch (error) {
      console.error("Error getting user by ID from MongoDB:", error);
      return null;
    }
  }
  
  async createUser(user: MongoUser): Promise<MongoUser | null> {
    if (!this.usersCollection) await this.connect();
    if (!this.usersCollection) return null;
    
    try {
      // Check if user with this email already exists
      const existingUser = await this.getUserByEmail(user.email);
      if (existingUser) return null;
      
      await this.usersCollection.insertOne(user);
      return user;
    } catch (error) {
      console.error("Error creating user in MongoDB:", error);
      return null;
    }
  }
  
  async updateUser(id: string, updates: Partial<MongoUser>): Promise<boolean> {
    if (!this.usersCollection) await this.connect();
    if (!this.usersCollection) return false;
    
    try {
      const result = await this.usersCollection.updateOne(
        { id },
        { $set: updates }
      );
      
      return result.modifiedCount > 0;
    } catch (error) {
      console.error("Error updating user in MongoDB:", error);
      return false;
    }
  }
  
  async updateUserCertifications(userId: string, machineId: string): Promise<boolean> {
    if (!this.usersCollection) await this.connect();
    if (!this.usersCollection) return false;
    
    try {
      const user = await this.getUserById(userId);
      if (!user) return false;
      
      if (!user.certifications.includes(machineId)) {
        const result = await this.usersCollection.updateOne(
          { id: userId },
          { $push: { certifications: machineId } }
        );
        
        return result.modifiedCount > 0;
      }
      
      return true; // Certification already exists
    } catch (error) {
      console.error("Error updating user certifications in MongoDB:", error);
      return false;
    }
  }
  
  async addUserBooking(userId: string, booking: any): Promise<boolean> {
    if (!this.usersCollection) await this.connect();
    if (!this.usersCollection) return false;
    
    try {
      const result = await this.usersCollection.updateOne(
        { id: userId },
        { $push: { bookings: booking } }
      );
      
      return result.modifiedCount > 0;
    } catch (error) {
      console.error("Error adding user booking in MongoDB:", error);
      return false;
    }
  }
  
  async getMachineStatuses(): Promise<MongoMachineStatus[]> {
    if (!this.machineStatusesCollection) await this.connect();
    if (!this.machineStatusesCollection) return [];
    
    try {
      return await this.machineStatusesCollection.find().toArray();
    } catch (error) {
      console.error("Error getting machine statuses from MongoDB:", error);
      return [];
    }
  }
  
  async getMachineStatus(machineId: string): Promise<MongoMachineStatus | null> {
    if (!this.machineStatusesCollection) await this.connect();
    if (!this.machineStatusesCollection) return null;
    
    try {
      return await this.machineStatusesCollection.findOne({ machineId });
    } catch (error) {
      console.error("Error getting machine status from MongoDB:", error);
      return null;
    }
  }
  
  async updateMachineStatus(machineId: string, status: string, note?: string): Promise<boolean> {
    if (!this.machineStatusesCollection) await this.connect();
    if (!this.machineStatusesCollection) return false;
    
    try {
      const result = await this.machineStatusesCollection.updateOne(
        { machineId },
        { $set: { machineId, status, note } },
        { upsert: true }
      );
      
      return result.acknowledged;
    } catch (error) {
      console.error("Error updating machine status in MongoDB:", error);
      return false;
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
const mongoDbService = new MongoDbService();
export default mongoDbService;
