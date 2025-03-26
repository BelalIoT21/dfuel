import { Collection } from 'mongodb';
import { MongoUser, MongoMachine, MongoQuiz } from './types';
import mongoConnectionService from './connectionService';
import bcrypt from 'bcryptjs';

class MongoSeedService {
  private usersCollection: Collection<MongoUser> | null = null;
  private machinesCollection: Collection<MongoMachine> | null = null;
  private quizzesCollection: Collection<MongoQuiz> | null = null;
  
  async initCollections(): Promise<void> {
    try {
      if (!this.usersCollection || !this.machinesCollection || !this.quizzesCollection) {
        const db = await mongoConnectionService.connect();
        if (db) {
          this.usersCollection = db.collection<MongoUser>('users');
          this.machinesCollection = db.collection<MongoMachine>('machines');
          this.quizzesCollection = db.collection<MongoQuiz>('quizzes');
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
      // Check if admin user exists
      const adminEmail = process.env.ADMIN_EMAIL || 'admin@dfuel.com';
      const adminUser = await this.usersCollection.findOne({ email: adminEmail });
      
      if (adminUser) {
        console.log(`Admin user ${adminEmail} already exists, skipping admin creation`);
        
        // Ensure admin has all certifications
        if (!adminUser.certifications || adminUser.certifications.length < 6) {
          await this.usersCollection.updateOne(
            { email: adminEmail },
            { $set: { certifications: ['1', '2', '3', '4', '5', '6'] } }
          );
          console.log('Updated admin with all certifications');
        }
        
        // Check for regular users
        const userCount = await this.usersCollection.countDocuments({ isAdmin: { $ne: true } });
        if (userCount > 0) {
          console.log(`${userCount} regular users already exist in the database, skipping user seeding`);
          return;
        }
      } else {
        console.log(`Admin user ${adminEmail} not found. Creating admin user...`);
        
        const salt = await bcrypt.genSalt(10);
        const adminPassword = process.env.ADMIN_PASSWORD || 'Admin123';
        const hashedPassword = await bcrypt.hash(adminPassword, salt);
        
        const admin: MongoUser = {
          id: '1', // Use string ID for consistency
          name: 'Administrator',
          email: adminEmail,
          password: hashedPassword,
          isAdmin: true,
          certifications: ['1', '2', '3', '4', '5', '6'],
          bookings: [],
          lastLogin: new Date().toISOString()
        };
        
        await this.usersCollection.insertOne(admin);
        console.log(`Successfully created admin user: ${adminEmail}`);
      }
      
      // Add a regular user for testing if no regular users exist
      const regularUserCount = await this.usersCollection.countDocuments({ isAdmin: { $ne: true } });
      
      if (regularUserCount === 0) {
        console.log("No regular users found. Creating a test user...");
        
        const salt = await bcrypt.genSalt(10);
        const testUser: MongoUser = {
          id: '2',
          name: 'Regular User',
          email: 'user@dfuel.com',
          password: await bcrypt.hash('password123', salt),
          isAdmin: false,
          certifications: [],
          bookings: [],
          lastLogin: new Date().toISOString()
        };
        
        await this.usersCollection.insertOne(testUser);
        console.log(`Successfully created test user: ${testUser.email}`);
      }
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
  
  async ensureDefaultQuizzesExist(): Promise<void> {
    await this.initCollections();
    if (!this.quizzesCollection) {
      console.error("Quizzes collection not initialized");
      return;
    }
    
    try {
      console.log("Ensuring all default quizzes exist...");
      
      const defaultQuizzes = [
        { _id: '1', title: 'Laser Cutter Certification Quiz' },
        { _id: '2', title: 'Ultimaker Certification Quiz' },
        { _id: '3', title: 'X1 E Carbon 3D Printer Certification' },
        { _id: '4', title: 'Bambu Lab X1 E Certification Quiz' }
      ];
      
      const existingQuizzes = await this.quizzesCollection.find({}, { projection: { _id: 1 } }).toArray();
      const existingQuizIds = existingQuizzes.map(q => q._id.toString());
      
      console.log(`Existing quiz IDs: ${existingQuizIds.join(', ')}`);
      
      for (const quiz of defaultQuizzes) {
        if (!existingQuizIds.includes(quiz._id)) {
          console.log(`Missing quiz ID ${quiz._id}: ${quiz.title}. Please check server-side seeding.`);
        }
      }
      
      console.log("Quiz check complete");
    } catch (error) {
      console.error("Error checking default quizzes:", error);
    }
  }
}

const mongoSeedService = new MongoSeedService();
export default mongoSeedService;
