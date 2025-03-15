
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
      
      // Generate password hash for sample users
      const salt = await bcrypt.genSalt(10);
      const adminPassword = await bcrypt.hash('admin123', salt);
      const userPassword = await bcrypt.hash('password123', salt);
      
      // Create sample users
      const users: MongoUser[] = [
        {
          id: '1',
          name: 'Admin User',
          email: 'admin@learnit.com',
          password: adminPassword,
          isAdmin: true,
          certifications: ['1', '2', '3', '4', '5'], // All machines
          bookings: [],
          lastLogin: new Date().toISOString()
        },
        {
          id: '2',
          name: 'John Doe',
          email: 'john@example.com',
          password: userPassword,
          isAdmin: false,
          certifications: ['1', '2'], // Laser Cutter and 3D Printer
          bookings: [],
          lastLogin: new Date().toISOString()
        },
        {
          id: '3',
          name: 'Jane Smith',
          email: 'jane@example.com',
          password: userPassword,
          isAdmin: false,
          certifications: ['3', '4'], // CNC Router and Vinyl Cutter
          bookings: [],
          lastLogin: new Date().toISOString()
        }
      ];
      
      // Insert users into database
      await this.usersCollection.insertMany(users);
      console.log(`Successfully seeded ${users.length} users`);
    } catch (error) {
      console.error("Error seeding users:", error);
    }
  }
  
  // Seed bookings
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
      
      console.log("Seeding bookings...");
      
      // Get current date and format it
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString().split('T')[0];
      
      // Get tomorrow's date
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split('T')[0];
      
      // Get next week's date
      const nextWeek = new Date(now);
      nextWeek.setDate(nextWeek.getDate() + 7);
      const nextWeekStr = nextWeek.toISOString().split('T')[0];
      
      // Create sample bookings and assign to users
      for (const user of users) {
        if (user.id === '1') {
          // Admin user doesn't need bookings
          continue;
        }
        
        const bookings = [];
        
        // Create bookings for user "John Doe"
        if (user.id === '2') {
          bookings.push({
            id: `booking-${user.id}-1`,
            machineId: '1', // Laser Cutter
            date: today,
            time: '10:00 - 12:00',
            status: 'Approved'
          });
          
          bookings.push({
            id: `booking-${user.id}-2`,
            machineId: '2', // 3D Printer
            date: tomorrowStr,
            time: '14:00 - 16:00',
            status: 'Pending'
          });
        }
        
        // Create bookings for user "Jane Smith"
        if (user.id === '3') {
          bookings.push({
            id: `booking-${user.id}-1`,
            machineId: '3', // CNC Router
            date: today,
            time: '13:00 - 15:00',
            status: 'Pending'
          });
          
          bookings.push({
            id: `booking-${user.id}-2`,
            machineId: '4', // Vinyl Cutter
            date: nextWeekStr,
            time: '09:00 - 11:00',
            status: 'Approved'
          });
          
          bookings.push({
            id: `booking-${user.id}-3`,
            machineId: '5', // Soldering Station
            date: tomorrowStr,
            time: '16:00 - 18:00',
            status: 'Completed'
          });
        }
        
        // Add bookings to user
        user.bookings = bookings;
        
        // Update user in database
        await this.usersCollection.updateOne(
          { id: user.id },
          { $set: { bookings } }
        );
        
        console.log(`Added ${bookings.length} bookings to user ${user.name}`);
      }
      
      console.log("Successfully seeded bookings");
    } catch (error) {
      console.error("Error seeding bookings:", error);
    }
  }
}

// Create a singleton instance
const mongoSeedService = new MongoSeedService();
export default mongoSeedService;
