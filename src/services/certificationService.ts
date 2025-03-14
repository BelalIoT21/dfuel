
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
}

// Create a singleton instance
export const certificationService = new CertificationService();

