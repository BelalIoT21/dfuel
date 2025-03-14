
import { apiService } from '../apiService';
import { localStorageService } from '../localStorageService';
import { BaseService } from './baseService';

/**
 * Service that handles all certification-related database operations.
 */
export class CertificationDatabaseService extends BaseService {
  async addCertification(userId: string, machineId: string): Promise<boolean> {
    try {
      // Special handling for safety-cabinet, which may not exist in the database yet
      if (machineId === 'safety-cabinet') {
        console.log('Adding safety cabinet certification directly to localStorage');
        const user = localStorageService.findUserById(userId);
        if (!user) return false;
        
        if (!user.certifications.includes(machineId)) {
          user.certifications.push(machineId);
          return localStorageService.updateUser(userId, { certifications: user.certifications });
        }
        return true; // Already certified
      }
      
      // Normal flow for other machines
      const response = await apiService.addCertification(userId, machineId);
      return response.data?.success || false;
    } catch (error) {
      console.error("API error, falling back to localStorage certification:", error);
      
      // Fallback to localStorage
      const user = localStorageService.findUserById(userId);
      if (!user) return false;
      
      if (!user.certifications.includes(machineId)) {
        user.certifications.push(machineId);
        return localStorageService.updateUser(userId, { certifications: user.certifications });
      }
      
      return true; // Already certified
    }
  }
  
  async addSafetyCourse(userId: string, courseId: string): Promise<boolean> {
    try {
      // Handle safety course via API
      console.log(`Adding safety course ${courseId} for user ${userId}`);
      const response = await apiService.addSafetyCourse(userId, courseId);
      return response.data?.success || false;
    } catch (error) {
      console.error("API error, falling back to localStorage safety course:", error);
      
      // Fallback to localStorage
      const user = localStorageService.findUserById(userId);
      if (!user) return false;
      
      // Initialize safetyCoursesCompleted if it doesn't exist
      if (!user.safetyCoursesCompleted) {
        user.safetyCoursesCompleted = [];
      }
      
      if (!user.safetyCoursesCompleted.includes(courseId)) {
        user.safetyCoursesCompleted.push(courseId);
        return localStorageService.updateUser(userId, { safetyCoursesCompleted: user.safetyCoursesCompleted });
      }
      
      return true; // Already completed
    }
  }
}

// Create a singleton instance
export const certificationDatabaseService = new CertificationDatabaseService();
