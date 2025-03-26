
import mongoose from 'mongoose';
import { seedUsers } from './userSeeder';
import { seedAllMachines, ensureMachineImages } from './machineSeeder';
import { seedSafetyCourses } from './courseSeeder';
import { seedSafetyQuizzes } from './quizSeeder';

// Main seeding function to run all seeders
export async function runAllSeeders() {
  try {
    console.log("Running all seeders...");
    
    // Seed users
    await seedUsers();
    
    // Seed machines
    await seedAllMachines();
    
    // Seed safety courses for machines 5 and 6
    await seedSafetyCourses();
    
    // Seed safety quizzes for machines 5 and 6
    await seedSafetyQuizzes();
    
    // Ensure machine images are updated
    await ensureMachineImages();
    
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
