
import mongoDbService from './mongoDbService';
import { localStorageService } from './localStorageService';

export class CertificationService {
  // Update user certifications
  async addCertification(userId: string, machineId: string): Promise<boolean> {
    try {
      // Try to update in MongoDB first
      const success = await mongoDbService.updateUserCertifications(userId, machineId);
      if (success) return true;
    } catch (error) {
      console.error("Error adding certification in MongoDB:", error);
      // Continue with localStorage if MongoDB fails
    }
    
    return localStorageService.addCertification(userId, machineId);
  }

  // Track safety course completion
  async completeSafetyCourse(userId: string, courseId: string): Promise<boolean> {
    try {
      // Try to update in MongoDB first
      const success = await mongoDbService.completeSafetyCourse(userId, courseId);
      if (success) return true;
    } catch (error) {
      console.error("Error completing safety course in MongoDB:", error);
      // Continue with localStorage if MongoDB fails
    }
    
    // Fallback to localStorage
    const user = localStorageService.findUserById(userId);
    if (!user) return false;
    
    // Initialize safety courses array if it doesn't exist
    if (!user.safetyCoursesCompleted) {
      user.safetyCoursesCompleted = [];
    }
    
    // Add the course if not already completed
    if (!user.safetyCoursesCompleted.includes(courseId)) {
      user.safetyCoursesCompleted.push(courseId);
      return localStorageService.updateUser(userId, { safetyCoursesCompleted: user.safetyCoursesCompleted });
    }
    
    return true; // Course was already completed
  }
}

// Create a singleton instance
export const certificationService = new CertificationService();
