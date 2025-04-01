
import mongoose from 'mongoose';
import { seedUsers } from './userSeeder';
import { seedAllMachines, ensureMachineImages, restoreDeletedMachines, backupMachines } from './machineSeeder';
import { seedSafetyCourses, seedAllCourses, restoreDeletedCourses, backupCourses } from './courseSeeder';
import { seedSafetyQuizzes, seedAllQuizzes, restoreDeletedQuizzes } from './quizSeeder';

// Main seeding function to run all seeders
export async function runAllSeeders() {
  try {
    console.log("Running all seeders...");
    
    // Seed users
    await seedUsers();
    
    // First restore any soft-deleted core machines/courses/quizzes
    await restoreDeletedMachines();
    await restoreDeletedCourses();
    await restoreDeletedQuizzes();
    
    // Seed core machines (but don't overwrite existing ones)
    console.log("Seeding core machines while preserving user modifications...");
    await seedAllMachines();
    
    // Seed safety courses and quizzes
    await seedAllCourses();
    await seedAllQuizzes();
    
    // Ensure machine images are updated
    await ensureMachineImages();
    
    // Backup any entities that don't have backups
    await backupMachines();
    await backupCourses();
    
    console.log("All seeders completed successfully");
    return { success: true };
  } catch (error) {
    console.error("Error running seeders:", error);
    return { success: false, error };
  }
}

// Function to run seeder by name
export async function runSeeder(seederName: string) {
  try {
    console.log(`Running ${seederName} seeder...`);
    
    switch (seederName) {
      case 'users':
        await seedUsers();
        break;
      case 'machines':
        await seedAllMachines();
        break;
      case 'safety-courses':
        await seedSafetyCourses();
        break;
      case 'safety-quizzes':
        await seedSafetyQuizzes();
        break;
      case 'machine-images':
        await ensureMachineImages();
        break;
      case 'restore-machines':
        await restoreDeletedMachines();
        break;
      case 'restore-courses':
        await restoreDeletedCourses();
        break;
      case 'restore-quizzes':
        await restoreDeletedQuizzes();
        break;
      case 'backup-machines':
        await backupMachines();
        break;
      case 'backup-courses':
        await backupCourses();
        break;
      default:
        throw new Error(`Unknown seeder: ${seederName}`);
    }
    
    console.log(`${seederName} seeder completed successfully`);
    return { success: true };
  } catch (error) {
    console.error(`Error running ${seederName} seeder:`, error);
    return { success: false, error };
  }
}
