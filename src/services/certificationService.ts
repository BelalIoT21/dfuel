import mongoDbService from './mongoDbService';
import { apiService } from './apiService';

const CERTIFICATIONS = {
  LASER_CUTTER: { id: "1", name: "Laser Cutter" },
  ULTIMAKER: { id: "2", name: "Ultimaker" },
  X1_E_CARBON_3D_PRINTER: { id: "3", name: "X1 E Carbon 3D Printer" },
  BAMBU_LAB_X1_E: { id: "4", name: "Bambu Lab X1 E" },
  SAFETY_CABINET: { id: "5", name: "Safety Cabinet" },
  SAFETY_COURSE: { id: "6", name: "Safety Course" },
};

export class CertificationService {
  async addCertification(userId: string, certificationId: string): Promise<boolean> {
    try {
      const success = await mongoDbService.updateUserCertifications(userId, certificationId);
      if (success) return true;

      const apiResponse = await apiService.addCertification(userId, certificationId);
      return apiResponse?.data?.success || false;
    } catch (error) {
      console.error('Error adding certification:', error);
      throw error;
    }
  }

  async removeCertification(userId: string, certificationId: string): Promise<boolean> {
    console.log(`Removing certification ${certificationId} for user ${userId}`);
    try {
      // Try MongoDB first
      const mongoSuccess = await mongoDbService.removeUserCertification(userId, certificationId);
      if (mongoSuccess) return true;

      // Fallback to API
      const apiResponse = await apiService.removeCertification(userId, certificationId);
      return apiResponse?.data?.success || false;
    } catch (error) {
      console.error('Certification removal failed:', error);
      throw error;
    }
  }

  async clearAllCertifications(userId: string): Promise<boolean> {
    try {
      const success = await mongoDbService.clearUserCertifications(userId);
      if (success) return true;

      const apiResponse = await apiService.clearCertifications(userId);
      return apiResponse?.data?.success || false;
    } catch (error) {
      console.error('Error clearing certifications:', error);
      throw error;
    }
  }
}

export const certificationService = new CertificationService();