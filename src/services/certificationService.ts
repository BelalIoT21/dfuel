
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
        // Use POST with body instead of params for add operation
        const response = await apiService.post('/certifications', {
          userId,
          machineId: certificationId
        });
        
        console.log("API certification response:", response);
        if (response.data && response.data.success) {
          console.log(`API add certification succeeded for user ${userId}, cert ${certificationId}`);
          return true;
        }
      } catch (error) {
        console.error("API certification error:", error);
      }

      // Use MongoDB as fallback
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

      // Try direct API call first with the correct format
      try {
        // Use the DELETE method with the appropriate URL format
        const response = await apiService.delete(`certifications/${userId}/${certificationId}`);
        
        console.log("API remove certification response:", response);
        if (response.data && response.data.success) {
          console.log(`API remove certification succeeded for user ${userId}, cert ${certificationId}`);
          return true;
        }
      } catch (error) {
        console.error("API certification removal error:", error);
      }

      // Use MongoDB as fallback
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

      // Try API first
      try {
        const response = await apiService.delete(`certifications/clear/${userId}`);
        
        console.log("API clear certifications response:", response);
        if (response.data && response.data.success) {
          console.log(`API clear certifications succeeded for user ${userId}`);
          return true;
        }
      } catch (error) {
        console.error("API clear certifications error:", error);
      }

      // Use MongoDB as fallback
      const success = await mongoDbService.clearUserCertifications(userId);
      console.log(`MongoDB clearAllCertifications result: ${success}`);
      
      return success;
    } catch (error) {
      console.error('Error clearing certifications:', error);
      return false;
    }
  }
  
  async getUserCertifications(userId: string): Promise<string[]> {
    try {
      console.log(`CertificationService: Getting certifications for user ${userId}`);
      
      if (!userId) {
        console.error('Invalid userId');
        return [];
      }
      
      // Try API first
      try {
        const response = await apiService.get(`certifications/user/${userId}`);
        console.log("API get certifications response:", response);
        if (response.data && Array.isArray(response.data)) {
          return response.data;
        }
      } catch (error) {
        console.error("API get certifications error:", error);
      }
      
      // Use MongoDB as fallback
      try {
        const user = await mongoDbService.getUserById(userId);
        return user?.certifications || [];
      } catch (error) {
        console.error("MongoDB get user certifications error:", error);
        return [];
      }
    } catch (error) {
      console.error('Error getting certifications:', error);
      return [];
    }
  }
  
  getAllCertifications() {
    return Object.values(CERTIFICATIONS);
  }
}

export const certificationService = new CertificationService();
