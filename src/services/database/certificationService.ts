
import { apiService } from '../apiService';
import { localStorageService } from '../localStorageService';
import { BaseService } from './baseService';

/**
 * Service that handles all certification-related database operations.
 */
export class CertificationDatabaseService extends BaseService {
  async addCertification(userId: string, machineId: string): Promise<boolean> {
    try {
      // For safety course, simply add to user's safety courses completed
      if (machineId === 'safety-course') {
        const user = localStorageService.findUserById(userId);
        if (!user) return false;
        
        if (!user.safetyCoursesCompleted) {
          user.safetyCoursesCompleted = [];
        }
        
        if (!user.safetyCoursesCompleted.includes(machineId)) {
          user.safetyCoursesCompleted.push(machineId);
          return localStorageService.updateUser(userId, { 
            safetyCoursesCompleted: user.safetyCoursesCompleted 
          });
        }
        
        return true; // Already completed
      }
      
      // Normal flow for machines
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
      const user = localStorageService.findUserById(userId);
      if (!user) return false;
      
      if (!user.safetyCoursesCompleted) {
        user.safetyCoursesCompleted = [];
      }
      
      if (!user.safetyCoursesCompleted.includes(courseId)) {
        user.safetyCoursesCompleted.push(courseId);
        return localStorageService.updateUser(userId, { 
          safetyCoursesCompleted: user.safetyCoursesCompleted 
        });
      }
      
      return true; // Already completed
    } catch (error) {
      console.error("Error adding safety course:", error);
      return false;
    }
  }
}

// Create a singleton instance
export const certificationDatabaseService = new CertificationDatabaseService();
