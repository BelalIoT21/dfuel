
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
      console.log(`Adding certification ${certificationId} for user ${userId}`);
      
      // Try MongoDB without fallback to ensure consistency
      const mongoSuccess = await mongoDbService.updateUserCertifications(userId, certificationId);
      console.log(`MongoDB addCertification result: ${mongoSuccess}`);
      
      if (!mongoSuccess) {
        console.error(`Failed to add certification ${certificationId} to user ${userId} in MongoDB`);
      }
      
      return mongoSuccess;
    } catch (error) {
      console.error('Error adding certification:', error);
      throw error;
    }
  }

  async removeCertification(userId: string, certificationId: string): Promise<boolean> {
    console.log(`Removing certification ${certificationId} for user ${userId}`);
    try {
      // Use MongoDB without fallback for consistency
      const mongoSuccess = await mongoDbService.removeUserCertification(userId, certificationId);
      console.log(`MongoDB removeCertification result: ${mongoSuccess}`);
      
      if (!mongoSuccess) {
        console.error(`Failed to remove certification ${certificationId} from user ${userId} in MongoDB`);
      }
      
      return mongoSuccess;
    } catch (error) {
      console.error('Certification removal failed:', error);
      throw error;
    }
  }

  async clearAllCertifications(userId: string): Promise<boolean> {
    try {
      const success = await mongoDbService.clearUserCertifications(userId);
      console.log(`MongoDB clearAllCertifications result: ${success}`);
      
      if (!success) {
        console.error(`Failed to clear certifications for user ${userId} in MongoDB`);
      }
      
      return success;
    } catch (error) {
      console.error('Error clearing certifications:', error);
      throw error;
    }
  }
}

export const certificationService = new CertificationService();
