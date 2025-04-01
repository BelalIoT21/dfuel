
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
  seedAllMachines,
  restoreDeletedMachines 
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
      
      // Define core machine IDs (1-6)
      const coreMachineIds = ['1', '2', '3', '4', '5', '6'];
      
      // Check if any core machine IDs are missing
      const missingCoreMachineIds = coreMachineIds.filter(id => !existingMachineIds.includes(id));
      
      if (missingCoreMachineIds.length > 0) {
        console.log(`Missing core machine IDs: ${missingCoreMachineIds.join(', ')}. Seeding missing machines...`);
        await seedMissingMachines(missingCoreMachineIds);
      } else {
        console.log('All core machines (1-6) are present.');
        
        // Try to restore any machines that might have been deleted
        console.log('Checking for deleted machines to restore...');
        await restoreDeletedMachines();
      }
      
      // Always update machine images for core machines without modifying other properties
      console.log('Gently updating machine images without overwriting user edits...');
      await updateMachineImages();
      await ensureMachineOrder();

      // Seed users if needed
      if (userCount === 0) {
        console.log('No users found. Seeding default users...');
        await seedUsers();
      }

      // Seed all courses and quizzes (1-6) if missing
      console.log('Ensuring all core courses (1-6) exist...');
      await seedAllCourses();
      
      console.log('Ensuring all core quizzes (1-6) exist...');
      await seedAllQuizzes();

      console.log('Database seeding complete!');
    } catch (error) {
      console.error('Error seeding database:', error);
      throw error;
    }
  }
  
  // New method to restore deleted machines without affecting existing ones
  static async restoreDeletedMachines() {
    try {
      console.log('Starting restoration of deleted machines...');
      const restoredCount = await restoreDeletedMachines();
      return { success: true, restoredCount };
    } catch (error) {
      console.error('Error restoring deleted machines:', error);
      return { success: false, error };
    }
  }
}
