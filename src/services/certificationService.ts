
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
      console.log(`CertificationService: Adding certification ${certificationId} for user ${userId}`);
      
      if (!userId || !certificationId) {
        console.error('Invalid userId or certificationId');
        return false;
      }

      // Try API first with correct endpoint format
      try {
        const response = await apiService.addCertification(userId, certificationId);
        console.log("API certification response:", response);
        if (response.data && response.data.success) {
          console.log(`API add certification succeeded for user ${userId}, cert ${certificationId}`);
          return true;
        }
      } catch (error) {
        console.error("API certification error:", error);
      }

      // Use MongoDB as source of truth
      const mongoSuccess = await mongoDbService.updateUserCertifications(userId, certificationId);
      console.log(`MongoDB addCertification result: ${mongoSuccess}`);
      
      return mongoSuccess;
    } catch (error) {
      console.error('Error adding certification:', error);
      return false;
    }
  }

  async removeCertification(userId: string, certificationId: string): Promise<boolean> {
    try {
      console.log(`CertificationService: Removing certification ${certificationId} for user ${userId}`);
      
      if (!userId || !certificationId) {
        console.error('Invalid userId or certificationId');
        return false;
      }

      // Try direct API call first with the updated endpoint format
      try {
        const response = await apiService.removeCertification(userId, certificationId);
        console.log("API remove certification response:", response);
        if (response.data && response.data.success) {
          console.log(`API remove certification succeeded for user ${userId}, cert ${certificationId}`);
          return true;
        }
      } catch (error) {
        console.error("API certification removal error:", error);
      }

      // Use MongoDB as source of truth
      const mongoSuccess = await mongoDbService.removeUserCertification(userId, certificationId);
      console.log(`MongoDB removeCertification result: ${mongoSuccess}`);
      
      return mongoSuccess;
    } catch (error) {
      console.error('Certification removal failed:', error);
      return false;
    }
  }

  async clearAllCertifications(userId: string): Promise<boolean> {
    try {
      console.log(`CertificationService: Clearing all certifications for user ${userId}`);
      
      if (!userId) {
        console.error('Invalid userId');
        return false;
      }

      // Try API first with the updated endpoint format
      try {
        const response = await apiService.clearCertifications(userId);
        console.log("API clear certifications response:", response);
        if (response.data && response.data.success) {
          console.log(`API clear certifications succeeded for user ${userId}`);
          return true;
        }
      } catch (error) {
        console.error("API clear certifications error:", error);
      }

      const success = await mongoDbService.clearUserCertifications(userId);
      console.log(`MongoDB clearAllCertifications result: ${success}`);
      
      return success;
    } catch (error) {
      console.error('Error clearing certifications:', error);
      return false;
    }
  }
  
  getAllCertifications() {
    return Object.values(CERTIFICATIONS);
  }
}

export const certificationService = new CertificationService();
