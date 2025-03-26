
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
import { 
  seedCourses, 
  updateCourseImages,
  checkAndSeedCourses
} from './seeds/courseSeeder';
import { seedQuizzes } from './seeds/quizSeeder';
import { ensureMachineOrder } from './seeds/seedHelpers';
import { createAdminUser } from '../controllers/admin/adminController';

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

      // Get existing course IDs
      const existingCourses = await Course.find({}, '_id');
      const existingCourseIds = existingCourses.map(c => c._id.toString());
      
      console.log('Existing course IDs:', existingCourseIds);
      
      // Define expected course IDs (1-4)
      const expectedCourseIds = ['1', '2', '3', '4'];
      
      // Check if any expected course IDs are missing
      const missingCourseIds = expectedCourseIds.filter(id => !existingCourseIds.includes(id));
      
      if (missingCourseIds.length > 0 || courseCount === 0) {
        console.log(`Missing course IDs: ${missingCourseIds.join(', ')}. Seeding courses...`);
        if (courseCount === 0) {
          await seedCourses();
        } else {
          await checkAndSeedCourses();
        }
      } else {
        // Update course images even if courses exist
        console.log('All expected courses found. Updating course images...');
        await updateCourseImages();
      }

      // Check if we need to seed quizzes
      if (quizCount === 0) {
        console.log('No quizzes found. Seeding quizzes...');
        await seedQuizzes();
      }

      if (userCount > 0 && machineCount > 0 && bookingCount > 0 && courseCount > 0 && quizCount > 0) {
        console.log('Database already seeded. All expected entities present.');
      }

      console.log('Database seeding complete!');
    } catch (error) {
      console.error('Error seeding database:', error);
      throw error;
    }
  }
}
