
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

      // Ensure IDs are strings
      const stringUserId = userId.toString();
      const stringCertId = certificationId.toString();

      const response = await apiService.post('certifications', {
        userId: stringUserId,
        machineId: stringCertId
      });
      
      console.log("API certification response:", response);
      
      // Both newly added and already had it are considered success
      if (response.data && response.data.success) {
        console.log(`API add certification succeeded for user ${userId}, cert ${certificationId}`);
        return true;
      }
      
      console.error("API certification error:", response.error || "Unknown error");
      return false;
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

      // Ensure IDs are strings
      const stringUserId = userId.toString();
      const stringCertId = certificationId.toString();

      const response = await apiService.delete(`certifications/${stringUserId}/${stringCertId}`);
      
      console.log("API remove certification response:", response);
      
      // Both removed and didn't have it are considered success
      if (response.data && response.data.success) {
        console.log(`API remove certification succeeded for user ${userId}, cert ${certificationId}`);
        return true;
      }
      
      console.error("API certification removal error:", response.error || "Unknown error");
      return false;
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

      const response = await apiService.delete(`certifications/clear/${userId}`);
      
      console.log("API clear certifications response:", response);
      if (response.data && response.data.success) {
        console.log(`API clear certifications succeeded for user ${userId}`);
        return true;
      }
      
      console.error("API clear certifications error:", response.error || "Unknown error");
      return false;
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
      
      const response = await apiService.get(`certifications/user/${userId}`);
      console.log("API get certifications response:", response);
      
      if (response.data && Array.isArray(response.data)) {
        return response.data;
      }
      
      console.error("API get certifications error:", response.error || "Unknown error");
      return [];
    } catch (error) {
      console.error('Error getting certifications:', error);
      return [];
    }
  }

  async checkCertification(userId: string, machineId: string): Promise<boolean> {
    try {
      console.log(`CertificationService: Checking certification for user ${userId}, machine ${machineId}`);
      
      if (!userId || !machineId) {
        console.error('Invalid userId or machineId');
        return false;
      }
      
      const response = await apiService.get(`certifications/check/${userId}/${machineId}`);
      console.log("API check certification response:", response);
      
      return !!response.data; // Convert to boolean
    } catch (error) {
      console.error('Error checking certification:', error);
      return false;
    }
  }
  
  getAllCertifications() {
    return Object.values(CERTIFICATIONS);
  }
}

export const certificationService = new CertificationService();
