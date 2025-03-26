
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
  updateCourseImages 
} from './seeds/courseSeeder';
import { seedQuizzes } from './seeds/quizSeeder';
import { ensureMachineOrder } from './seeds/seedHelpers';

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

      // Get existing machine IDs
      const existingMachines = await Machine.find({}, '_id');
      const existingMachineIds = existingMachines.map(m => m._id);
      
      console.log('Existing machine IDs:', existingMachineIds);
      
      // Define expected machine IDs (1-6)
      const expectedMachineIds = ['1', '2', '3', '4', '5', '6'];
      
      // Check if any expected machine IDs are missing
      const missingMachineIds = expectedMachineIds.filter(id => !existingMachineIds.includes(id));
      
      if (missingMachineIds.length > 0) {
        console.log(`Missing machine IDs: ${missingMachineIds.join(', ')}. Seeding missing machines...`);
        await seedMissingMachines(missingMachineIds);
        
        // After seeding, we need to ensure proper order
        await ensureMachineOrder();
      } else {
        // Update images even if machines exist
        console.log('Updating machine images...');
        await updateMachineImages();
      }

      // Check if we need to seed courses
      if (courseCount === 0) {
        console.log('No courses found. Seeding courses...');
        await seedCourses();
      } else {
        // Update course images even if courses exist
        console.log('Updating course images...');
        await updateCourseImages();
      }

      // Check if we need to seed quizzes
      if (quizCount === 0) {
        console.log('No quizzes found. Seeding quizzes...');
        await seedQuizzes();
      }

      if (userCount > 0 && machineCount > 0 && bookingCount > 0 && courseCount > 0 && quizCount > 0) {
        console.log('Database already seeded. All expected entities present. Checking order...');
        // Always check and fix order even if all machines exist
        await ensureMachineOrder();
        return;
      }

      // If we reach here, something may be missing, ensure it's created
      console.log('Database seeded successfully!');
    } catch (error) {
      console.error('Error seeding database:', error);
      throw error;
    }
  }
}
