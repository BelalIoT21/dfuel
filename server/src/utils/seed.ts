
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
  restoreDeletedMachines,
  backupMachines
} from './seeds/machineSeeder';
import { 
  seedSafetyCourses, 
  seedAllCourses, 
  restoreDeletedCourses,
  backupCourses 
} from './seeds/courseSeeder';
import { seedSafetyQuizzes, seedAllQuizzes, restoreDeletedQuizzes } from './seeds/quizSeeder';
import { ensureMachineOrder } from './seeds/seedHelpers';
import { createAdminUser } from '../controllers/admin/adminController';
import { seedUsers } from './seeds/userSeeder';

dotenv.config();

export class SeedService {
  static async seedDatabase() {
    try {
      console.log('Starting database setup...');

      // Check if data already exists
      const userCount = await User.countDocuments();
      const machineCount = await Machine.countDocuments();

      // First restore any soft-deleted core entities
      await restoreDeletedMachines();
      await restoreDeletedCourses();
      await restoreDeletedQuizzes();

      // Get existing machine IDs after restoration
      const existingMachines = await Machine.find({}, '_id');
      const existingMachineIds = existingMachines.map(m => m._id.toString());
      
      // Define core machine IDs (1-6)
      const coreMachineIds = ['1', '2', '3', '4', '5', '6'];
      
      // Check if any core machine IDs are missing
      const missingCoreMachineIds = coreMachineIds.filter(id => !existingMachineIds.includes(id));
      
      if (missingCoreMachineIds.length > 0) {
        console.log(`Creating missing core machines: ${missingCoreMachineIds.join(', ')}`);
        await seedMissingMachines(missingCoreMachineIds);
      }
      
      // Update machine images and maintain order
      await updateMachineImages();
      await ensureMachineOrder();

      // Seed users if needed
      if (userCount === 0) {
        console.log('Creating default users');
        await seedUsers();
      }

      // Seed all courses and quizzes if missing
      await seedAllCourses();
      await seedAllQuizzes();
      
      // Create backups
      await backupMachines();
      
      return { success: true };
    } catch (error) {
      console.error('Error seeding database:', error);
      throw error;
    }
  }
  
  // Method to restore deleted machines while preserving their modifications
  static async restoreDeletedMachines() {
    try {
      const restoredCount = await restoreDeletedMachines();
      return { success: true, restoredCount };
    } catch (error) {
      console.error('Error restoring deleted machines:', error);
      return { success: false, error };
    }
  }
  
  // Method to restore deleted courses while preserving their modifications
  static async restoreDeletedCourses() {
    try {
      const restoredCount = await restoreDeletedCourses();
      return { success: true, restoredCount };
    } catch (error) {
      console.error('Error restoring deleted courses:', error);
      return { success: false, error };
    }
  }
  
  // Method to restore deleted quizzes while preserving their modifications
  static async restoreDeletedQuizzes() {
    try {
      const restoredCount = await restoreDeletedQuizzes();
      return { success: true, restoredCount };
    } catch (error) {
      console.error('Error restoring deleted quizzes:', error);
      return { success: false, error };
    }
  }
  
  // Method to backup courses 
  static async backupCourses() {
    try {
      const backedUpCount = await backupCourses();
      return { success: true, backedUpCount };
    } catch (error) {
      console.error('Error backing up courses:', error);
      return { success: false, error };
    }
  }
}
