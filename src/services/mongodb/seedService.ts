
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
  
  async seedUsers(): Promise<void> {
    await this.initCollections();
    if (!this.usersCollection) return;
    
    try {
      const userCount = await this.usersCollection.countDocuments();
      if (userCount > 0) {
        console.log(`${userCount} users already exist in the database, skipping user seeding`);
        return;
      }
      
      console.log("Seeding users...");
      
      const salt = await bcrypt.genSalt(10);
      const adminPassword = await bcrypt.hash('Admin123', salt);
      
      const users: MongoUser[] = [
        {
          id: '1',
          name: 'Administrator',
          email: 'admin@dfuel.com',
          password: adminPassword,
          isAdmin: true,
          certifications: ['1', '2', '3', '4', '5', '6'],
          bookings: [],
          lastLogin: new Date().toISOString()
        },
        {
          id: '2',
          name: 'Regular User',
          email: 'user@dfuel.com',
          password: await bcrypt.hash('password123', salt),
          isAdmin: false,
          certifications: [],
          bookings: [],
          lastLogin: new Date().toISOString()
        }
      ];
      
      await this.usersCollection.insertMany(users);
      console.log(`Successfully seeded ${users.length} users`);
    } catch (error) {
      console.error("Error seeding users:", error);
    }
  }
  
  async seedBookings(): Promise<void> {
    await this.initCollections();
    if (!this.usersCollection) return;
    
    try {
      const users = await this.usersCollection.find().toArray();
      
      if (users.length === 0) {
        console.log("No users found to seed bookings");
        return;
      }
      
      let totalBookings = 0;
      for (const user of users) {
        totalBookings += user.bookings.length;
      }
      
      if (totalBookings > 0) {
        console.log(`${totalBookings} bookings already exist, skipping booking seeding`);
        return;
      }
      
      console.log("Seeding bookings...");
      
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString().split('T')[0];
      
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split('T')[0];
      
      const nextWeek = new Date(now);
      nextWeek.setDate(nextWeek.getDate() + 7);
      const nextWeekStr = nextWeek.toISOString().split('T')[0];
      
      for (const user of users) {
        if (user.id === '1') {
          continue;
        }
        
        const bookings = [];
        
        user.bookings = bookings;
        
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
  
  async ensureAllMachinesHaveCoursesAndQuizzes(): Promise<void> {
    await this.initCollections();
    if (!this.machinesCollection) {
      console.error("Machines collection not initialized");
      return;
    }
    
    try {
      console.log("Ensuring all machines have course and quiz IDs...");
      
      const defaultLinks = {
        '1': { courseId: '5', quizId: '100' },
        '2': { courseId: '2', quizId: '2' },
        '3': { courseId: '3', quizId: '3' },
        '4': { courseId: '4', quizId: '4' },
        '5': { courseId: '5', quizId: '5' },
        '6': { courseId: '6', quizId: '6' }
      };
      
      const machines = await this.machinesCollection.find().toArray();
      
      for (const machine of machines) {
        const machineId = machine._id.toString();
        const link = defaultLinks[machineId] || { courseId: machineId, quizId: machineId };
        
        if (!machine.linkedCourseId || !machine.linkedQuizId) {
          const result = await this.machinesCollection.updateOne(
            { _id: machineId },
            { 
              $set: { 
                linkedCourseId: machine.linkedCourseId || link.courseId,
                linkedQuizId: machine.linkedQuizId || link.quizId
              } 
            }
          );
          
          console.log(`Updated machine ${machineId} with course/quiz links:`, result.modifiedCount > 0 ? 'Success' : 'No change needed');
        }
      }
      
      console.log("All machines now have course and quiz IDs");
    } catch (error) {
      console.error("Error updating machine course/quiz links:", error);
    }
  }
}

const mongoSeedService = new MongoSeedService();
export default mongoSeedService;
