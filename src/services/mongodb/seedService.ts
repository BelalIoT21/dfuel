
import { Collection } from 'mongodb';
import { MongoUser, MongoMachine } from './types';
import mongoConnectionService from './connectionService';
import bcrypt from 'bcryptjs';

class MongoSeedService {
  private usersCollection: Collection<MongoUser> | null = null;
  private machinesCollection: Collection<MongoMachine> | null = null;
  
  async initCollections(): Promise<void> {
    try {
      if (!this.usersCollection || !this.machinesCollection) {
        const db = await mongoConnectionService.connect();
        if (db) {
          this.usersCollection = db.collection<MongoUser>('users');
          this.machinesCollection = db.collection<MongoMachine>('machines');
          console.log(`MongoDB Collections initialized for seeding`);
        } else {
          console.error("Failed to connect to MongoDB database for seeding");
        }
      }
    } catch (error) {
      console.error("Error initializing MongoDB collections for seeding:", error);
    }
  }
  
  // Seed users
  async seedUsers(): Promise<void> {
    await this.initCollections();
    if (!this.usersCollection) return;
    
    try {
      // Check if users already exist
      const userCount = await this.usersCollection.countDocuments();
      if (userCount > 0) {
        console.log(`${userCount} users already exist in the database, skipping user seeding`);
        return;
      }
      
      console.log("Seeding users...");
      
      // Generate password hash for admin user
      const salt = await bcrypt.genSalt(10);
      const adminPassword = await bcrypt.hash('admin123', salt);
      
      // Create admin user only
      const adminUser: MongoUser = {
        id: '1',
        name: 'Administrator',
        email: 'admin@learnit.com',
        password: adminPassword,
        isAdmin: true,
        certifications: ['1', '2', '3', '4', '5', '6'], // All machines
        bookings: [],
        lastLogin: new Date().toISOString()
      };
      
      // Insert admin user into database
      await this.usersCollection.insertOne(adminUser);
      console.log(`Successfully seeded admin user`);
    } catch (error) {
      console.error("Error seeding users:", error);
    }
  }
  
  // Seed bookings - no longer creates any bookings
  async seedBookings(): Promise<void> {
    await this.initCollections();
    if (!this.usersCollection) return;
    
    try {
      // Get all users
      const users = await this.usersCollection.find().toArray();
      
      if (users.length === 0) {
        console.log("No users found to seed bookings");
        return;
      }
      
      // Check if users already have bookings
      let totalBookings = 0;
      for (const user of users) {
        totalBookings += user.bookings.length;
      }
      
      if (totalBookings > 0) {
        console.log(`${totalBookings} bookings already exist, skipping booking seeding`);
        return;
      }
      
      console.log("Bookings seeding skipped as requested");
    } catch (error) {
      console.error("Error checking bookings in MongoDB:", error);
    }
  }
}

// Create a singleton instance
const mongoSeedService = new MongoSeedService();
export default mongoSeedService;
