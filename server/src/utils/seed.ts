
import { Machine } from '../models/Machine';
import User from '../models/User';
import { Booking } from '../models/Booking';
import { Course } from '../models/Course';
import { Quiz } from '../models/Quiz';
import dotenv from 'dotenv';

// Import seeders and helpers
import { 
  seedMissingMachines, 
  updateMachineImages, 
  seedAllMachines 
} from './seeds/machineSeeder';
import { seedSafetyCourses, seedAllCourses } from './seeds/courseSeeder';
import { seedSafetyQuizzes, seedAllQuizzes } from './seeds/quizSeeder';
import { ensureMachineOrder } from './seeds/seedHelpers';
import { createAdminUser } from '../controllers/admin/adminController';
import { seedUsers } from './seeds/userSeeder';

dotenv.config();

export class SeedService {
  static async seedDatabase() {
    try {
      console.log('Starting database seeding process...');

      // Check if data already exists
      const userCount = await User.countDocuments();
      const machineCount = await Machine.countDocuments();
      const bookingCount = await Booking.countDocuments();
      const courseCount = await Course.countDocuments();
      const quizCount = await Quiz.countDocuments();

      // Always ensure admin user exists first
      console.log('Ensuring admin user exists...');
      await createAdminUser();

      // Get existing machine IDs
      const existingMachines = await Machine.find({}, '_id');
      const existingMachineIds = existingMachines.map(m => m._id.toString());
      
      console.log('Existing machine IDs:', existingMachineIds);
      
      // Define expected machine IDs (1-6)
      const expectedMachineIds = ['1', '2', '3', '4', '5', '6'];
      
      // Check if any expected machine IDs are missing
      const missingMachineIds = expectedMachineIds.filter(id => !existingMachineIds.includes(id));
      
      if (missingMachineIds.length > 0) {
        console.log(`Missing machine IDs: ${missingMachineIds.join(', ')}. Seeding missing machines...`);
        await seedMissingMachines(missingMachineIds);
      }
      
      // Always update machine images and ensure proper order
      console.log('Updating machine images...');
      await updateMachineImages();
      await ensureMachineOrder();

      // Seed users if needed
      if (userCount === 0) {
        console.log('No users found. Seeding default users...');
        await seedUsers();
      }

      // Seed all courses and quizzes (1-6)
      console.log('Ensuring all courses (1-6) exist...');
      await seedAllCourses();
      
      console.log('Ensuring all quizzes (1-6) exist...');
      await seedAllQuizzes();

      console.log('Database seeding complete!');
    } catch (error) {
      console.error('Error seeding database:', error);
      throw error;
    }
  }
}
