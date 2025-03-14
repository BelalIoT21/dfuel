
import { apiService } from '../api';
import { localStorageService } from '../localStorageService';
import { BaseService } from './baseService';

/**
 * Service that handles all certification-related database operations.
 */
export class CertificationDatabaseService extends BaseService {
  async addCertification(userId: string, machineId: string): Promise<boolean> {
    try {
      const response = await apiService.certification.addCertification(userId, machineId);
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
}

// Create a singleton instance
export const certificationDatabaseService = new CertificationDatabaseService();
